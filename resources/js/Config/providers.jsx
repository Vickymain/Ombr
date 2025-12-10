// Provider Logo Components
const MpesaLogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#00A859"/>
        <text x="50" y="60" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">M</text>
    </svg>
);

const EquityBankLogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#E31837"/>
        <text x="50" y="60" fontSize="30" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">E</text>
    </svg>
);

const NCBALogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#0066CC"/>
        <text x="50" y="60" fontSize="30" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">NCBA</text>
    </svg>
);

const KCBLogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#FF6600"/>
        <text x="50" y="60" fontSize="30" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">KCB</text>
    </svg>
);

const CooperativeBankLogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#003366"/>
        <text x="50" y="60" fontSize="25" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">COOP</text>
    </svg>
);

const StandardCharteredLogo = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect width="100" height="100" rx="8" fill="#1D4ED8"/>
        <text x="50" y="60" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">SC</text>
    </svg>
);

const VisaLogo = () => (
    <svg viewBox="0 0 100 60" className="w-16 h-10">
        <rect width="100" height="60" rx="4" fill="#1A1F71"/>
        <text x="50" y="38" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">VISA</text>
    </svg>
);

const MastercardLogo = () => (
    <svg viewBox="0 0 100 60" className="w-16 h-10">
        <rect width="100" height="60" rx="4" fill="#EB001B"/>
        <circle cx="35" cy="30" r="15" fill="#F79E1B"/>
        <circle cx="45" cy="30" r="15" fill="#FF5F00" opacity="0.8"/>
        <text x="70" y="38" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">MC</text>
    </svg>
);

const AmexLogo = () => (
    <svg viewBox="0 0 100 60" className="w-16 h-10">
        <rect width="100" height="60" rx="4" fill="#006FCF"/>
        <text x="50" y="38" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">AMEX</text>
    </svg>
);

// Provider categories with logos
export const providerCategories = [
    {
        name: 'Mobile Money',
        icon: '📱',
        providers: [
            { 
                name: 'Mpesa', 
                logo: MpesaLogo, 
                apiAvailable: true, 
                apiKey: 'mpesa',
                color: '#00A859'
            },
        ],
    },
    {
        name: 'Bank Accounts',
        icon: '🏦',
        providers: [
            { 
                name: 'Equity Bank', 
                logo: EquityBankLogo, 
                apiAvailable: true, 
                apiKey: 'equity_bank',
                color: '#E31837'
            },
            { 
                name: 'NCBA', 
                logo: NCBALogo, 
                apiAvailable: true, 
                apiKey: 'ncba',
                color: '#0066CC'
            },
            { 
                name: 'KCB Bank', 
                logo: KCBLogo, 
                apiAvailable: true, 
                apiKey: 'kcb',
                color: '#FF6600'
            },
            { 
                name: 'Cooperative Bank', 
                logo: CooperativeBankLogo, 
                apiAvailable: true, 
                apiKey: 'cooperative',
                color: '#003366'
            },
            { 
                name: 'Standard Chartered', 
                logo: StandardCharteredLogo, 
                apiAvailable: true, 
                apiKey: 'standard_chartered',
                color: '#1D4ED8'
            },
        ],
    },
    {
        name: 'Credit Cards',
        icon: '💳',
        providers: [
            { 
                name: 'Visa', 
                logo: VisaLogo, 
                apiAvailable: true, 
                apiKey: 'visa',
                color: '#1A1F71'
            },
            { 
                name: 'Mastercard', 
                logo: MastercardLogo, 
                apiAvailable: true, 
                apiKey: 'mastercard',
                color: '#EB001B'
            },
            { 
                name: 'American Express', 
                logo: AmexLogo, 
                apiAvailable: true, 
                apiKey: 'amex',
                color: '#006FCF'
            },
        ],
    },
];

