import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#FFF5F0] relative overflow-hidden">
            {/* Organic Background Shapes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
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
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/login" 
                        className="inline-flex items-center text-black hover:text-gray-700 mb-6 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Login
                    </Link>
                    <h1 className="text-5xl font-bold text-black mb-4">Terms & Conditions</h1>
                    <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">1. Agreement to Terms</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            By accessing or using Ombr Finance ("the Service"), you agree to be bound by these Terms and Conditions. 
                            If you disagree with any part of these terms, you may not access our full Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">2. Description of Service</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Ombr Finance is a comprehensive financial management platform that allows users to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Track and manage multiple bank accounts and financial accounts</li>
                            <li>Monitor transactions and spending patterns</li>
                            <li>Create and manage budgets</li>
                            <li>View financial analytics and insights</li>
                            <li>Organize transactions by categories</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">3. User Accounts</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            To use our Service, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and update your account information to keep it accurate</li>
                            <li>Maintain the security of your password and identification</li>
                            <li>Accept all responsibility for activities that occur under your account</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">4. Financial Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You understand that Ombr Finance does not have access to your bank accounts or financial institutions credentials. 
                            You are solely responsible for manually entering or connecting your financial data. We use industry-standard 
                            security measures to protect your information, but you acknowledge that no system is completely secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">5. Privacy and Data</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, 
                            which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">6. Prohibited Uses</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">You may not use our Service:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                            <li>To submit false or misleading information</li>
                            <li>To upload or transmit viruses or any other type of malicious code</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            In no event shall Ombr Finance, its directors, employees, partners, agents, suppliers, or affiliates, 
                            be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
                            of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">8. Disclaimer</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, 
                            Ombr excludes all representations, warranties, conditions, and terms. Ombr Finance does not provide 
                            financial, legal, or tax advice. You should consult with qualified professionals for such advice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">9. Changes to Terms</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                            If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. 
                            What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">10. Contact Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about these Terms and Conditions, please contact us at:
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> support@ombrfinance.com<br />
                            <strong>Address:</strong> Ombr, Financial Services Division
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

