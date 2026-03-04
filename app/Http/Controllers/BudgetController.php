<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BudgetController extends Controller
{
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
            $startDate = Carbon::parse($budget->start_date)->startOfDay();
            $endDate = $budget->end_date
                ? Carbon::parse($budget->end_date)->endOfDay()
                : Carbon::now()->endOfDay();

            $spent = $user->transactions()
                ->where('type', 'expense')
                ->where('category', $budget->category)
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount') ?? 0;

            $spent = (float) $spent;
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
            ];
        });

        $totalBalance = $user->accounts->sum('balance');

        return Inertia::render('Budgets', [
            'budgets' => $budgetsWithStats,
            'categories' => $categories,
            'totalBalance' => (float) $totalBalance,
        ]);
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

