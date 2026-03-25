<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Services\AnalyticsExpenseCategoryService;
use App\Services\BudgetSpendingService;
use App\Support\ChartCategoryLabel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        protected BudgetSpendingService $budgetSpending,
        protected AnalyticsExpenseCategoryService $analyticsExpenseCategory,
    ) {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = $user->accounts;
        $selectedAccountId = $request->get('account_id', 'all');
        $period = $request->get('period', '12'); // months to look back

        $txQuery = $user->transactions();

        if ($selectedAccountId !== 'all') {
            $txQuery->where('account_id', $selectedAccountId);
        }

        $totalBalance = $user->accounts->sum('balance');
        $now = Carbon::now();
        $monthsBack = (int) $period;

        // --- Totals ---
        $totalIncome  = (float) ($txQuery->clone()->where('type', 'income')->sum('amount') ?? 0);
        $totalExpenses = (float) ($txQuery->clone()->where('type', 'expense')->sum('amount') ?? 0);
        $netProfit = $totalIncome - $totalExpenses;
        $grossMargin = $totalIncome > 0 ? round(($netProfit / $totalIncome) * 100, 1) : 0;

        // This month
        $thisMonthStart = $now->copy()->startOfMonth();
        $thisMonthEnd   = $now->copy()->endOfMonth();
        $thisMonthIncome   = (float) ($txQuery->clone()->where('type', 'income')->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])->sum('amount') ?? 0);
        $thisMonthExpenses = (float) ($txQuery->clone()->where('type', 'expense')->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd])->sum('amount') ?? 0);

        // Last month
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth();
        $lastMonthIncome   = (float) ($txQuery->clone()->where('type', 'income')->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])->sum('amount') ?? 0);
        $lastMonthExpenses = (float) ($txQuery->clone()->where('type', 'expense')->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])->sum('amount') ?? 0);

        // YTD
        $yearStart = $now->copy()->startOfYear();
        $ytdIncome   = (float) ($txQuery->clone()->where('type', 'income')->whereBetween('transaction_date', [$yearStart, $now])->sum('amount') ?? 0);
        $ytdExpenses = (float) ($txQuery->clone()->where('type', 'expense')->whereBetween('transaction_date', [$yearStart, $now])->sum('amount') ?? 0);

        // --- Monthly trend data (past N months) ---
        $monthlyData = [];
        for ($i = $monthsBack - 1; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end   = $month->copy()->endOfMonth();
            $mQuery = $txQuery->clone()->whereBetween('transaction_date', [$start, $end]);

            $inc = (float) ($mQuery->clone()->where('type', 'income')->sum('amount') ?? 0);
            $exp = (float) ($mQuery->clone()->where('type', 'expense')->sum('amount') ?? 0);
            $net = $inc - $exp;
            $margin = $inc > 0 ? round(($net / $inc) * 100, 1) : 0;

            $monthlyData[] = [
                'month'     => $month->format('M Y'),
                'monthShort' => $month->format('M'),
                'income'    => $inc,
                'expenses'  => $exp,
                'net'       => $net,
                'margin'    => $margin,
            ];
        }

        // Running balance (cumulative net over months)
        $runningBalance = 0;
        $cashFlowData = [];
        for ($i = $monthsBack - 1; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end   = $month->copy()->endOfMonth();
            $mQuery = $txQuery->clone()->whereBetween('transaction_date', [$start, $end]);

            $inc = (float) ($mQuery->clone()->where('type', 'income')->sum('amount') ?? 0);
            $exp = (float) ($mQuery->clone()->where('type', 'expense')->sum('amount') ?? 0);
            $runningBalance += ($inc - $exp);

            $cashFlowData[] = [
                'month'          => $month->format('M Y'),
                'monthShort'     => $month->format('M'),
                'inflow'         => $inc,
                'outflow'        => $exp,
                'net'            => $inc - $exp,
                'closingBalance' => $runningBalance,
            ];
        }

        // --- Category breakdowns (expenses mapped to your category list; imported → keywords) ---
        $expenseCategories = Category::query()
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', $user->id);
            })
            ->whereIn('type', ['expense', 'both'])
            ->orderBy('sort_order')
            ->get();

        [
            'expenseByCategory' => $expenseByCategory,
            'thisMonthCategoryExpenses' => $thisMonthCategoryExpenses,
            'monthlyCategoryData' => $monthlyCategoryData,
            'topExpenseCategories' => $topExpenseCategories,
        ] = $this->buildResolvedExpenseBreakdowns(
            $txQuery,
            $user,
            $expenseCategories,
            $now,
            $monthsBack,
            $thisMonthStart,
            $thisMonthEnd,
        );

        // Income by category (no separate “Uncategorised” slice)
        $incomeByCategory = $this->mergedIncomeByCategoryLabels($txQuery);

        // --- Income/Expense by account (stacked) ---
        $incomeByAccount = [];
        $expenseByAccount = [];
        if ($selectedAccountId === 'all') {
            foreach ($accounts as $acct) {
                $acctIncome = (float) ($user->transactions()
                    ->where('account_id', $acct->id)
                    ->where('type', 'income')
                    ->sum('amount') ?? 0);
                $acctExpense = (float) ($user->transactions()
                    ->where('account_id', $acct->id)
                    ->where('type', 'expense')
                    ->sum('amount') ?? 0);
                $label = $acct->provider . ' - ' . $acct->account_name;
                $incomeByAccount[]  = ['name' => $label, 'value' => $acctIncome];
                $expenseByAccount[] = ['name' => $label, 'value' => $acctExpense];
            }
        }

        // --- Account distribution ---
        $accountDistribution = $accounts->map(fn($a) => [
            'name'  => $a->provider . ' - ' . $a->account_name,
            'value' => (float) $a->balance,
        ])->toArray();

        // Balance by currency
        $balanceByCurrency = $accounts->groupBy('currency')->map(fn($group, $cur) => [
            'name'  => $cur ?: 'KES',
            'value' => (float) $group->sum('balance'),
        ])->values()->toArray();

        // --- Daily trends (last 30 days) ---
        $dailyData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dQuery = $txQuery->clone()->whereDate('transaction_date', $date);
            $dailyData[] = [
                'date'     => $date->format('M d'),
                'income'   => (float) ($dQuery->clone()->where('type', 'income')->sum('amount') ?? 0),
                'expenses' => (float) ($dQuery->clone()->where('type', 'expense')->sum('amount') ?? 0),
            ];
        }

        // --- Financial ratios ---
        $avgMonthlyExpenses = $monthsBack > 0 ? $totalExpenses / $monthsBack : 0;
        $cashRunwayMonths = $avgMonthlyExpenses > 0 ? round($totalBalance / $avgMonthlyExpenses, 1) : 0;
        $savingsRate = $totalIncome > 0 ? round((($totalIncome - $totalExpenses) / $totalIncome) * 100, 1) : 0;
        $expenseRatio = $totalIncome > 0 ? round(($totalExpenses / $totalIncome) * 100, 1) : 0;
        $avgMonthlyIncome = $monthsBack > 0 ? round($totalIncome / $monthsBack, 0) : 0;
        $avgMonthlyExpensesRound = $monthsBack > 0 ? round($totalExpenses / $monthsBack, 0) : 0;

        // Income change %
        $incomeChange = $lastMonthIncome > 0 ? round((($thisMonthIncome - $lastMonthIncome) / $lastMonthIncome) * 100, 1) : 0;
        $expenseChange = $lastMonthExpenses > 0 ? round((($thisMonthExpenses - $lastMonthExpenses) / $lastMonthExpenses) * 100, 1) : 0;

        // --- P&L Statement table ---
        $plStatement = [
            ['label' => 'Revenue (Income)', 'mtd' => $thisMonthIncome, 'lastMonth' => $lastMonthIncome, 'ytd' => $ytdIncome],
            ['label' => 'Direct Costs (Expenses)', 'mtd' => $thisMonthExpenses, 'lastMonth' => $lastMonthExpenses, 'ytd' => $ytdExpenses],
            ['label' => 'Net Profit / (Loss)', 'mtd' => $thisMonthIncome - $thisMonthExpenses, 'lastMonth' => $lastMonthIncome - $lastMonthExpenses, 'ytd' => $ytdIncome - $ytdExpenses],
        ];

        // --- Budget vs actual ---
        $budgets = $user->budgets ?? collect();
        $budgetVsActual = $budgets->map(function ($budget) use ($txQuery) {
            $spent = $this->budgetSpending->sumSpent($txQuery, $budget);
            $budgeted = (float) $budget->amount;

            return [
                'category'  => $budget->category,
                'budgeted'  => $budgeted,
                'spent'     => $spent,
                'remaining' => max(0, $budgeted - $spent),
                'progress'  => $budgeted > 0 ? round(($spent / $budgeted) * 100, 1) : 0,
                'period_label' => $this->budgetSpending->periodLabel($budget),
            ];
        })->toArray();

        return Inertia::render('Analytics', [
            'accounts'             => $accounts,
            'selectedAccountId'    => $selectedAccountId,
            'period'               => $period,
            'totalBalance'         => $totalBalance,
            'totalIncome'          => $totalIncome,
            'totalExpenses'        => $totalExpenses,
            'netProfit'            => $netProfit,
            'grossMargin'          => $grossMargin,
            'thisMonthIncome'      => $thisMonthIncome,
            'thisMonthExpenses'    => $thisMonthExpenses,
            'lastMonthIncome'      => $lastMonthIncome,
            'lastMonthExpenses'    => $lastMonthExpenses,
            'ytdIncome'            => $ytdIncome,
            'ytdExpenses'          => $ytdExpenses,
            'incomeChange'         => $incomeChange,
            'expenseChange'        => $expenseChange,
            'monthlyData'          => $monthlyData,
            'cashFlowData'         => $cashFlowData,
            'expenseByCategory'    => $expenseByCategory,
            'incomeByCategory'     => $incomeByCategory,
            'thisMonthCategoryExpenses' => $thisMonthCategoryExpenses,
            'monthlyCategoryData'  => $monthlyCategoryData,
            'topExpenseCategories' => $topExpenseCategories,
            'incomeByAccount'      => $incomeByAccount,
            'expenseByAccount'     => $expenseByAccount,
            'accountDistribution'  => $accountDistribution,
            'balanceByCurrency'    => $balanceByCurrency,
            'dailyData'            => $dailyData,
            'cashRunwayMonths'     => $cashRunwayMonths,
            'savingsRate'          => $savingsRate,
            'expenseRatio'         => $expenseRatio,
            'avgMonthlyIncome'     => $avgMonthlyIncome,
            'avgMonthlyExpenses'   => $avgMonthlyExpensesRound,
            'plStatement'          => $plStatement,
            'budgetVsActual'       => $budgetVsActual,
        ]);
    }

    /**
     * Single pass over expenses: totals by resolved category, this month slice, and stacked-by-month chart data.
     *
     * @return array{
     *     expenseByCategory: list<array{name: string, value: float}>,
     *     thisMonthCategoryExpenses: list<array{name: string, value: float}>,
     *     monthlyCategoryData: list<array<string, mixed>>,
     *     topExpenseCategories: list<string>
     * }
     */
    private function buildResolvedExpenseBreakdowns(
        $txQuery,
        $user,
        Collection $expenseCategories,
        Carbon $now,
        int $monthsBack,
        Carbon $thisMonthStart,
        Carbon $thisMonthEnd,
    ): array {
        $service = $this->analyticsExpenseCategory;
        $allTime = [];
        $thisMonthBuckets = [];
        $monthly = [];

        $rangeStart = $now->copy()->subMonths($monthsBack - 1)->startOfMonth()->startOfDay();
        $rangeEnd = $now->copy()->endOfMonth()->endOfDay();

        $txQuery->clone()
            ->where('type', 'expense')
            ->orderBy('id')
            ->select(['id', 'category', 'description', 'amount', 'transaction_date'])
            ->chunkById(500, function ($chunk) use (
                $service,
                $user,
                $expenseCategories,
                &$allTime,
                &$thisMonthBuckets,
                &$monthly,
                $thisMonthStart,
                $thisMonthEnd,
                $rangeStart,
                $rangeEnd,
            ) {
                foreach ($chunk as $tx) {
                    $label = ChartCategoryLabel::foldGenericSlices(
                        $service->displayLabelForExpense($tx, $user, $expenseCategories)
                    );
                    $amt = (float) $tx->amount;
                    $allTime[$label] = ($allTime[$label] ?? 0) + $amt;

                    $d = Carbon::parse($tx->transaction_date)->startOfDay();
                    $monthLo = $thisMonthStart->copy()->startOfDay();
                    $monthHi = $thisMonthEnd->copy()->endOfDay();
                    if ($d->greaterThanOrEqualTo($monthLo) && $d->lessThanOrEqualTo($monthHi)) {
                        $thisMonthBuckets[$label] = ($thisMonthBuckets[$label] ?? 0) + $amt;
                    }
                    if ($d->greaterThanOrEqualTo($rangeStart) && $d->lessThanOrEqualTo($rangeEnd)) {
                        $mk = $d->format('M Y');
                        if (! isset($monthly[$mk])) {
                            $monthly[$mk] = [];
                        }
                        $monthly[$mk][$label] = ($monthly[$mk][$label] ?? 0) + $amt;
                    }
                }
            });

        $expenseByCategory = collect($allTime)
            ->map(fn ($v, $k) => ['name' => (string) $k, 'value' => (float) $v])
            ->sortByDesc('value')
            ->values()
            ->all();

        $thisMonthCategoryExpenses = collect($thisMonthBuckets)
            ->map(fn ($v, $k) => ['name' => (string) $k, 'value' => (float) $v])
            ->sortByDesc('value')
            ->values()
            ->all();

        $topExpenseCategories = array_slice(array_column($expenseByCategory, 'name'), 0, 6);

        $monthlyCategoryData = [];
        for ($i = $monthsBack - 1; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $mk = $month->format('M Y');
            $row = ['month' => $mk, 'monthShort' => $month->format('M')];
            $labelTotals = $monthly[$mk] ?? [];
            foreach ($topExpenseCategories as $cat) {
                $row[$cat] = (float) ($labelTotals[$cat] ?? 0);
            }
            $otherTotal = 0.0;
            foreach ($labelTotals as $lbl => $val) {
                if (! in_array($lbl, $topExpenseCategories, true)) {
                    $otherTotal += (float) $val;
                }
            }
            $row['Others'] = $otherTotal;
            $monthlyCategoryData[] = $row;
        }

        return [
            'expenseByCategory' => $expenseByCategory,
            'thisMonthCategoryExpenses' => $thisMonthCategoryExpenses,
            'monthlyCategoryData' => $monthlyCategoryData,
            'topExpenseCategories' => $topExpenseCategories,
        ];
    }

    /**
     * @return list<array{name: string, value: float}>
     */
    private function mergedIncomeByCategoryLabels($txQuery): array
    {
        $rows = $txQuery->clone()
            ->where('type', 'income')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $merged = [];
        foreach ($rows as $item) {
            $name = ChartCategoryLabel::foldGenericSlices((string) ($item->category ?? ''));
            $merged[$name] = ($merged[$name] ?? 0) + (float) $item->total;
        }

        return collect($merged)
            ->map(fn ($v, $k) => ['name' => (string) $k, 'value' => (float) $v])
            ->sortByDesc('value')
            ->values()
            ->all();
    }
}
