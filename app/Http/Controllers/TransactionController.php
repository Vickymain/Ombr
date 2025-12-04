<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    // Get all transactions
    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()
            ->with('account')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        $accounts = $request->user()->accounts;
        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('Transactions', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    // Add new transaction
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $transaction = Transaction::create($validated);

        // Update account balance
        $account = Account::findOrFail($validated['account_id']);
        if ($validated['type'] === 'income') {
            $account->balance += $validated['amount'];
        } elseif ($validated['type'] === 'expense') {
            $account->balance -= $validated['amount'];
        }
        $account->save();

        return redirect()->route('transactions.index');
    }

    // Update a transaction
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Reverse the old transaction effect on balance
        $oldAccount = Account::findOrFail($transaction->account_id);
        if ($transaction->type === 'income') {
            $oldAccount->balance -= $transaction->amount;
        } elseif ($transaction->type === 'expense') {
            $oldAccount->balance += $transaction->amount;
        }
        $oldAccount->save();

        // Update transaction
        $transaction->update($validated);

        // Apply new transaction effect on balance
        $newAccount = Account::findOrFail($validated['account_id']);
        if ($validated['type'] === 'income') {
            $newAccount->balance += $validated['amount'];
        } elseif ($validated['type'] === 'expense') {
            $newAccount->balance -= $validated['amount'];
        }
        $newAccount->save();

        return redirect()->route('transactions.index');
    }

    // Delete transaction
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        
        // Reverse the transaction effect on balance
        $account = Account::findOrFail($transaction->account_id);
        if ($transaction->type === 'income') {
            $account->balance -= $transaction->amount;
        } elseif ($transaction->type === 'expense') {
            $account->balance += $transaction->amount;
        }
        $account->save();

        $transaction->delete();

        return redirect()->route('transactions.index');
    }
}


