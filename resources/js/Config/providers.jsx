/**
 * Legacy provider config with SVG logo components.
 * Main provider data lives in /data/providers.js — keep these in sync.
 */

const ProviderLogo = ({ text, bg, textColor = 'white', size = 'w-12 h-12', fontSize = '30' }) => (
    <svg viewBox="0 0 100 100" className={size}>
        <rect width="100" height="100" rx="8" fill={bg} />
        <text x="50" y="60" fontSize={fontSize} fontWeight="bold" fill={textColor} textAnchor="middle" fontFamily="Inter, Arial, sans-serif">{text}</text>
    </svg>
);

export const providerCategories = [
    {
        name: 'Mobile Money',
        icon: '📱',
        providers: [
            { name: 'M-Pesa', logo: () => <ProviderLogo text="M" bg="#00A651" />, color: '#00A651' },
            { name: 'Airtel Money', logo: () => <ProviderLogo text="A" bg="#ED1C24" />, color: '#ED1C24' },
            { name: 'T-Kash', logo: () => <ProviderLogo text="T" bg="#FF6F00" />, color: '#FF6F00' },
            { name: 'PesaLink', logo: () => <ProviderLogo text="PL" bg="#0B3D91" fontSize="24" />, color: '#0B3D91' },
        ],
    },
    {
        name: 'Kenyan Banks',
        icon: '🏦',
        providers: [
            { name: 'Equity Bank', logo: () => <ProviderLogo text="E" bg="#8B1A1A" />, color: '#8B1A1A' },
            { name: 'KCB Bank', logo: () => <ProviderLogo text="K" bg="#00695C" />, color: '#00695C' },
            { name: 'Co-operative Bank', logo: () => <ProviderLogo text="C" bg="#1B5E20" />, color: '#1B5E20' },
            { name: 'NCBA', logo: () => <ProviderLogo text="N" bg="#263238" />, color: '#263238' },
            { name: 'Absa Bank', logo: () => <ProviderLogo text="A" bg="#AF2140" />, color: '#AF2140' },
            { name: 'Standard Chartered', logo: () => <ProviderLogo text="SC" bg="#0066B3" fontSize="24" />, color: '#0066B3' },
            { name: 'DTB', logo: () => <ProviderLogo text="D" bg="#1A237E" />, color: '#1A237E' },
            { name: 'I&M Bank', logo: () => <ProviderLogo text="IM" bg="#0D47A1" fontSize="24" />, color: '#0D47A1' },
            { name: 'Stanbic Bank', logo: () => <ProviderLogo text="S" bg="#003087" />, color: '#003087' },
            { name: 'Family Bank', logo: () => <ProviderLogo text="F" bg="#2E7D32" />, color: '#2E7D32' },
            { name: 'HF Group', logo: () => <ProviderLogo text="HF" bg="#E65100" fontSize="24" />, color: '#E65100' },
            { name: 'Bank of Africa', logo: () => <ProviderLogo text="BA" bg="#D32F2F" fontSize="24" />, color: '#D32F2F' },
            { name: 'GTBank', logo: () => <ProviderLogo text="GT" bg="#E8620A" fontSize="24" />, color: '#E8620A' },
            { name: 'Prime Bank', logo: () => <ProviderLogo text="P" bg="#1A1A2E" />, color: '#1A1A2E' },
            { name: 'Sidian Bank', logo: () => <ProviderLogo text="Si" bg="#4A148C" fontSize="24" />, color: '#4A148C' },
        ],
    },
    {
        name: 'International Banks',
        icon: '🌍',
        providers: [
            { name: 'Chase', logo: () => <ProviderLogo text="Ch" bg="#117ACA" fontSize="24" />, color: '#117ACA' },
            { name: 'Citibank', logo: () => <ProviderLogo text="Ci" bg="#003B70" fontSize="24" />, color: '#003B70' },
            { name: 'HSBC', logo: () => <ProviderLogo text="H" bg="#DB0011" />, color: '#DB0011' },
            { name: 'Barclays', logo: () => <ProviderLogo text="B" bg="#00AEEF" />, color: '#00AEEF' },
            { name: 'Wells Fargo', logo: () => <ProviderLogo text="WF" bg="#D71E28" fontSize="24" />, color: '#D71E28' },
            { name: 'Bank of America', logo: () => <ProviderLogo text="BoA" bg="#012169" fontSize="20" />, color: '#012169' },
            { name: 'Goldman Sachs', logo: () => <ProviderLogo text="GS" bg="#1A1A1A" fontSize="24" />, color: '#1A1A1A' },
        ],
    },
    {
        name: 'Digital Wallets',
        icon: '💸',
        providers: [
            { name: 'PayPal', logo: () => <ProviderLogo text="PP" bg="#003087" fontSize="24" />, color: '#003087' },
            { name: 'Wise', logo: () => <ProviderLogo text="W" bg="#9FE870" textColor="#1A1A1A" />, color: '#9FE870' },
            { name: 'Revolut', logo: () => <ProviderLogo text="R" bg="#191C32" />, color: '#191C32' },
            { name: 'Chipper Cash', logo: () => <ProviderLogo text="CC" bg="#6C3CE1" fontSize="24" />, color: '#6C3CE1' },
            { name: 'Remitly', logo: () => <ProviderLogo text="Re" bg="#0D3B66" fontSize="24" />, color: '#0D3B66' },
            { name: 'Skrill', logo: () => <ProviderLogo text="Sk" bg="#862165" fontSize="24" />, color: '#862165' },
            { name: 'Venmo', logo: () => <ProviderLogo text="V" bg="#3D95CE" />, color: '#3D95CE' },
        ],
    },
    {
        name: 'Credit Cards',
        icon: '💳',
        providers: [
            { name: 'Visa', logo: () => <ProviderLogo text="V" bg="#1A1F71" />, color: '#1A1F71' },
            { name: 'Mastercard', logo: () => <ProviderLogo text="MC" bg="#1A1A1A" fontSize="24" />, color: '#1A1A1A' },
            { name: 'American Express', logo: () => <ProviderLogo text="AX" bg="#006FCF" fontSize="24" />, color: '#006FCF' },
            { name: 'Discover', logo: () => <ProviderLogo text="D" bg="#FF6600" />, color: '#FF6600' },
        ],
    },
    {
        name: 'SACCOs',
        icon: '🤝',
        providers: [
            { name: 'Mwalimu SACCO', logo: () => <ProviderLogo text="MW" bg="#1565C0" fontSize="24" />, color: '#1565C0' },
            { name: 'Stima SACCO', logo: () => <ProviderLogo text="St" bg="#F57F17" fontSize="24" />, color: '#F57F17' },
            { name: 'Kenya Police SACCO', logo: () => <ProviderLogo text="KP" bg="#283593" fontSize="24" />, color: '#283593' },
            { name: 'Harambee SACCO', logo: () => <ProviderLogo text="Ha" bg="#00796B" fontSize="24" />, color: '#00796B' },
            { name: 'Unaitas SACCO', logo: () => <ProviderLogo text="U" bg="#C62828" />, color: '#C62828' },
            { name: 'Other SACCO', logo: () => <ProviderLogo text="S" bg="#37474F" />, color: '#37474F' },
        ],
    },
    {
        name: 'Crypto & Web3',
        icon: '₿',
        providers: [
            { name: 'Binance', logo: () => <ProviderLogo text="B" bg="#1E2026" textColor="#F0B90B" />, color: '#F0B90B' },
            { name: 'Coinbase', logo: () => <ProviderLogo text="C" bg="#0052FF" />, color: '#0052FF' },
            { name: 'Bybit', logo: () => <ProviderLogo text="By" bg="#F7A600" textColor="#1A1A1A" fontSize="24" />, color: '#F7A600' },
            { name: 'Luno', logo: () => <ProviderLogo text="L" bg="#0D3559" />, color: '#0D3559' },
            { name: 'OKX', logo: () => <ProviderLogo text="O" bg="#121212" />, color: '#121212' },
            { name: 'Kraken', logo: () => <ProviderLogo text="K" bg="#5741D9" />, color: '#5741D9' },
            { name: 'MetaMask', logo: () => <ProviderLogo text="MM" bg="#F6851B" fontSize="24" />, color: '#F6851B' },
            { name: 'Trust Wallet', logo: () => <ProviderLogo text="TW" bg="#0500FF" fontSize="24" />, color: '#0500FF' },
        ],
    },
    {
        name: 'Investments',
        icon: '📈',
        providers: [
            { name: 'CMA (NSE)', logo: () => <ProviderLogo text="NSE" bg="#0A1931" fontSize="20" />, color: '#0A1931' },
            { name: 'Money Market Fund', logo: () => <ProviderLogo text="MM" bg="#1B3A4B" fontSize="24" />, color: '#1B3A4B' },
            { name: 'Treasury Bills/Bonds', logo: () => <ProviderLogo text="TB" bg="#004D40" fontSize="24" />, color: '#004D40' },
            { name: 'Cytonn', logo: () => <ProviderLogo text="Cy" bg="#FF6F00" fontSize="24" />, color: '#FF6F00' },
            { name: 'Britam', logo: () => <ProviderLogo text="Br" bg="#B71C1C" fontSize="24" />, color: '#B71C1C' },
            { name: 'Old Mutual', logo: () => <ProviderLogo text="OM" bg="#00563B" fontSize="24" />, color: '#00563B' },
        ],
    },
    {
        name: 'Other',
        icon: '🔗',
        providers: [
            { name: 'Custom Account', logo: () => <ProviderLogo text="?" bg="#37474F" />, color: '#37474F' },
            { name: 'Cash', logo: () => <ProviderLogo text="$" bg="#2E7D32" />, color: '#2E7D32' },
            { name: 'Loan Account', logo: () => <ProviderLogo text="L" bg="#4E342E" />, color: '#4E342E' },
            { name: 'Insurance', logo: () => <ProviderLogo text="In" bg="#1A237E" fontSize="24" />, color: '#1A237E' },
        ],
    },
];
