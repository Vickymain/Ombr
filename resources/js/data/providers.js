/**
 * Financial providers by category. Used for provider selection in Add Account
 * and for styling account cards to match each provider's look.
 * cardStyle: { bg, bgEnd?, text, accent? }
 * templateImage: optional filename (without extension) in public/images/card-templates/ for custom card art.
 * network: 'visa' | 'mastercard' for the card network badge.
 */
export const PROVIDER_CATEGORIES = [
    {
        id: 'mobile_money',
        name: 'Mobile Money',
        icon: '📱',
        providers: [
            { id: 'mpesa', name: 'Mpesa', initial: 'M', cardStyle: { bg: '#0D0D0D', bgEnd: '#1A1A1A', text: '#FFFFFF', accent: '#00A651' }, network: 'visa', templateImage: 'mpesa' },
            { id: 'airtel_money', name: 'Airtel Money', initial: 'A', cardStyle: { bg: '#ED1C24', bgEnd: '#C41E24', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'tkash', name: 'T-Kash', initial: 'T', cardStyle: { bg: '#FFCC00', bgEnd: '#E6B800', text: '#1A1A1A' }, network: 'mastercard' },
        ],
    },
    {
        id: 'banks',
        name: 'Banks',
        icon: '🏦',
        providers: [
            { id: 'equity', name: 'Equity Bank', initial: 'E', cardStyle: { bg: '#B71C1C', bgEnd: '#8B1538', text: '#FFFFFF' }, network: 'mastercard', templateImage: 'equity' },
            { id: 'ncba', name: 'NCBA', initial: 'N', cardStyle: { bg: '#37474F', bgEnd: '#263238', text: '#FFFFFF', accent: '#FFC107' }, network: 'visa', templateImage: 'ncba' },
            { id: 'kcb', name: 'KCB Bank', initial: 'K', cardStyle: { bg: '#00695C', bgEnd: '#004D40', text: '#FFFFFF', accent: '#8BC34A' }, network: 'mastercard', templateImage: 'kcb' },
            { id: 'cooperative', name: 'Cooperative Bank', initial: 'C', cardStyle: { bg: '#1B5E20', bgEnd: '#0D3310', text: '#FFFFFF', accent: '#81C784' }, network: 'mastercard', templateImage: 'cooperative' },
            { id: 'standard_chartered', name: 'Standard Chartered', initial: 'SC', cardStyle: { bg: '#0066B3', bgEnd: '#004C8A', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'barclays', name: 'Barclays', initial: 'B', cardStyle: { bg: '#00AEEF', bgEnd: '#0088C6', text: '#FFFFFF' }, network: 'visa' },
        ],
    },
    {
        id: 'credit_cards',
        name: 'Credit Cards',
        icon: '💳',
        providers: [
            { id: 'visa', name: 'Visa', initial: 'V', cardStyle: { bg: '#1A1F71', bgEnd: '#0D1140', text: '#FFFFFF' }, network: 'visa' },
            { id: 'mastercard', name: 'Mastercard', initial: 'MC', cardStyle: { bg: '#000000', bgEnd: '#333333', text: '#FFFFFF' }, network: 'mastercard' },
        ],
    },
    {
        id: 'crypto',
        name: 'Crypto',
        icon: '₿',
        providers: [
            { id: 'binance', name: 'Binance', initial: 'B', cardStyle: { bg: '#1A1A1A', bgEnd: '#0D0D0D', text: '#F0B90B', accent: '#F0B90B' }, network: 'mastercard', templateImage: 'binance' },
            { id: 'coinbase', name: 'Coinbase', initial: 'C', cardStyle: { bg: '#0052FF', bgEnd: '#003BB3', text: '#FFFFFF' }, network: 'visa', templateImage: 'coinbase' },
            { id: 'bybit', name: 'Bybit', initial: 'B', cardStyle: { bg: '#E8E8E8', bgEnd: '#D0D0D0', text: '#2D3748', accent: '#F7A600' }, network: 'mastercard', templateImage: 'bybit' },
            { id: 'luno', name: 'Luno', initial: 'L', cardStyle: { bg: '#00B4D8', bgEnd: '#0096C7', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'local_bitcoins', name: 'LocalBitcoins', initial: 'L', cardStyle: { bg: '#4CAF50', bgEnd: '#388E3C', text: '#FFFFFF' }, network: 'mastercard' },
        ],
    },
];

/** Currencies for balance selection */
export const CURRENCIES = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'KES', label: 'KES (KSh)' },
    { value: 'BTC', label: 'BTC' },
];

/** All providers flat with id -> theme for card styling */
const byId = {};
PROVIDER_CATEGORIES.forEach((cat) => {
    cat.providers.forEach((p) => {
        byId[p.id] = p;
        byId[p.name.toLowerCase().replace(/\s+/g, '_')] = p;
    });
});

/**
 * Find provider theme by stored name (e.g. from account.provider "Equity Bank" or "Equity").
 * Tries exact name, then id, then contains match.
 */
export function getProviderTheme(providerName) {
    if (!providerName || typeof providerName !== 'string') return null;
    const raw = providerName.trim();
    const lower = raw.toLowerCase();
    const normalized = lower.replace(/\s+/g, '_');
    const list = PROVIDER_CATEGORIES.flatMap((c) => c.providers);
    const exact = list.find((p) => p.name.toLowerCase() === lower || p.id === normalized);
    if (exact) return exact.cardStyle;
    const contains = list.find((p) => lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower));
    return contains ? contains.cardStyle : null;
}

/**
 * Get provider display info (initial, name) for cards.
 */
export function getProviderInfo(providerName) {
    if (!providerName || typeof providerName !== 'string') return { initial: '?', name: providerName };
    const raw = providerName.trim();
    const lower = raw.toLowerCase();
    const list = PROVIDER_CATEGORIES.flatMap((c) => c.providers);
    const found = list.find((p) => p.name.toLowerCase() === lower || p.id === lower.replace(/\s+/g, '_') || lower.includes(p.name.toLowerCase()));
    return found ? { initial: found.initial, name: found.name } : { initial: raw.charAt(0).toUpperCase() || '?', name: raw };
}

/**
 * Get full provider config for card template (theme, network badge, optional template image).
 */
export function getProviderCardConfig(providerName) {
    if (!providerName || typeof providerName !== 'string') return null;
    const lower = providerName.trim().toLowerCase();
    const normalized = lower.replace(/\s+/g, '_');
    const list = PROVIDER_CATEGORIES.flatMap((c) => c.providers);
    const found = list.find((p) => p.name.toLowerCase() === lower || p.id === normalized || lower.includes(p.name.toLowerCase()));
    return found ? { ...found.cardStyle, id: found.id, initial: found.initial, name: found.name, network: found.network, templateImage: found.templateImage } : null;
}
