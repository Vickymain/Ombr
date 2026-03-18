import { Link } from '@inertiajs/react';
import { CreditCardIcon, ChartBarIcon, BanknotesIcon, ShieldCheckIcon, DevicePhoneMobileIcon, ChartPieIcon } from '@heroicons/react/24/outline';

function DiamondIcon() {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 border-[1.5px] border-black transform rotate-45" />
            <div className="w-5 h-5 border-[1.5px] border-black transform rotate-45" />
        </div>
    );
}

export default function LearnMore() {
    const features = [
        {
            icon: CreditCardIcon,
            title: 'Multi-Account Management',
            description: 'Connect and manage all your bank accounts, credit cards, and financial accounts in one secure place. Track balances, transactions, and account details effortlessly.',
        },
        {
            icon: ChartBarIcon,
            title: 'Smart Analytics',
            description: 'Get powerful insights into your spending patterns with beautiful charts and graphs. Understand where your money goes and identify opportunities to save.',
        },
        {
            icon: BanknotesIcon,
            title: 'Transaction Tracking',
            description: 'Easily categorize and track all your transactions. Set up automatic categorization rules and keep your finances organized with detailed transaction history.',
        },
        {
            icon: ChartPieIcon,
            title: 'Budget Planning',
            description: "Create and manage budgets for different categories. Set spending limits and get alerts when you're approaching your budget thresholds.",
        },
        {
            icon: ShieldCheckIcon,
            title: 'Bank-Level Security',
            description: 'Your financial data is protected with industry-standard encryption and security measures. We never share your information with third parties without your consent.',
        },
        {
            icon: DevicePhoneMobileIcon,
            title: 'Access Anywhere',
            description: 'Access your financial dashboard from any device. Our responsive design works seamlessly on desktop, tablet, and mobile devices.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF5F0] relative overflow-hidden">
            {/* Organic Background Shapes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
                <path
                    d="M 600 100 Q 650 200 700 350 Q 750 500 700 650 Q 650 800 500 900 Q 350 950 200 850 Q 100 750 150 600 Q 200 450 300 350 Q 400 250 500 200 Q 550 150 600 100 Z"
                    fill="#FFD4C4"
                    opacity="0.6"
                />
                <path
                    d="M 100 200 Q 150 300 100 450 Q 50 600 150 700 Q 250 750 350 650 Q 400 550 350 450 Q 300 350 250 300 Q 200 250 150 250 Q 100 250 100 200 Z"
                    fill="#FFE5D9"
                    opacity="0.5"
                />
            </svg>

            {/* Hero Section */}
            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    {/* Top bar: diamond icon + Net Banking */}
                    <div className="flex items-center gap-3 mb-20">
                        <DiamondIcon />
                        <span className="text-sm font-medium text-black tracking-wide">Net Banking</span>
                    </div>

                    {/* Hero content */}
                    <div className="text-center">
                        <h1
                            className="text-7xl md:text-8xl lg:text-9xl text-black mb-8 leading-[0.95] tracking-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 }}
                        >
                            Welcome to<br />
                            <span className="italic">Ombr</span>
                        </h1>

                        {/* Mantra tagline */}
                        <div className="max-w-2xl mx-auto mb-14">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="h-px w-12 bg-black/30" />
                                <span className="text-xs font-semibold text-black/50 uppercase tracking-[0.3em]">Your finances, unified</span>
                                <div className="h-px w-12 bg-black/30" />
                            </div>
                            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                                One platform to manage every account, track every shilling, and master your money — with clarity, beauty, and control.
                            </p>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-black text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all inline-flex items-center justify-center text-lg font-medium shadow-lg hover:shadow-xl"
                            >
                                Get Started
                                <span className="ml-3 text-xl">&rarr;</span>
                            </Link>
                            <Link
                                href="/login"
                                className="bg-white text-black px-10 py-4 rounded-full border-2 border-black hover:bg-gray-50 transition-all inline-flex items-center justify-center text-lg font-medium"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2
                        className="text-4xl md:text-5xl text-black mb-4"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                    >
                        Everything You Need
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                        Comprehensive tools designed to help you achieve your financial goals
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-[#FF9B7C] rounded-xl flex items-center justify-center mb-6">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-black mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="relative z-10 bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl md:text-5xl text-black mb-4"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                        >
                            Why Choose Ombr?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-[#FF9B7C] mb-4">10+</div>
                            <h3 className="text-2xl font-bold text-black mb-3">Years of Excellence</h3>
                            <p className="text-gray-600">
                                Over a decade of experience in helping people manage their finances effectively and securely.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-[#FF9B7C] mb-4">100%</div>
                            <h3 className="text-2xl font-bold text-black mb-3">Secure</h3>
                            <p className="text-gray-600">
                                Your financial data is protected with bank-level encryption and industry-leading security practices.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-[#FF9B7C] mb-4">24/7</div>
                            <h3 className="text-2xl font-bold text-black mb-3">Access</h3>
                            <p className="text-gray-600">
                                Access your financial dashboard anytime, anywhere, from any device with an internet connection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 bg-gradient-to-r from-[#FF9B7C] to-[#FF8560] py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2
                        className="text-4xl md:text-5xl text-white mb-6"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                    >
                        Ready to Take Control?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
                        Join thousands of users who trust Ombr to manage their financial lives.
                        Get started today &mdash; it&apos;s free and takes less than a minute.
                    </p>
                    <Link
                        href="/register"
                        className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all inline-flex items-center justify-center text-lg font-medium shadow-lg"
                    >
                        Create Your Free Account
                        <span className="ml-3 text-xl">&rarr;</span>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 bg-black py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <DiamondIcon />
                        <span className="text-sm font-medium text-white">Ombr Finance</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
