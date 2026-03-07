<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Notification;
use App\Services\StatementImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function __construct(
        protected StatementImportService $statementImportService,
    ) {
    }
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
