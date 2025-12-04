<?php

namespace App\Http\Controllers;

use App\Models\Account;
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
        ]);

        $validated['user_id'] = $request->user()->id;

        $account = Account::create($validated);

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
