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

    /**
     * Import transactions from a CSV statement file.
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $user = $request->user();
        $account = $user->accounts()->findOrFail($validated['account_id']);

        $path = $request->file('file')->getRealPath();

        if ($path === false) {
            return back()->withErrors(['file' => 'Unable to read uploaded file.']);
        }

        $handle = fopen($path, 'r');

        if ($handle === false) {
            return back()->withErrors(['file' => 'Unable to open uploaded file.']);
        }

        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);
            return back()->withErrors(['file' => 'The uploaded file appears to be empty.']);
        }

        $header = array_map('strtolower', $header);

        $dateIndex = array_search('date', $header);
        $descriptionIndex = array_search('description', $header);
        $amountIndex = array_search('amount', $header);
        $typeIndex = array_search('type', $header);

        if ($dateIndex === false || $amountIndex === false) {
            fclose($handle);
            return back()->withErrors([
                'file' => 'CSV must include at least "date" and "amount" columns in the header row.',
            ]);
        }

        $createdCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < max($dateIndex, $amountIndex, (int) $descriptionIndex, (int) $typeIndex) + 1) {
                continue;
            }

            $rawDate = $row[$dateIndex] ?? null;
            $rawAmount = $row[$amountIndex] ?? null;

            if ($rawDate === null || $rawAmount === null || $rawDate === '' || $rawAmount === '') {
                continue;
            }

            $amount = (float) str_replace([',', ' '], ['', ''], $rawAmount);

            if ($amount === 0.0) {
                continue;
            }

            $description = $descriptionIndex !== false ? ($row[$descriptionIndex] ?? null) : null;
            $rawType = $typeIndex !== false ? strtolower((string) ($row[$typeIndex] ?? '')) : '';

            $type = 'expense';

            if ($rawType === 'income' || $rawType === 'credit') {
                $type = 'income';
            } elseif ($rawType === 'expense' || $rawType === 'debit') {
                $type = 'expense';
            } elseif ($amount > 0) {
                $type = 'income';
            }

            if ($type === 'expense' && $amount > 0) {
                $signedAmount = $amount;
            } elseif ($type === 'income' && $amount < 0) {
                $signedAmount = -$amount;
            } else {
                $signedAmount = abs($amount);
            }

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'type' => $type,
                'amount' => $signedAmount,
                'category' => 'Imported',
                'description' => $description,
                'transaction_date' => $rawDate,
                'payment_method' => null,
                'reference_number' => null,
                'is_recurring' => false,
                'recurring_frequency' => null,
                'notes' => null,
            ]);

            if ($type === 'income') {
                $account->balance += $transaction->amount;
            } elseif ($type === 'expense') {
                $account->balance -= $transaction->amount;
            }

            $createdCount++;
        }

        fclose($handle);
        $account->save();

        return redirect()
            ->route('transactions.index')
            ->with('success', $createdCount . ' transactions imported successfully.');
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


