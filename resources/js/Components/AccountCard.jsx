import { CreditCardIcon } from '@heroicons/react/24/outline';

const cardGradients = {
    checking: 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700',
    savings: 'bg-gradient-to-br from-green-500 via-teal-600 to-emerald-700',
    credit: 'bg-gradient-to-br from-purple-500 via-pink-600 to-red-600',
    investment: 'bg-gradient-to-br from-orange-500 via-red-600 to-pink-700',
    cash: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900',
    other: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600',
};

const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿',
    KES: 'KSh',
};

export default function AccountCard({ account }) {
    const gradient = cardGradients[account.account_type] || cardGradients.other;
    const currencySymbol = currencySymbols[account.currency] || '$';
    
    // Mask account number
    const maskedNumber = account.account_number 
        ? `**** **** **** ${account.account_number.slice(-4)}`
        : '**** **** **** ****';

    return (
        <div className={`relative flex-shrink-0 w-80 h-48 rounded-2xl ${gradient} p-6 text-white shadow-2xl overflow-hidden transition-transform hover:scale-105`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Card Content */}
            <div className="relative h-full flex flex-col justify-between">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-2xl font-bold">{currencySymbol}</span>
                            <span className="text-sm font-medium opacity-90">{account.currency}</span>
                        </div>
                        <p className="text-xs opacity-75">{account.provider}</p>
                    </div>
                    {account.account_type === 'credit' ? (
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-xs font-semibold">CREDIT</span>
                        </div>
                    ) : (
                        <CreditCardIcon className="h-8 w-8 opacity-80" />
                    )}
                </div>

                {/* Middle Section - Balance */}
                <div>
                    <p className="text-3xl font-bold tracking-tight">
                        {currencySymbol}{parseFloat(account.balance).toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                        })}
                    </p>
                    <p className="text-xs opacity-75 mt-1">{account.account_name}</p>
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs opacity-60 mb-1">CARD HOLDER</p>
                        <p className="text-sm font-semibold uppercase tracking-wider">
                            {account.account_name.substring(0, 20)}
                        </p>
                    </div>
                    <div className="text-right">
                        {account.account_number && (
                            <p className="text-xs font-mono tracking-wider">{maskedNumber}</p>
                        )}
                        <div className="mt-2">
                            {account.account_type === 'credit' || account.account_type === 'checking' ? (
                                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded">
                                    <span className="text-xs font-bold">VISA</span>
                                </div>
                            ) : (
                                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded">
                                    <span className="text-xs font-bold">MC</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chip Effect */}
            {/*<div className="absolute top-16 left-6 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80"></div>*/}
        </div>
    );
}

