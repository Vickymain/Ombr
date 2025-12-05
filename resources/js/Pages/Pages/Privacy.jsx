import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Privacy() {
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
                    <h1 className="text-5xl font-bold text-black mb-4">Privacy Policy</h1>
                    <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            At Ombr, we are committed to protecting your privacy. This Privacy Policy 
                            explains how we collect, use, disclose, and safeguard your information when you use our financial management 
                            platform. Please read this privacy policy carefully.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">2. Information We Collect</h2>
                        
                        <h3 className="text-xl font-semibold text-black mb-3 mt-4">Personal Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We may collect personal information that you voluntarily provide to us when you:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Register for an account (name, email address)</li>
                            <li>Use our services (financial transaction data, account information)</li>
                            <li>Contact us for support</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-black mb-3 mt-4">Financial Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            To provide our services, you may choose to enter or connect your financial information, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Bank account details and balances</li>
                            <li>Transaction history</li>
                            <li>Budget and spending data</li>
                            <li>Financial goals and categories</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-black mb-3 mt-4">Automatically Collected Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When you access our Service, we may automatically collect certain information about your device, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>IP address</li>
                            <li>Browser type and version</li>
                            <li>Pages you visit and time spent on pages</li>
                            <li>Device identifiers</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Provide, maintain, and improve our Service</li>
                            <li>Process transactions and manage your account</li>
                            <li>Send you administrative information, updates, and security alerts</li>
                            <li>Respond to your comments, questions, and requests</li>
                            <li>Monitor and analyze usage patterns and trends</li>
                            <li>Detect, prevent, and address technical issues and security threats</li>
                            <li>Personalize your experience on our Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">4. Data Security</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We implement appropriate technical and organizational security measures to protect your personal information. 
                            These measures include:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure authentication and authorization processes</li>
                            <li>Regular security assessments and updates</li>
                            <li>Access controls and monitoring</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            However, no method of transmission over the Internet or electronic storage is 100% secure. 
                            While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">5. Data Sharing and Disclosure</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                            <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">6. Your Rights and Choices</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">You have certain rights regarding your personal information:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li><strong>Access:</strong> You can request access to your personal information</li>
                            <li><strong>Correction:</strong> You can update or correct your account information</li>
                            <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
                            <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format</li>
                            <li><strong>Opt-Out:</strong> You can opt-out of certain communications from us</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">7. Data Retention</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                            outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. 
                            When you delete your account, we will delete or anonymize your information, subject to certain legal obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">8. Children's Privacy</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal 
                            information from children. If you are a parent or guardian and believe your child has provided us with 
                            personal information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">9. Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                            new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                            Privacy Policy periodically for any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">10. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> privacy@ombrfinance.com<br />
                            <strong>Address:</strong> Ombr, Privacy Department
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

