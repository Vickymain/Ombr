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

        // Pick the latest transaction from each account (max 5 accounts)
        $latestTransactions = collect();
        foreach ($accounts->take(5) as $account) {
            $tx = $user->transactions()
                ->where('account_id', $account->id)
                ->with('account')
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();
            if ($tx) {
                $latestTransactions->push($tx);
            }
        }
        // Sort by date desc, take 5
        $latestTransactions = $latestTransactions
            ->sortByDesc('transaction_date')
            ->values()
            ->take(5);

        // Also get recent 10 for the full list section
        $recentTransactions = $user->transactions()
            ->with('account')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // All unique transaction names/counterparties for search suggestions
        $searchSuggestions = $user->transactions()
            ->with('account')
            ->orderBy('transaction_date', 'desc')
            ->take(200)
            ->get()
            ->map(function ($t) {
                return [
                    'description' => $t->description,
                    'category' => $t->category,
                    'account_name' => $t->account?->account_name,
                    'provider' => $t->account?->provider,
                ];
            })
            ->flatMap(function ($item) {
                return array_filter(array_values($item));
            })
            ->unique()
            ->values()
            ->take(50)
            ->toArray();

        // Monthly data for last 6 months
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();
            $monthlyData[] = [
                'month' => $month->format('M'),
                'income' => (float) ($user->transactions()->where('type', 'income')->whereBetween('transaction_date', [$start, $end])->sum('amount') ?? 0),
                'expenses' => (float) ($user->transactions()->where('type', 'expense')->whereBetween('transaction_date', [$start, $end])->sum('amount') ?? 0),
            ];
        }

        // Spending by category (this month)
        $categoryData = $user->transactions()
            ->where('type', 'expense')
            ->whereMonth('transaction_date', Carbon::now()->month)
            ->whereYear('transaction_date', Carbon::now()->year)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get()
            ->map(fn($item) => ['name' => $item->category, 'value' => (float) $item->total])
            ->toArray();

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'latestTransactions' => $latestTransactions,
            'recentTransactions' => $recentTransactions,
            'searchSuggestions' => $searchSuggestions,
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
        ]);
    }
}
