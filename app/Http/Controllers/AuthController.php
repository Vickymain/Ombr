<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Show Register Page
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    // Handle Registration
    public function register(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z]{2,}\s+[a-zA-Z]{2,}.*$/' // At least two names, each with minimum 2 characters
            ],
            'email' => [
                'required',
                'email:rfc,dns',
                'unique:users,email',
                function ($attribute, $value, $fail) {
                    // Only allow specific email domains
                    $allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com'];
                    $parts = explode('@', $value);
                    
                    if (count($parts) !== 2 || empty($parts[0])) {
                        $fail('Please enter a valid email address.');
                        return;
                    }
                    
                    $domain = strtolower($parts[1]);
                    
                    if (!in_array($domain, $allowedDomains)) {
                        $fail('Please enter a valid email address from an allowed domain.');
                    }
                },
            ],
            'password' => [
                'required',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/' // Strong password
            ]
        ], [
            'name.regex' => 'Full name must contain at least first name and last name, each with at least 2 characters.',
            'email.email' => 'Only @gmail.com and @yahoo.com email addresses are allowed.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    // Show Login Page
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    // Handle Login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => [
                'required',
                'email',
                function ($attribute, $value, $fail) {
                    // Only allow specific email domains (same as Register)
                    $allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com'];
                    $parts = explode('@', $value);
                    
                    if (count($parts) !== 2 || empty($parts[0])) {
                        $fail('Please enter a valid email address.');
                        return;
                    }
                    
                    $domain = strtolower($parts[1]);
                    
                    if (!in_array($domain, $allowedDomains)) {
                        $fail('Please enter a valid email address from an allowed domain.');
                    }
                },
            ],
            'password' => 'required'
        ]);

        // Check if user exists with this email
        $user = User::where('email', $request->email)->first();

        if ($user) {
            // User exists, check password
            if (Auth::attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();
                return redirect()->intended('dashboard');
            } else {
                // Email is correct but password is wrong
                return back()->withErrors([
                    'password' => 'The password is incorrect.',
                ])->onlyInput('email');
            }
        } else {
            // User doesn't exist
            return back()->withErrors([
                'email' => "Credentials don't match our records.",
            ])->onlyInput('email');
        }
    }

    // Handle Logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login');
    }
}
