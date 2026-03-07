import { getProviderTheme, getProviderInfo, getProviderCardConfig } from '../data/providers';

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

/** EMV chip shape */
function ChipIcon({ className = 'text-white/80' }) {
    return (
        <div className={`w-10 h-8 rounded-md border border-current ${className}`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)' }} />
    );
}

/** Contactless payment icon (three arcs) */
function ContactlessIcon({ className = 'text-white/90' }) {
    return (
        <svg className={`w-8 h-8 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2" />
            <path d="M8 9a4 4 0 0 1 4 4v-2a4 4 0 0 1-4 4" />
            <path d="M4 12a6 6 0 0 1 6 6v-2a6 6 0 0 1-6 6" />
        </svg>
    );
}

export default function AccountCard({ account }) {
    const providerConfig = getProviderCardConfig(account.provider);
    const providerTheme = getProviderTheme(account.provider);
    const providerInfo = getProviderInfo(account.provider);
    const gradient = cardGradients[account.account_type] || cardGradients.other;
    const currencySymbol = currencySymbols[account.currency] || '$';

    const cardBg = providerTheme
        ? { background: `linear-gradient(135deg, ${providerTheme.bg} 0%, ${providerTheme.bgEnd || providerTheme.bg} 100%)` }
        : null;
    const cardClass = providerTheme ? '' : gradient;
    const isLightText = !providerTheme || providerTheme.text !== '#1A1A1A';
    const textColor = isLightText ? 'text-white' : 'text-gray-900';

    const maskedNumber = account.account_number
        ? `**** **** **** ${String(account.account_number).slice(-4)}`
        : '**** **** **** ****';

    const network = providerConfig?.network || (account.account_type === 'credit' ? 'visa' : 'mastercard');
    const templateImage = providerConfig?.templateImage;

    return (
        <div
            className={`relative flex-shrink-0 w-80 min-h-[13rem] h-56 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${!providerTheme ? cardClass : ''}`}
            style={
                templateImage
                    ? {
                        backgroundImage: `url(/images/card-templates/${templateImage}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                    : cardBg || undefined
            }
        >
            {/* Optional overlay when using template image so text stays readable */}
            {templateImage && (
                <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
            )}

            {/* Subtle pattern overlay when not using template image */}
            {!templateImage && (
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                </div>
            )}

            <div className={`relative h-full flex flex-col justify-between p-5 ${textColor}`}>
                {/* Top row: chip, provider badge, contactless */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <ChipIcon className={isLightText ? 'text-white/80 border-white/50' : 'text-gray-700 border-gray-500'} />
                        <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                            {account.account_type === 'credit' ? 'Credit' : account.account_type === 'savings' ? 'Savings' : 'Debit'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ContactlessIcon className={isLightText ? 'text-white/90' : 'text-gray-800'} />
                        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-xs font-bold">{providerInfo.initial}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: provider name + balance */}
                <div>
                    <p className="text-[11px] opacity-80 mb-0.5">{currencySymbol} Balance</p>
                    <p className="text-2xl font-bold tracking-tight">
                        {currencySymbol}{parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs opacity-75 truncate mt-0.5" title={account.account_name}>{account.account_name}</p>
                </div>

                {/* Bottom: card number, valid thru, network */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] opacity-70 uppercase tracking-wider mb-0.5">Card number</p>
                        <p className="text-sm font-mono tracking-[0.2em]">{maskedNumber}</p>
                        <p className="text-[10px] opacity-70 mt-1">VALID THRU **/**</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] opacity-70 uppercase mb-0.5">Card holder</p>
                        <p className="text-xs font-semibold uppercase tracking-wider truncate max-w-[100px]" title={account.account_name}>
                            {account.account_name}
                        </p>
                        <div className="mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isLightText ? 'bg-white/25' : 'bg-gray-900/10'}`}>
                                {network === 'visa' ? 'VISA' : 'mastercard'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
