/**
 * Financial providers by category. Used for provider selection in Add Account
 * and for styling account cards to match each provider's look.
 * cardStyle: { bg, bgEnd?, text, accent? }
 * network: 'visa' | 'mastercard' | 'amex' for the card network badge.
 */
export const PROVIDER_CATEGORIES = [
    {
        id: 'mobile_money',
        name: 'Mobile Money',
        icon: '📱',
        providers: [
            { id: 'mpesa', name: 'M-Pesa', initial: 'M', cardStyle: { bg: '#0D0D0D', bgEnd: '#1A1A1A', text: '#FFFFFF', accent: '#00A651' }, network: 'visa' },
            { id: 'airtel_money', name: 'Airtel Money', initial: 'A', cardStyle: { bg: '#ED1C24', bgEnd: '#C41E24', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'tkash', name: 'T-Kash', initial: 'T', cardStyle: { bg: '#FF6F00', bgEnd: '#E65100', text: '#FFFFFF', accent: '#FFCA28' }, network: 'mastercard' },
            { id: 'pesalink', name: 'PesaLink', initial: 'PL', cardStyle: { bg: '#0B3D91', bgEnd: '#062A65', text: '#FFFFFF', accent: '#4FC3F7' }, network: 'visa' },
        ],
    },
    {
        id: 'banks_ke',
        name: 'Kenyan Banks',
        icon: '🏦',
        providers: [
            { id: 'equity', name: 'Equity Bank', initial: 'E', cardStyle: { bg: '#8B1A1A', bgEnd: '#5C0D0D', text: '#FFFFFF', accent: '#FFC107' }, network: 'mastercard' },
            { id: 'kcb', name: 'KCB Bank', initial: 'K', cardStyle: { bg: '#00695C', bgEnd: '#004D40', text: '#FFFFFF', accent: '#8BC34A' }, network: 'mastercard' },
            { id: 'cooperative', name: 'Co-operative Bank', initial: 'C', cardStyle: { bg: '#1B5E20', bgEnd: '#0D3310', text: '#FFFFFF', accent: '#81C784' }, network: 'mastercard' },
            { id: 'ncba', name: 'NCBA', initial: 'N', cardStyle: { bg: '#263238', bgEnd: '#1A1F24', text: '#FFFFFF', accent: '#FFC107' }, network: 'visa' },
            { id: 'absa', name: 'Absa Bank', initial: 'A', cardStyle: { bg: '#AF2140', bgEnd: '#8A1A33', text: '#FFFFFF', accent: '#E15070' }, network: 'visa' },
            { id: 'standard_chartered', name: 'Standard Chartered', initial: 'SC', cardStyle: { bg: '#0066B3', bgEnd: '#004C8A', text: '#FFFFFF', accent: '#00A0E3' }, network: 'mastercard' },
            { id: 'dtb', name: 'DTB', initial: 'D', cardStyle: { bg: '#1A237E', bgEnd: '#0D1451', text: '#FFFFFF', accent: '#5C6BC0' }, network: 'visa' },
            { id: 'im_bank', name: 'I&M Bank', initial: 'IM', cardStyle: { bg: '#0D47A1', bgEnd: '#0A3570', text: '#FFFFFF', accent: '#CE9B2C' }, network: 'mastercard' },
            { id: 'stanbic', name: 'Stanbic Bank', initial: 'S', cardStyle: { bg: '#003087', bgEnd: '#002060', text: '#FFFFFF', accent: '#0072CE' }, network: 'visa' },
            { id: 'family_bank', name: 'Family Bank', initial: 'F', cardStyle: { bg: '#2E7D32', bgEnd: '#1B5E20', text: '#FFFFFF', accent: '#66BB6A' }, network: 'mastercard' },
            { id: 'hf_group', name: 'HF Group', initial: 'HF', cardStyle: { bg: '#E65100', bgEnd: '#BF360C', text: '#FFFFFF', accent: '#FF8A65' }, network: 'visa' },
            { id: 'boa', name: 'Bank of Africa', initial: 'BA', cardStyle: { bg: '#D32F2F', bgEnd: '#B71C1C', text: '#FFFFFF', accent: '#FFD54F' }, network: 'mastercard' },
            { id: 'gt_bank', name: 'GTBank', initial: 'GT', cardStyle: { bg: '#E8620A', bgEnd: '#C54D00', text: '#FFFFFF', accent: '#FFB74D' }, network: 'mastercard' },
            { id: 'prime_bank', name: 'Prime Bank', initial: 'P', cardStyle: { bg: '#1A1A2E', bgEnd: '#16213E', text: '#FFFFFF', accent: '#C9A96E' }, network: 'visa' },
            { id: 'sidian', name: 'Sidian Bank', initial: 'Si', cardStyle: { bg: '#4A148C', bgEnd: '#311B92', text: '#FFFFFF', accent: '#CE93D8' }, network: 'mastercard' },
        ],
    },
    {
        id: 'banks_intl',
        name: 'International Banks',
        icon: '🌍',
        providers: [
            { id: 'chase', name: 'Chase', initial: 'Ch', cardStyle: { bg: '#117ACA', bgEnd: '#0C5A9E', text: '#FFFFFF' }, network: 'visa' },
            { id: 'citibank', name: 'Citibank', initial: 'Ci', cardStyle: { bg: '#003B70', bgEnd: '#002850', text: '#FFFFFF', accent: '#E21836' }, network: 'mastercard' },
            { id: 'hsbc', name: 'HSBC', initial: 'H', cardStyle: { bg: '#DB0011', bgEnd: '#A8000E', text: '#FFFFFF' }, network: 'visa' },
            { id: 'barclays', name: 'Barclays', initial: 'B', cardStyle: { bg: '#00AEEF', bgEnd: '#0088C6', text: '#FFFFFF' }, network: 'visa' },
            { id: 'wells_fargo', name: 'Wells Fargo', initial: 'WF', cardStyle: { bg: '#D71E28', bgEnd: '#BB1A23', text: '#FFFFFF', accent: '#FFCD11' }, network: 'visa' },
            { id: 'boa_us', name: 'Bank of America', initial: 'BoA', cardStyle: { bg: '#012169', bgEnd: '#001845', text: '#FFFFFF', accent: '#E31837' }, network: 'visa' },
            { id: 'goldman', name: 'Goldman Sachs', initial: 'GS', cardStyle: { bg: '#1A1A1A', bgEnd: '#000000', text: '#FFFFFF', accent: '#7BB3E0' }, network: 'mastercard' },
        ],
    },
    {
        id: 'digital_wallets',
        name: 'Digital Wallets',
        icon: '💸',
        providers: [
            { id: 'paypal', name: 'PayPal', initial: 'PP', cardStyle: { bg: '#003087', bgEnd: '#001F5C', text: '#FFFFFF', accent: '#009CDE' }, network: 'visa' },
            { id: 'wise', name: 'Wise', initial: 'W', cardStyle: { bg: '#9FE870', bgEnd: '#7CC74E', text: '#1A1A1A', accent: '#37517E' }, network: 'mastercard' },
            { id: 'revolut', name: 'Revolut', initial: 'R', cardStyle: { bg: '#191C32', bgEnd: '#0D0F1A', text: '#FFFFFF', accent: '#0075EB' }, network: 'mastercard' },
            { id: 'chipper', name: 'Chipper Cash', initial: 'CC', cardStyle: { bg: '#6C3CE1', bgEnd: '#5028C6', text: '#FFFFFF', accent: '#9F7AEA' }, network: 'visa' },
            { id: 'remitly', name: 'Remitly', initial: 'Re', cardStyle: { bg: '#0D3B66', bgEnd: '#072A4D', text: '#FFFFFF', accent: '#5CC8FF' }, network: 'visa' },
            { id: 'skrill', name: 'Skrill', initial: 'Sk', cardStyle: { bg: '#862165', bgEnd: '#6A1A50', text: '#FFFFFF', accent: '#C94EA0' }, network: 'mastercard' },
            { id: 'venmo', name: 'Venmo', initial: 'V', cardStyle: { bg: '#3D95CE', bgEnd: '#2D7AB5', text: '#FFFFFF' }, network: 'mastercard' },
        ],
    },
    {
        id: 'credit_cards',
        name: 'Credit Cards',
        icon: '💳',
        providers: [
            { id: 'visa_card', name: 'Visa', initial: 'V', cardStyle: { bg: '#1A1F71', bgEnd: '#0D1140', text: '#FFFFFF' }, network: 'visa' },
            { id: 'mastercard_card', name: 'Mastercard', initial: 'MC', cardStyle: { bg: '#1A1A1A', bgEnd: '#333333', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'amex', name: 'American Express', initial: 'AX', cardStyle: { bg: '#006FCF', bgEnd: '#004FA3', text: '#FFFFFF', accent: '#FFFFFF' }, network: 'amex' },
            { id: 'discover', name: 'Discover', initial: 'D', cardStyle: { bg: '#FF6600', bgEnd: '#E05A00', text: '#FFFFFF' }, network: 'visa' },
        ],
    },
    {
        id: 'saccos',
        name: 'SACCOs',
        icon: '🤝',
        providers: [
            { id: 'mwalimu', name: 'Mwalimu SACCO', initial: 'MW', cardStyle: { bg: '#1565C0', bgEnd: '#0D47A1', text: '#FFFFFF', accent: '#42A5F5' }, network: 'mastercard' },
            { id: 'stima', name: 'Stima SACCO', initial: 'St', cardStyle: { bg: '#F57F17', bgEnd: '#E65100', text: '#FFFFFF', accent: '#FFC107' }, network: 'visa' },
            { id: 'kenya_police', name: 'Kenya Police SACCO', initial: 'KP', cardStyle: { bg: '#283593', bgEnd: '#1A237E', text: '#FFFFFF', accent: '#7986CB' }, network: 'mastercard' },
            { id: 'harambee', name: 'Harambee SACCO', initial: 'Ha', cardStyle: { bg: '#00796B', bgEnd: '#004D40', text: '#FFFFFF', accent: '#4DB6AC' }, network: 'visa' },
            { id: 'unaitas', name: 'Unaitas SACCO', initial: 'U', cardStyle: { bg: '#C62828', bgEnd: '#8E0000', text: '#FFFFFF', accent: '#EF5350' }, network: 'mastercard' },
            { id: 'other_sacco', name: 'Other SACCO', initial: 'S', cardStyle: { bg: '#37474F', bgEnd: '#263238', text: '#FFFFFF', accent: '#78909C' }, network: 'visa' },
        ],
    },
    {
        id: 'crypto',
        name: 'Crypto & Web3',
        icon: '₿',
        providers: [
            { id: 'binance', name: 'Binance', initial: 'B', cardStyle: { bg: '#1E2026', bgEnd: '#0B0E11', text: '#F0B90B', accent: '#F0B90B' }, network: 'mastercard' },
            { id: 'coinbase', name: 'Coinbase', initial: 'C', cardStyle: { bg: '#0052FF', bgEnd: '#003BB3', text: '#FFFFFF' }, network: 'visa' },
            { id: 'bybit', name: 'Bybit', initial: 'By', cardStyle: { bg: '#F7A600', bgEnd: '#D98F00', text: '#1A1A1A', accent: '#1A1A1A' }, network: 'mastercard' },
            { id: 'luno', name: 'Luno', initial: 'L', cardStyle: { bg: '#0D3559', bgEnd: '#072440', text: '#FFFFFF', accent: '#3CB1F5' }, network: 'mastercard' },
            { id: 'okx', name: 'OKX', initial: 'O', cardStyle: { bg: '#121212', bgEnd: '#000000', text: '#FFFFFF', accent: '#00FFB0' }, network: 'visa' },
            { id: 'kraken', name: 'Kraken', initial: 'K', cardStyle: { bg: '#5741D9', bgEnd: '#3D2DA8', text: '#FFFFFF', accent: '#9B8AFF' }, network: 'mastercard' },
            { id: 'metamask', name: 'MetaMask', initial: 'MM', cardStyle: { bg: '#F6851B', bgEnd: '#E2761B', text: '#FFFFFF' }, network: 'visa' },
            { id: 'trust_wallet', name: 'Trust Wallet', initial: 'TW', cardStyle: { bg: '#0500FF', bgEnd: '#0400CC', text: '#FFFFFF', accent: '#48A9F8' }, network: 'visa' },
        ],
    },
    {
        id: 'investments',
        name: 'Investments',
        icon: '📈',
        providers: [
            { id: 'cma', name: 'CMA (NSE)', initial: 'NSE', cardStyle: { bg: '#0A1931', bgEnd: '#060F1F', text: '#FFFFFF', accent: '#FFD700' }, network: 'visa' },
            { id: 'money_market', name: 'Money Market Fund', initial: 'MM', cardStyle: { bg: '#1B3A4B', bgEnd: '#0F2633', text: '#FFFFFF', accent: '#4FC3F7' }, network: 'mastercard' },
            { id: 'treasury', name: 'Treasury Bills/Bonds', initial: 'TB', cardStyle: { bg: '#004D40', bgEnd: '#00332B', text: '#FFFFFF', accent: '#00E676' }, network: 'visa' },
            { id: 'cytonn', name: 'Cytonn', initial: 'Cy', cardStyle: { bg: '#FF6F00', bgEnd: '#E65100', text: '#FFFFFF' }, network: 'mastercard' },
            { id: 'britam', name: 'Britam', initial: 'Br', cardStyle: { bg: '#B71C1C', bgEnd: '#8B0000', text: '#FFFFFF', accent: '#FF5252' }, network: 'visa' },
            { id: 'old_mutual', name: 'Old Mutual', initial: 'OM', cardStyle: { bg: '#00563B', bgEnd: '#003D2A', text: '#FFFFFF', accent: '#4CAF50' }, network: 'mastercard' },
        ],
    },
    {
        id: 'other',
        name: 'Other',
        icon: '🔗',
        providers: [
            { id: 'custom', name: 'Custom Account', initial: '?', cardStyle: { bg: '#37474F', bgEnd: '#263238', text: '#FFFFFF', accent: '#78909C' }, network: 'visa' },
            { id: 'cash', name: 'Cash', initial: '$', cardStyle: { bg: '#2E7D32', bgEnd: '#1B5E20', text: '#FFFFFF', accent: '#A5D6A7' }, network: 'visa' },
            { id: 'loan', name: 'Loan Account', initial: 'L', cardStyle: { bg: '#4E342E', bgEnd: '#3E2723', text: '#FFFFFF', accent: '#A1887F' }, network: 'mastercard' },
            { id: 'insurance', name: 'Insurance', initial: 'In', cardStyle: { bg: '#1A237E', bgEnd: '#0D1157', text: '#FFFFFF', accent: '#9FA8DA' }, network: 'visa' },
        ],
    },
];

/** Currencies for balance selection */
export const CURRENCIES = [
    { value: 'KES', label: 'KES (KSh)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'TZS', label: 'TZS (TSh)' },
    { value: 'UGX', label: 'UGX (USh)' },
    { value: 'ZAR', label: 'ZAR (R)' },
    { value: 'NGN', label: 'NGN (₦)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'AUD', label: 'AUD (A$)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'CHF', label: 'CHF (Fr)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'CNY', label: 'CNY (¥)' },
    { value: 'AED', label: 'AED (د.إ)' },
    { value: 'BTC', label: 'BTC (₿)' },
    { value: 'ETH', label: 'ETH (Ξ)' },
    { value: 'USDT', label: 'USDT' },
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
 * Get full provider config for card template (theme, network badge).
 */
export function getProviderCardConfig(providerName) {
    if (!providerName || typeof providerName !== 'string') return null;
    const lower = providerName.trim().toLowerCase();
    const normalized = lower.replace(/\s+/g, '_');
    const list = PROVIDER_CATEGORIES.flatMap((c) => c.providers);
    const found = list.find((p) => p.name.toLowerCase() === lower || p.id === normalized || lower.includes(p.name.toLowerCase()));
    return found ? { ...found.cardStyle, id: found.id, initial: found.initial, name: found.name, network: found.network } : null;
}
