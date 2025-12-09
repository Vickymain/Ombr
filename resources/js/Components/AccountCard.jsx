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
        <div className={`relative flex-shrink-0 w-80 h-48 rounded-2xl ${gradient} p-6 text-white overflow-hidden transition-transform hover:scale-105`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Card Content */}
            <div className="relative h-full flex flex-col justify-between">
                {/* Top Section */}
                <div className="flex items-start justify-between min-h-0">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-lg font-bold truncate mb-1" title={account.provider}>{account.provider}</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-medium opacity-90 whitespace-nowrap">{currencySymbol}</span>
                            <span className="text-[11px] font-medium opacity-75 whitespace-nowrap">{account.currency}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {account.account_type === 'credit' ? (
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap">
                                <span className="text-[11px] font-semibold">CREDIT</span>
                            </div>
                        ) : (
                            <CreditCardIcon className="h-8 w-8 opacity-80 flex-shrink-0" />
                        )}
                    </div>
                </div>

                {/* Middle Section - Balance */}
                <div className="flex-shrink-0">
                    <p className="text-3xl font-bold tracking-tight truncate" title={`${currencySymbol}${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}>
                        {currencySymbol}{parseFloat(account.balance).toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                        })}
                    </p>
                    <p className="text-[11px] opacity-75 mt-1 truncate" title={account.account_name}>{account.account_name}</p>
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between min-h-0 mt-auto">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[11px] opacity-60 mb-1 whitespace-nowrap">CARD HOLDER</p>
                        <p className="text-sm font-semibold uppercase tracking-wider truncate" title={account.account_name}>
                            {account.account_name}
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        {account.account_number && (
                            <p className="text-[11px] font-mono tracking-wider whitespace-nowrap">{maskedNumber}</p>
                        )}
                        <div className="mt-2">
                            {account.account_type === 'credit' || account.account_type === 'checking' ? (
                                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded whitespace-nowrap">
                                    <span className="text-[11px] font-bold">VISA</span>
                                </div>
                            ) : (
                                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded whitespace-nowrap">
                                    <span className="text-[11px] font-bold">MC</span>
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

