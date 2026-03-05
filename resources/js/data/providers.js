/**
 * Financial providers by category. Used for provider selection in Add Account
 * and for styling account cards to match each provider's look.
 * cardStyle: { bg, bgEnd?, text, accent? } — Tailwind-friendly or hex for inline.
 */
export const PROVIDER_CATEGORIES = [
    {
        id: 'mobile_money',
        name: 'Mobile Money',
        icon: '📱',
        providers: [
            { id: 'mpesa', name: 'Mpesa', initial: 'M', cardStyle: { bg: '#00A651', bgEnd: '#008C45', text: '#FFFFFF' } },
            { id: 'airtel_money', name: 'Airtel Money', initial: 'A', cardStyle: { bg: '#ED1C24', bgEnd: '#C41E24', text: '#FFFFFF' } },
            { id: 'tkash', name: 'T-Kash', initial: 'T', cardStyle: { bg: '#FFCC00', bgEnd: '#E6B800', text: '#1A1A1A' } },
        ],
    },
    {
        id: 'banks',
        name: 'Banks',
        icon: '🏦',
        providers: [
            { id: 'equity', name: 'Equity Bank', initial: 'E', cardStyle: { bg: '#8B1538', bgEnd: '#6B0F2A', text: '#FFFFFF' } },
            { id: 'ncba', name: 'NCBA', initial: 'N', cardStyle: { bg: '#003366', bgEnd: '#002244', text: '#FFFFFF' } },
            { id: 'kcb', name: 'KCB Bank', initial: 'K', cardStyle: { bg: '#E35205', bgEnd: '#C44A04', text: '#FFFFFF' } },
            { id: 'cooperative', name: 'Cooperative Bank', initial: 'C', cardStyle: { bg: '#1B365D', bgEnd: '#0F2744', text: '#FFFFFF' } },
            { id: 'standard_chartered', name: 'Standard Chartered', initial: 'SC', cardStyle: { bg: '#0066B3', bgEnd: '#004C8A', text: '#FFFFFF' } },
            { id: 'barclays', name: 'Barclays', initial: 'B', cardStyle: { bg: '#00AEEF', bgEnd: '#0088C6', text: '#FFFFFF' } },
        ],
    },
    {
        id: 'credit_cards',
        name: 'Credit Cards',
        icon: '💳',
        providers: [
            { id: 'visa', name: 'Visa', initial: 'V', cardStyle: { bg: '#1A1F71', bgEnd: '#0D1140', text: '#FFFFFF' } },
            { id: 'mastercard', name: 'Mastercard', initial: 'MC', cardStyle: { bg: '#000000', bgEnd: '#333333', text: '#FFFFFF' } },
        ],
    },
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
