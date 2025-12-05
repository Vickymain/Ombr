import { useForm, Link } from '@inertiajs/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    // Password validation checks
    const passwordChecks = {
        length: data.password.length >= 8,
        uppercase: /[A-Z]/.test(data.password),
        lowercase: /[a-z]/.test(data.password),
        number: /\d/.test(data.password),
        special: /[@$!%*?&#]/.test(data.password),
    };

    const allPasswordChecksPassed = Object.values(passwordChecks).every(check => check);

    // Name validation (at least two names, each with minimum 2 characters)
    const nameParts = data.name.trim().split(/\s+/).filter(part => part.length > 0);
    const nameIsValid = nameParts.length >= 2 && nameParts.every(part => part.length >= 2);

    // Email validation - only allow valid email providers
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com'];
    const emailParts = data.email.split('@');
    const domain = emailParts[1]?.toLowerCase();
    
    const emailIsValid = data.email.includes('@') && 
                         emailParts.length === 2 &&
                         emailParts[0].length > 0 &&
                         allowedDomains.includes(domain);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-[#FFF5F0] flex">
            {/* Left Section - Promotional Content */}
            <div className="hidden lg:flex lg:w-1/2 relative p-16 overflow-hidden">
                {/* Organic Background Shapes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
                    {/* Large organic blob shape */}
                    <path
                        d="M 600 100 Q 650 200 700 350 Q 750 500 700 650 Q 650 800 500 900 Q 350 950 200 850 Q 100 750 150 600 Q 200 450 300 350 Q 400 250 500 200 Q 550 150 600 100 Z"
                        fill="#FFD4C4"
                        opacity="0.6"
                    />
                    {/* Second organic shape */}
                    <path
                        d="M 100 200 Q 150 300 100 450 Q 50 600 150 700 Q 250 750 350 650 Q 400 550 350 450 Q 300 350 250 300 Q 200 250 150 250 Q 100 250 100 200 Z"
                        fill="#FFE5D9"
                        opacity="0.5"
                    />
                </svg>
                {/* Content - Fixed positioning */}
                <div className="relative z-10 flex flex-col space-y-8">
                    {/* Decorative icon + Years text */}
                    <div className="flex items-start space-x-6">
                        <div className="flex flex-col space-y-1 pt-2">
                            <div className="w-1 h-8 bg-black transform -rotate-12"></div>
                            <div className="w-1 h-8 bg-black transform -rotate-12"></div>
                            <div className="w-1 h-8 bg-black transform -rotate-12"></div>
                        </div>
                        <div>
                            <div className="text-7xl font-bold text-black leading-none mb-2">10</div>
                            <div className="text-sm text-black leading-tight">
                                Years of Excellence<br />In Finance
                            </div>
                        </div>
                    </div>

                    {/* Main branding section */}
                    <div className="space-y-4">
                        <div className="h-px w-16 bg-black"></div>
                        <div className="text-sm text-black font-medium">Net Banking</div>
                        <div>
                            <h1 className="text-7xl font-bold text-black leading-none mb-1">Ombr.</h1>
                            <h2 className="text-7xl font-bold text-black leading-none" style={{ 
                                WebkitTextStroke: '2px black',
                                WebkitTextFillColor: 'transparent'
                            }}>Finance</h2>
                        </div>
                        
                        {/* Decorative diamonds below branding */}
                        <div className="flex space-x-2 pt-6">
                            <div className="w-8 h-8 border-2 border-black transform rotate-45"></div>
                            <div className="w-8 h-8 border-2 border-black transform rotate-45"></div>
                        </div>
                        
                        {/* Learn Now button below diamonds */}
                        <div className="pt-6">
                            <Link href="/learn-more" className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center">
                                Learn Now
                                <span className="ml-3 text-lg">→</span>
                            </Link>
                        </div>
                        
                        {/* Terms & Policy below button */}
                        <div className="pt-6">
                            <div className="flex items-center space-x-3 text-xs text-black">
                                <Link href="/terms" className="hover:underline cursor-pointer">Terms & Conditions</Link>
                                <span>|</span>
                                <Link href="/privacy" className="hover:underline cursor-pointer">Privacy Policy</Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Section - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Register Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
                    <p className="text-sm text-gray-600 mb-8">Join us to start managing your finances</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm text-black mb-2">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : data.name && !nameIsValid ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF9B7C] transition-colors`}
                                    placeholder="John Doe"
                                    required
                                />
                                {data.name && !errors.name && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        {nameIsValid ? (
                                            <div className="bg-[#FF9B7C] rounded-full p-1">
                                                <CheckCircleIcon className="h-4 w-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="bg-red-500 rounded-full p-1">
                                                <XCircleIcon className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            {!errors.name && data.name && !nameIsValid && (
                                <p className="mt-1 text-xs text-gray-500">Please enter at least a first and last name (At least 2 characters per name)</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm text-black mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : data.email && !emailIsValid ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF9B7C] transition-colors`}
                                    placeholder="your@gmail.com"
                                    required
                                />
                                {data.email && !errors.email && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        {emailIsValid ? (
                                            <div className="bg-[#FF9B7C] rounded-full p-1">
                                                <CheckCircleIcon className="h-4 w-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="bg-red-500 rounded-full p-1">
                                                <XCircleIcon className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            {!errors.email && data.email && !emailIsValid && (
                                <p className="mt-1 text-xs text-gray-500">Please enter a valid email</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm text-black mb-2">Create Passcode</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF9B7C] transition-colors`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            
                            {/* Password Requirements */}
                            {(passwordFocused || data.password) && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                                    <p className="font-medium text-gray-700 mb-2">Password must contain:</p>
                                    <div className="flex items-center space-x-2">
                                        {passwordChecks.length ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={passwordChecks.length ? 'text-green-600' : 'text-gray-500'}>
                                            At least 8 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {passwordChecks.uppercase ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                                            One uppercase letter (A-Z)
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {passwordChecks.lowercase ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                                            One lowercase letter (a-z)
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {passwordChecks.number ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={passwordChecks.number ? 'text-green-600' : 'text-gray-500'}>
                                            One number (0-9)
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {passwordChecks.special ? (
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={passwordChecks.special ? 'text-green-600' : 'text-gray-500'}>
                                            One special character (@$!%*?&#)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm text-black mb-2">Confirm Passcode</label>
                            <div className="relative">
                                <input
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF9B7C] transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="text-xs text-black">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-[#FF9B7C] underline hover:text-[#FF8560]">
                                Terms & Conditions
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing || !nameIsValid || !emailIsValid || !allPasswordChecksPassed || data.password !== data.password_confirmation}
                                className="w-full bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Creating Account...' : 'Create Account'}
                                <span className="ml-2">→</span>
                            </button>
                            {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                                <p className="mt-2 text-xs text-red-600 text-center">Passwords do not match</p>
                            )}
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-black">
                                Already have an account?{' '}
                                <Link href="/login" className="text-[#FF9B7C] underline hover:text-[#FF8560] font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
