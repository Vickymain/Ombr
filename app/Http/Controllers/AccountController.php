<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Notification;
use App\Models\Transaction;
use App\Services\StatementImportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __construct(
        protected StatementImportService $statementImportService,
    ) {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = $user->accounts()->withCount('transactions')->get();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $thisMonthTransactions = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->get();

        $lastMonthTransactions = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])
            ->get();

        $thisMonthIncome = $thisMonthTransactions->where('type', 'income')->sum('amount');
        $thisMonthExpenses = $thisMonthTransactions->where('type', 'expense')->sum('amount');
        $lastMonthIncome = $lastMonthTransactions->where('type', 'income')->sum('amount');
        $lastMonthExpenses = $lastMonthTransactions->where('type', 'expense')->sum('amount');

        $incomeChange = $lastMonthIncome > 0 ? round(($thisMonthIncome - $lastMonthIncome) / $lastMonthIncome * 100, 1) : 0;
        $expenseChange = $lastMonthExpenses > 0 ? round(($thisMonthExpenses - $lastMonthExpenses) / $lastMonthExpenses * 100, 1) : 0;

        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $income = Transaction::where('user_id', $user->id)
                ->where('type', 'income')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount');
            $expenses = Transaction::where('user_id', $user->id)
                ->where('type', 'expense')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount');
            $monthlyData[] = [
                'month' => $month->format('M'),
                'income' => round($income, 2),
                'expenses' => round($expenses, 2),
            ];
        }

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with('account:id,provider,currency')
            ->orderByDesc('transaction_date')
            ->limit(10)
            ->get();

        return Inertia::render('Accounts', [
            'accounts' => $accounts,
            'thisMonthIncome' => round($thisMonthIncome, 2),
            'thisMonthExpenses' => round($thisMonthExpenses, 2),
            'incomeChange' => $incomeChange,
            'expenseChange' => $expenseChange,
            'monthlyData' => $monthlyData,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->findOrFail($id);
        $now = Carbon::now();

        $transactions = Transaction::where('account_id', $account->id)
            ->orderByDesc('transaction_date')
            ->get();

        $thisMonthIncome = $transactions
            ->where('type', 'income')
            ->where('transaction_date', '>=', $now->copy()->startOfMonth())
            ->sum('amount');

        $thisMonthExpenses = $transactions
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $now->copy()->startOfMonth())
            ->sum('amount');

        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $income = $transactions
                ->where('type', 'income')
                ->filter(fn ($t) => Carbon::parse($t->transaction_date)->format('Y-m') === $month->format('Y-m'))
                ->sum('amount');
            $expenses = $transactions
                ->where('type', 'expense')
                ->filter(fn ($t) => Carbon::parse($t->transaction_date)->format('Y-m') === $month->format('Y-m'))
                ->sum('amount');
            $monthlyData[] = [
                'month' => $month->format('M'),
                'income' => round($income, 2),
                'expenses' => round($expenses, 2),
            ];
        }

        $categoryBreakdown = $transactions
            ->where('type', 'expense')
            ->groupBy('category')
            ->map(fn ($group, $cat) => ['name' => $cat, 'value' => round($group->sum('amount'), 2)])
            ->sortByDesc('value')
            ->values()
            ->take(8);

        $budgets = $user->budgets()->where('is_active', true)->get()->map(function ($budget) use ($transactions, $now) {
            $spent = $transactions
                ->where('type', 'expense')
                ->where('category', $budget->category)
                ->where('transaction_date', '>=', $now->copy()->startOfMonth())
                ->sum('amount');
            $budget->spent = round($spent, 2);
            $budget->remaining = round($budget->amount - $spent, 2);
            $budget->progress = $budget->amount > 0 ? round($spent / $budget->amount * 100, 1) : 0;
            return $budget;
        });

        $allAccounts = $user->accounts;

        return Inertia::render('AccountShow', [
            'account' => $account,
            'transactions' => $transactions,
            'thisMonthIncome' => round($thisMonthIncome, 2),
            'thisMonthExpenses' => round($thisMonthExpenses, 2),
            'monthlyData' => $monthlyData,
            'categoryBreakdown' => $categoryBreakdown,
            'budgets' => $budgets,
            'accounts' => $allAccounts,
        ]);
    }

    // Add new account
    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'nullable|string|max:4',
            'account_type' => 'required|string',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string|max:10',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'statement_files' => 'nullable|array|max:5',
            'statement_files.*' => 'file|mimes:csv,txt,pdf',
        ]);

        $validated['user_id'] = $request->user()->id;

        // If statement files were uploaded, validate ALL files first. Do not create the account if any file cannot be read.
        $parsedFiles = [];
        $failedFilenames = [];

        if ($request->hasFile('statement_files')) {
            foreach ($request->file('statement_files') as $file) {
                try {
                    $rows = $this->statementImportService->parseFileToRows($file, $validated['provider']);
                    $parsedFiles[] = ['file' => $file, 'rows' => $rows];
                } catch (\Throwable $e) {
                    $failedFilenames[] = $file->getClientOriginalName();
                }
            }

            $totalFiles = count($parsedFiles) + count($failedFilenames);
            if (count($failedFilenames) > 0) {
                $readable = count($parsedFiles);
                $message = $readable === 0
                    ? 'We could not read any of the statement files. Please check the formats (CSV or PDF) and try again.'
                    : 'We couldn\'t read all files. We could read ' . $readable . ' of ' . $totalFiles . '. The following could not be read: ' . implode(', ', $failedFilenames);
                return redirect()
                    ->route('accounts.index')
                    ->withErrors(['statement_files' => $message]);
            }
        }

        $account = Account::create($validated);

        // Create account connected notification
        Notification::create([
            'user_id' => $request->user()->id,
            'type' => 'account_connected',
            'title' => 'New Account Connected',
            'message' => "Your {$account->provider} account has been successfully connected.",
            'read' => false,
        ]);

        $importedCount = 0;
        foreach ($parsedFiles as $item) {
            $importedCount += $this->statementImportService->importFromRows(
                $item['rows'],
                $request->user(),
                $account,
            );
        }

        $message = 'Account created successfully.';
        if (count($parsedFiles) > 0) {
            $message = $importedCount > 0
                ? "Account created and {$importedCount} transactions imported."
                : 'Account created, but no transactions were found in the statements.';
        }

        return redirect()->route('accounts.index')->with('success', $message);
    }

    // Update an account
    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);

        $validated = $request->validate([
            'provider' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'nullable|string',
            'account_type' => 'required|string',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index');
    }

    // Delete account
    public function destroy($id)
    {
        $account = Account::findOrFail($id);
        $account->delete();

        return redirect()->route('accounts.index');
    }
}
