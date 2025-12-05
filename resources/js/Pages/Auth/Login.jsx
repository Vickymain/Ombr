import { useForm, Link } from '@inertiajs/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    // Email validation - only allow specific domains (same as Register)
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com'];
    const emailParts = data.email.split('@');
    const domain = emailParts[1]?.toLowerCase();
    
    const emailIsValid = data.email.includes('@') && 
                         emailParts.length === 2 &&
                         emailParts[0].length > 0 &&
                         allowedDomains.includes(domain);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
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

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-black mb-8">Login Now</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm text-black mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full px-4 py-3 pr-12 border ${errors.email ? 'border-red-300' : data.email && !emailIsValid ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF9B7C] transition-colors`}
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
                            <label className="block text-sm text-black mb-2">Enter Passcode</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
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
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-4 w-4 text-black focus:ring-[#FF9B7C] border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-black">
                                Remember me
                            </label>
                        </div>

                        {/* Terms */}
                        <div className="text-xs text-black">
                            By login, you agree to our{' '}
                            <Link href="/terms" className="text-[#FF9B7C] underline hover:text-[#FF8560]">
                                Terms & Conditions
                            </Link>
                        </div>

                        {/* Submit Button & Forgot Link */}
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Logging in...' : 'Login Now'}
                                <span className="ml-2">→</span>
                            </button>
                            <a href="#" className="text-sm text-black underline hover:text-gray-600">
                                Forgot Passcode
                            </a>
                        </div>

                        {/* Register Link */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-black">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-[#FF9B7C] underline hover:text-[#FF8560] font-medium">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
