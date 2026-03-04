<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Notification;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    // Get all accounts
    public function index(Request $request)
    {
        $accounts = $request->user()->accounts;
        
        return Inertia::render('Accounts', [
            'accounts' => $accounts
        ]);
    }

    // Add new account
    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string',
            'account_name' => 'required|string',
            'account_number' => 'nullable|string',
            'account_type' => 'required|string',
            'balance' => 'required|numeric',
            'currency' => 'nullable|string',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'statement_file' => 'nullable|file|mimes:csv,txt',
        ]);

        $validated['user_id'] = $request->user()->id;

        $account = Account::create($validated);

        // Create account connected notification
        Notification::create([
            'user_id' => $request->user()->id,
            'type' => 'account_connected',
            'title' => 'New Account Connected',
            'message' => "Your {$account->provider} account has been successfully connected.",
            'read' => false,
        ]);

        // If a statement file was uploaded, import transactions for this account
        if ($request->hasFile('statement_file')) {
            $file = $request->file('statement_file');
            $path = $file->getRealPath();

            if ($path !== false) {
                $handle = fopen($path, 'r');

                if ($handle !== false) {
                    $header = fgetcsv($handle);

                    if ($header !== false) {
                        $header = array_map('strtolower', $header);

                        $dateIndex = array_search('date', $header);
                        $descriptionIndex = array_search('description', $header);
                        $amountIndex = array_search('amount', $header);
                        $typeIndex = array_search('type', $header);

                        if ($dateIndex !== false && $amountIndex !== false) {
                            $user = $request->user();

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

                                $signedAmount = abs($amount);

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
                            }

                            $account->save();
                        }
                    }

                    fclose($handle);
                }
            }
        }

        return redirect()->route('accounts.index');
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
