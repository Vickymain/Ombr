<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = $user->accounts;
        
        // Get recent transactions (last 10)
        $recentTransactions = $user->transactions()
            ->with('account')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Get monthly data for last 6 months
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startDate = $month->copy()->startOfMonth();
            $endDate = $month->copy()->endOfMonth();

            $income = $user->transactions()
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount') ?? 0;

            $expenses = $user->transactions()
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount') ?? 0;

            $monthlyData[] = [
                'month' => $month->format('M'),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
            ];
        }

        // Get spending by category (this month)
        $categoryData = $user->transactions()
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

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'recentTransactions' => $recentTransactions,
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
        ]);
    }
}


