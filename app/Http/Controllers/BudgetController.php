<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\UserCategoryKeyword;
use App\Services\BudgetSpendingService;
use App\Support\CategoryNormalizer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function __construct(
        protected BudgetSpendingService $budgetSpending,
    ) {
    }

    /**
     * Display a listing of the user's budgets with progress.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $budgets = $user->budgets()
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::orderBy('sort_order')->get();

        $budgetsWithStats = $budgets->map(function (Budget $budget) use ($user) {
            $spent = $this->budgetSpending->sumSpent($user->transactions(), $budget);

            $amount = (float) $budget->amount;
            $remaining = max(0, $amount - $spent);
            $progress = $amount > 0 ? min(100, round(($spent / $amount) * 100, 1)) : 0;

            return [
                'id' => $budget->id,
                'category' => $budget->category,
                'amount' => $amount,
                'period' => $budget->period,
                'start_date' => optional($budget->start_date)->toDateString(),
                'end_date' => optional($budget->end_date)->toDateString(),
                'is_active' => (bool) $budget->is_active,
                'alert_enabled' => (bool) $budget->alert_enabled,
                'alert_threshold' => (int) $budget->alert_threshold,
                'spent' => $spent,
                'remaining' => $remaining,
                'progress' => $progress,
                'spent_period_label' => $this->budgetSpending->periodLabel($budget),
            ];
        });

        $keyToCategoryLabel = [];
        foreach ($categories as $c) {
            if (! in_array($c->type, ['expense', 'both'], true)) {
                continue;
            }
            $keyToCategoryLabel[CategoryNormalizer::canonical($c->name)] = $c->icon
                ? trim($c->icon.' '.$c->name)
                : $c->name;
        }

        $categoryKeywords = $user->userCategoryKeywords()
            ->orderBy('category_key')
            ->orderBy('keyword')
            ->get()
            ->map(static function (UserCategoryKeyword $k) use ($keyToCategoryLabel) {
                return [
                    'id' => $k->id,
                    'category_key' => $k->category_key,
                    'keyword' => $k->keyword,
                    'category_label' => $keyToCategoryLabel[$k->category_key] ?? $k->category_key,
                ];
            });

        $totalBalance = $user->accounts->sum('balance');

        return Inertia::render('Budgets', [
            'budgets' => $budgetsWithStats,
            'categories' => $categories,
            'totalBalance' => (float) $totalBalance,
            'categoryKeywords' => $categoryKeywords,
        ]);
    }

    /**
     * Display one budget with period stats and matching transactions.
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $budget = $user->budgets()->findOrFail($id);

        [$start, $end] = $this->budgetSpending->periodWindow($budget);

        $txQuery = Transaction::query()
            ->where('user_id', $user->id)
            ->with('account:id,provider,account_name,currency')
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()]);

        $this->budgetSpending->applyBudgetCategoryScope($txQuery, $budget);

        $transactions = $txQuery
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->get();

        $spent = (float) ($transactions->sum('amount') ?? 0);
        $budgetAmount = (float) $budget->amount;
        $remaining = max(0, $budgetAmount - $spent);
        $progress = $budgetAmount > 0 ? min(100, round(($spent / $budgetAmount) * 100, 1)) : 0;
        $overAmount = max(0, $spent - $budgetAmount);

        return Inertia::render('BudgetShow', [
            'budget' => [
                'id' => $budget->id,
                'category' => $budget->category,
                'amount' => $budgetAmount,
                'period' => $budget->period,
                'start_date' => optional($budget->start_date)->toDateString(),
                'end_date' => optional($budget->end_date)->toDateString(),
                'spent' => $spent,
                'remaining' => $remaining,
                'progress' => $progress,
                'over_amount' => $overAmount,
                'period_label' => $this->budgetSpending->periodLabel($budget),
            ],
            'transactions' => $transactions,
            'totalBalance' => (float) $user->accounts->sum('balance'),
        ]);
    }

    /**
     * Store a personal description substring so imported/uncategorised rows can count toward a budget category.
     */
    public function storeCategoryKeyword(Request $request)
    {
        $user = $request->user();
        $validNames = Category::query()
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', $user->id);
            })
            ->whereIn('type', ['expense', 'both'])
            ->pluck('name')
            ->all();

        $validated = $request->validate([
            'category' => ['required', 'string', Rule::in($validNames)],
            'keyword' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        $keyword = mb_strtolower(trim($validated['keyword']));
        $targetCategory = $validated['category'];

        UserCategoryKeyword::firstOrCreate([
            'user_id' => $user->id,
            'category_key' => CategoryNormalizer::canonical($targetCategory),
            'keyword' => $keyword,
        ]);

        // Retroactively recategorize matching expense rows so budgeting and transaction views align immediately.
        Transaction::query()
            ->where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereNotNull('description')
            ->whereRaw('LOWER(description) LIKE ?', ['%' . $keyword . '%'])
            ->update(['category' => $targetCategory]);

        return redirect()->route('budgets.index');
    }

    public function destroyCategoryKeyword(Request $request, int $id)
    {
        $row = UserCategoryKeyword::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $row->delete();

        return redirect()->route('budgets.index');
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|in:weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'alert_enabled' => 'boolean',
            'alert_threshold' => 'integer|min:0|max:100',
        ]);

        $validated['user_id'] = $request->user()->id;

        Budget::create($validated);

        return redirect()->route('budgets.index');
    }

    /**
     * Update the specified budget.
     */
    public function update(Request $request, int $id)
    {
        $budget = $request->user()->budgets()->findOrFail($id);

        $validated = $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|in:weekly,monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'alert_enabled' => 'boolean',
            'alert_threshold' => 'integer|min:0|max:100',
        ]);

        $budget->update($validated);

        return redirect()->route('budgets.index');
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Request $request, int $id)
    {
        $budget = $request->user()->budgets()->findOrFail($id);
        $budget->delete();

        return redirect()->route('budgets.index');
    }
}

