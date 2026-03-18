import { getProviderTheme, getProviderInfo, getProviderCardConfig } from '../data/providers';

const currencySymbols = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    BTC: '\u20BF',
    KES: 'KSh',
};

function ChipIcon({ light = true }) {
    return (
        <div className="w-10 h-7 rounded-md overflow-hidden" style={{ background: light ? 'linear-gradient(135deg, #E8D5A3 0%, #C9A96E 50%, #E8D5A3 100%)' : 'linear-gradient(135deg, #D4C194 0%, #A68B5B 50%, #D4C194 100%)' }}>
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-px p-px">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-[1px]" style={{ background: i === 4 ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)' }} />
                ))}
            </div>
        </div>
    );
}

function ContactlessIcon({ className = '' }) {
    return (
        <svg className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12.5 8.5c1.5 1 2.5 2.5 2.5 4.5s-1 3.5-2.5 4.5" />
            <path d="M9 6c2.5 1.5 4 4 4 7s-1.5 5.5-4 7" />
            <path d="M5.5 3.5C9 5.5 11.5 9 11.5 13.5S9 21.5 5.5 23.5" />
        </svg>
    );
}

function VisaLogo({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 780 500" fill="currentColor">
            <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zM540.7 157.5c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.5-90.3 64.5-.3 28.1 26.6 43.7 46.9 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.4 35.6 10.2 59.6 10.4 56.2 0 92.6-26.2 93-66.8.2-22.3-14.1-39.2-45-53.2-18.7-9.1-30.2-15.1-30.1-24.3 0-8.1 9.7-16.8 30.7-16.8 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.2-42.3zM642.5 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.3 179.6h56.1s9.2-24.1 11.2-29.4c6.1 0 60.7.1 68.5.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.3-195.8zm-65.9 126.5c4.4-11.3 21.4-54.7 21.4-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.5h-44.6zM232.8 152.9l-52.3 133.5-5.6-27c-9.7-31.2-39.9-65-73.7-81.9l47.8 171.1 56.6-.1 84.2-195.6h-57z" />
            <path d="M124.7 152.9H38.5l-.7 3.8c67.1 16.2 111.5 55.3 129.9 102.3l-18.7-90.2c-3.2-12.4-12.8-15.5-24.3-15.9z" fill="currentColor" opacity=".7" />
        </svg>
    );
}

function MastercardLogo({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 152.407 108" fill="none">
            <rect width="152.407" height="108" rx="8" fill="none" />
            <circle cx="60.412" cy="54" r="38" fill="#EB001B" />
            <circle cx="91.995" cy="54" r="38" fill="#F79E1B" />
            <path d="M76.204 25.942a37.932 37.932 0 0 0-14.35 28.058 37.932 37.932 0 0 0 14.35 28.058A37.932 37.932 0 0 0 90.554 54a37.932 37.932 0 0 0-14.35-28.058z" fill="#FF5F00" />
        </svg>
    );
}

export default function AccountCard({ account, compact = false }) {
    const providerConfig = getProviderCardConfig(account.provider);
    const providerInfo = getProviderInfo(account.provider);
    const providerTheme = getProviderTheme(account.provider);
    const currencySymbol = currencySymbols[account.currency] || account.currency || '$';

    const cardBg = providerTheme
        ? { background: `linear-gradient(135deg, ${providerTheme.bg} 0%, ${providerTheme.bgEnd || providerTheme.bg} 100%)` }
        : { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' };

    const isLightText = !providerTheme || providerTheme.text !== '#1A1A1A';
    const textColor = isLightText ? 'text-white' : 'text-gray-900';
    const subtleText = isLightText ? 'text-white/70' : 'text-gray-600';
    const mutedText = isLightText ? 'text-white/50' : 'text-gray-400';

    const maskedNumber = account.account_number
        ? `\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  ${String(account.account_number).slice(-4)}`
        : '\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022';

    const network = providerConfig?.network || (account.account_type === 'credit' ? 'visa' : 'mastercard');
    const templateImage = providerConfig?.templateImage;

    const width = compact ? 'w-72' : 'w-80';
    const height = compact ? 'h-44' : 'h-52';

    return (
        <div
            className={`relative ${width} ${height} rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg cursor-pointer`}
            style={
                templateImage
                    ? {
                        backgroundImage: `url(/images/card-templates/${templateImage}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                    : cardBg
            }
        >
            {templateImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
            )}

            {!templateImage && (
                <>
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-[-15%] left-[-5%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute top-[40%] right-[20%] w-20 h-20 bg-white/3 rounded-full blur-xl" />
                </>
            )}

            <div className={`relative h-full flex flex-col justify-between p-5 ${textColor}`}>
                {/* Top: chip + provider + contactless */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <ChipIcon light={isLightText} />
                        <ContactlessIcon className={subtleText} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${subtleText}`}>
                            {account.account_type === 'credit' ? 'Credit' : account.account_type === 'savings' ? 'Savings' : 'Debit'}
                        </span>
                    </div>
                </div>

                {/* Middle: balance */}
                <div>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${mutedText}`}>{account.provider || 'Account'}</p>
                    <p className="text-2xl font-bold tracking-tight">
                        {currencySymbol} {parseFloat(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Bottom: card number + name + network */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className={`text-xs font-mono tracking-[0.15em] mb-1.5 ${subtleText}`}>{maskedNumber}</p>
                        <p className={`text-[11px] font-medium uppercase tracking-wider truncate max-w-[160px] ${subtleText}`} title={account.account_name}>
                            {account.account_name || 'Card Holder'}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        {network === 'visa' ? (
                            <VisaLogo className={`h-8 ${isLightText ? 'text-white' : 'text-gray-800'}`} />
                        ) : (
                            <MastercardLogo className="h-8" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
