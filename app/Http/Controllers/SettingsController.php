<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = $user->accounts;
        $totalBalance = $accounts->sum('balance');

        return Inertia::render('Settings', [
            'accounts' => $accounts,
            'totalBalance' => (float) $totalBalance,
            'twoFactorEnabled' => (bool) $user->two_factor_enabled,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function toggleTwoFactor(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = !$user->two_factor_enabled;
        $user->save();

        $status = $user->two_factor_enabled ? 'enabled' : 'disabled';
        return back()->with('success', "Two-factor authentication {$status}.");
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        auth()->logout();
        $user->transactions()->delete();
        $user->budgets()->delete();
        $user->accounts()->delete();
        $user->notifications()->delete();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
