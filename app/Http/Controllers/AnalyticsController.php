<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = $user->accounts;
        $selectedAccountId = $request->get('account_id', 'all');
        
        // Base query for transactions
        $transactionQuery = $user->transactions();
        
        // Filter by account if specific account is selected
        if ($selectedAccountId !== 'all') {
            $transactionQuery->where('account_id', $selectedAccountId);
        }
        
        // Calculate totals - totalBalance always from all accounts for sidebar
        $totalBalance = $user->accounts->sum('balance');
        $totalIncome = $transactionQuery->clone()->where('type', 'income')->sum('amount') ?? 0;
        $totalExpenses = $transactionQuery->clone()->where('type', 'expense')->sum('amount') ?? 0;
        $totalInvestments = $user->accounts->where('account_type', 'investment')->sum('balance');
        
        // Get monthly data for last 6 months
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startDate = $month->copy()->startOfMonth();
            $endDate = $month->copy()->endOfMonth();

            $monthQuery = $transactionQuery->clone()
                ->whereBetween('transaction_date', [$startDate, $endDate]);

            $income = (float) $monthQuery->clone()->where('type', 'income')->sum('amount') ?? 0;
            $expenses = (float) $monthQuery->clone()->where('type', 'expense')->sum('amount') ?? 0;

            $monthlyData[] = [
                'month' => $month->format('M'),
                'income' => $income,
                'expenses' => $expenses,
            ];
        }

        // Get spending by category (this month)
        $categoryData = $transactionQuery->clone()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', Carbon::now()->month)
            ->whereYear('transaction_date', Carbon::now()->year)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category,
                    'value' => (float) $item->total,
                ];
            })
            ->toArray();

        // Get account distribution
        $accountDistribution = $accounts->map(function ($account) {
            return [
                'name' => $account->provider . ' - ' . $account->account_name,
                'value' => (float) $account->balance,
            ];
        })->toArray();

        // Get transaction trends (daily for last 30 days)
        $dailyData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayQuery = $transactionQuery->clone()
                ->whereDate('transaction_date', $date);

            $income = (float) $dayQuery->clone()->where('type', 'income')->sum('amount') ?? 0;
            $expenses = (float) $dayQuery->clone()->where('type', 'expense')->sum('amount') ?? 0;

            $dailyData[] = [
                'date' => $date->format('M d'),
                'income' => $income,
                'expenses' => $expenses,
            ];
        }

        return Inertia::render('Analytics', [
            'accounts' => $accounts,
            'selectedAccountId' => $selectedAccountId,
            'totalBalance' => $totalBalance,
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'totalInvestments' => $totalInvestments,
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
            'accountDistribution' => $accountDistribution,
            'dailyData' => $dailyData,
        ]);
    }
}

