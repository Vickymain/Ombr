import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import FileUploadZone from '../Components/FileUploadZone';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CreditCardIcon,
    ChartBarIcon,
    XMarkIcon,
    CheckCircleIcon,
    SparklesIcon,
    DocumentTextIcon,
    CpuChipIcon,
    CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Link, usePage, router } from '@inertiajs/react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { PROVIDER_CATEGORIES, CURRENCIES, getProviderCardConfig, getProviderTheme } from '../data/providers';
import { parseTransactionLabel, getActionStyle } from '../utils/transactionLabels';

function fieldBorderClass(error, value) {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    if (value !== undefined && value !== null && value !== '') return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20';
    return 'border-gray-300 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A]';
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

function groupTransactionsByDate(transactions) {
    const list = Array.isArray(transactions) ? transactions : [];
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    const groups = [];
    let currentLabel = null;
    let currentItems = [];
    list.forEach((t) => {
        const d = new Date(t.transaction_date).toDateString();
        let label;
        if (d === today) label = 'Today';
        else if (d === yesterday) label = 'Yesterday';
        else label = new Date(t.transaction_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

        if (label !== currentLabel) {
            if (currentItems.length) groups.push({ label: currentLabel, items: currentItems });
            currentLabel = label;
            currentItems = [];
        }
        currentItems.push(t);
    });
    if (currentItems.length) groups.push({ label: currentLabel, items: currentItems });
    return groups;
}

const accountTypes = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
];

const processingSteps = [
    { key: 'creating', icon: CloudArrowUpIcon, label: 'Creating account...' },
    { key: 'reading', icon: DocumentTextIcon, label: 'Reading statements...' },
    { key: 'analysing', icon: CpuChipIcon, label: 'Processing data...' },
];

export default function Dashboard({ accounts = [], latestTransactions = [], recentTransactions = [], monthlyData = [], categoryData = [] }) {
    const page = usePage();
    const user = page.props?.auth?.user;
    const scrollContainerRef = useRef(null);
    const transactionGroups = useMemo(() => groupTransactionsByDate(recentTransactions), [recentTransactions]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle');
    const [modalStep, setModalStep] = useState(1);
    const stepTimersRef = useRef([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        currency: 'KES',
        statement_files: [],
    });

    const safeMonthlyData = monthlyData?.length > 0 ? monthlyData : Array(6).fill(null).map((_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        return { month: month.toLocaleDateString('en-US', { month: 'short' }), income: 0, expenses: 0 };
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const thisMonthIncome = safeMonthlyData[safeMonthlyData.length - 1]?.income || 0;
    const thisMonthExpenses = safeMonthlyData[safeMonthlyData.length - 1]?.expenses || 0;
    const lastMonthIncome = safeMonthlyData[safeMonthlyData.length - 2]?.income || 1;
    const lastMonthExpenses = safeMonthlyData[safeMonthlyData.length - 2]?.expenses || 1;
    const capPercent = (val) => {
        const n = parseFloat(val);
        if (Number.isNaN(n)) return '0';
        if (n > 999) return '>999';
        if (n < -999) return '<-999';
        return n.toFixed(1);
    };
    const incomeChange = capPercent((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100);
    const expenseChange = capPercent((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
            setTimeout(checkScrollPosition, 300);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [accounts]);

    const hasNoAccounts = accounts.length === 0;

    const openModal = () => {
        reset();
        setData('currency', 'KES');
        setModalStep(1);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalStep(1);
        reset();
    };

    useEffect(() => {
        return () => { stepTimersRef.current.forEach(clearTimeout); stepTimersRef.current = []; };
    }, []);

    const [processingError, setProcessingError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessingError(null);
        const hasFiles = data.statement_files?.length > 0;
        const formOptions = {
            forceFormData: hasFiles,
            onSuccess: () => {
                if (hasFiles) {
                    setProcessingStep('done');
                    stepTimersRef.current.forEach(clearTimeout);
                    stepTimersRef.current = [];
                    stepTimersRef.current.push(setTimeout(() => { setIsProcessingModalOpen(false); setProcessingStep('idle'); window.__ombrSkipLoading = false; closeModal(); }, 1500));
                } else { closeModal(); }
            },
            onError: (errs) => {
                stepTimersRef.current.forEach(clearTimeout);
                stepTimersRef.current = [];
                setProcessingStep('error');
                const msg = errs?.statement_files || Object.values(errs || {}).flat().join(' ') || 'Something went wrong.';
                setProcessingError(typeof msg === 'string' ? msg : String(msg));
                window.__ombrSkipLoading = false;
            },
        };
        if (hasFiles) {
            setIsModalOpen(false);
            setIsProcessingModalOpen(true);
            window.__ombrSkipLoading = true;
            setProcessingStep('creating');
            stepTimersRef.current.forEach(clearTimeout);
            stepTimersRef.current = [
                setTimeout(() => setProcessingStep('reading'), 800),
                setTimeout(() => setProcessingStep('analysing'), 2000),
            ];
        }
        post('/accounts', formOptions);
    };

    return (
        <AppLayout title="Dashboard" totalBalance={totalBalance}>
            {hasNoAccounts ? (
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#C85D3A] via-[#B85450] to-[#9E4A47] rounded-3xl shadow-xl p-8 sm:p-12 text-white mb-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-6">
                                <CreditCardIcon className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Your money, one place</h1>
                            <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">
                                Add your first account, upload a statement, and see your balance and transactions in minutes.
                            </p>
                            <button onClick={openModal} className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#B85450] rounded-2xl font-semibold hover:bg-white/95 transition-all shadow-lg">
                                <PlusIcon className="h-6 w-6 mr-2" />
                                Add your first account
                            </button>
                            <p className="mt-4 text-sm text-white/70">CSV or PDF - Takes under 2 minutes</p>
                        </div>
                    </div>

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        {[
                            { num: 1, title: 'Choose your provider', desc: 'Mpesa, Equity, KCB, or any other bank or mobile money.' },
                            { num: 2, title: 'Upload a statement', desc: 'Drop a CSV or PDF and we extract transactions automatically.' },
                            { num: 3, title: 'See your dashboard', desc: 'Balance, income, expenses, and insights in one view.' },
                        ].map((s) => (
                            <div key={s.num} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#C85D3A]/10 text-[#B85450] font-bold flex items-center justify-center">{s.num}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                                    <p className="text-sm text-gray-600">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        {[
                            { icon: CreditCardIcon, color: 'bg-emerald-100 text-emerald-600', title: 'All accounts in one place', desc: 'Banks, mobile money, and cards in one dashboard.' },
                            { icon: ChartBarIcon, color: 'bg-blue-100 text-blue-600', title: 'Insights that make sense', desc: 'Spending by category, income vs expense, and trends.' },
                            { icon: BanknotesIcon, color: 'bg-amber-100 text-amber-600', title: 'Budgets and goals', desc: 'Set limits, track progress, stay on top of finances.' },
                        ].map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-[#C85D3A]/20 transition-colors">
                                <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4`}><v.icon className="h-6 w-6" /></div>
                                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-gray-600">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Here's your financial overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
                        {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                    </span>
                    <Link href="/accounts" className="inline-flex items-center px-4 py-2 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all shadow-sm">
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Account
                    </Link>
                </div>
            </div>

                    {/* Cards carousel */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Your Cards</h2>
                    <div className="flex items-center gap-2">
                                <button onClick={() => scroll('left')} disabled={!canScrollLeft} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all">
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                                <button onClick={() => scroll('right')} disabled={!canScrollRight} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all">
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>
                <div className="relative -mx-2">
                            <div ref={scrollContainerRef} className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {accounts.map((account) => (
                                    <Link key={account.id} href={`/accounts/${account.id}`} className="flex-shrink-0">
                                        <AccountCard account={account} />
                                    </Link>
                                ))}
                            </div>
                        </div>
            </div>

                    {/* Stats + transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Income</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">KSh {thisMonthIncome.toLocaleString('en-KE', { minimumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                vs last month <span className={`font-semibold ${incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{incomeChange >= 0 ? '+' : ''}{incomeChange}%</span>
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">KSh {thisMonthExpenses.toLocaleString('en-KE', { minimumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                vs last month <span className={`font-semibold ${expenseChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{expenseChange >= 0 ? '+' : ''}{expenseChange}%</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">Last Transactions</h3>
                            <Link href="/transactions" className="text-sm font-medium text-[#C85D3A] hover:text-[#B85450]">View all</Link>
                        </div>
                        <div>
                            {latestTransactions.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 text-sm">No transactions yet</div>
                            ) : (
                                latestTransactions.map((t) => {
                                    const acct = accounts.find(a => a.id === t.account_id) || t.account;
                                    const { action, counterparty, displayLabel } = parseTransactionLabel(t);
                                    const style = getActionStyle(action);
                                    const theme = acct ? getProviderTheme(acct.provider) : null;
                                    const cardBg = theme ? theme.bg : '#374151';
                                    const cardTxt = theme ? (theme.text || '#fff') : '#fff';
                                    const initial = acct?.provider ? acct.provider.charAt(0).toUpperCase() : '?';
                                    const dateStr = new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    return (
                                        <div key={t.id} className="px-5 py-3.5 flex items-center hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-b-0">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-3" style={{ background: style.icon === 'up' ? '#10B981' : style.icon === 'transfer' ? '#3B82F6' : '#EF4444' }} />
                                            <div className="flex-1 min-w-0 mr-4">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{displayLabel}</p>
                                                <p className="text-xs text-gray-400">{dateStr}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mr-4 flex-shrink-0 w-24">
                                                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cardBg}, ${theme?.bgEnd || cardBg})` }}>
                                                    <span className="text-[8px] font-bold" style={{ color: cardTxt }}>{acct?.provider?.charAt(0)?.toUpperCase() || '?'}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 truncate">{acct?.provider || 'Unknown'}</span>
                                            </div>
                                            <p className={`text-sm font-bold flex-shrink-0 text-right w-28 ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
                                                {t.type === 'income' ? '+' : '-'}KSh {parseFloat(t.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Wallet Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm text-gray-600">Income</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">KSh {thisMonthIncome.toLocaleString('en-KE')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-gray-600">Expenses</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">KSh {thisMonthExpenses.toLocaleString('en-KE')}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total balance</span>
                                        <span className="text-sm font-bold text-gray-900">KSh {totalBalance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Accounts</span>
                                        <span className="text-sm font-semibold text-gray-900">{accounts.length}</span>
                                    </div>
                                </div>
                                <Link href="/accounts" className="mt-4 w-full block text-center py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-colors text-sm">
                                    Manage accounts
                                </Link>
                            </div>
                        </div>
                </div>

                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                </>
            )}

            {/* Add Account Modal */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true" role="dialog">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Add New Account</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Step {modalStep} of 2</p>
                                </div>
                                <button onClick={closeModal} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="px-6 pt-4">
                                <div className="flex gap-2">
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${modalStep >= 1 ? 'bg-[#C85D3A]' : 'bg-gray-200'}`} />
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${modalStep >= 2 ? 'bg-[#C85D3A]' : 'bg-gray-200'}`} />
                                </div>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    {modalStep === 1 && (
                                        <div className="space-y-5">
                                            {data.provider && (
                                                <div className="flex justify-center mb-2">
                                                    <AccountCard account={{ provider: data.provider, account_name: data.account_name || 'Your Name', account_number: data.account_number || '0000', account_type: data.account_type, balance: data.balance || '0', currency: data.currency }} />
                                                </div>
                                            )}
                                    <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
                                                <select value={data.provider} onChange={(e) => setData('provider', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.provider, data.provider)}`} required>
                                                    <option value="">Select your bank or provider</option>
                                            {PROVIDER_CATEGORIES.map((cat) => (
                                                <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                                                            {cat.providers.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                                                        </optgroup>
                                            ))}
                                        </select>
                                                {errors.provider && <p className="text-red-600 text-xs mt-1">{errors.provider}</p>}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                                                    <input type="text" value={data.account_name} onChange={(e) => setData('account_name', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.account_name, data.account_name)}`} placeholder="e.g., Personal Savings" required />
                                                    {errors.account_name && <p className="text-red-600 text-xs mt-1">{errors.account_name}</p>}
                                    </div>
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last 4 digits</label>
                                                    <input type="text" inputMode="numeric" maxLength={4} value={data.account_number} onChange={(e) => setData('account_number', e.target.value.replace(/\D/g, '').slice(0, 4))} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.account_number, data.account_number)}`} placeholder="e.g., 5643" />
                                                </div>
                                    </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                                                    <select value={data.account_type} onChange={(e) => setData('account_type', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(null, data.account_type)}`}>
                                                        {accountTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                                                    <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.currency, data.currency)}`}>
                                                        {CURRENCIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                                                    </select>
                                                </div>
                                    </div>
                                    <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Balance</label>
                                                <input type="number" step="0.01" min="0" value={data.balance} onChange={(e) => setData('balance', e.target.value)} className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.balance, data.balance && data.balance !== '0.00' ? data.balance : null)}`} placeholder="0.00" required />
                                                {errors.balance && <p className="text-red-600 text-xs mt-1">{errors.balance}</p>}
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button type="button" onClick={() => setModalStep(2)} disabled={!data.provider || !data.account_name} className="px-6 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                                    Continue
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {modalStep === 2 && (
                                        <div className="space-y-5">
                                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#C85D3A]/10 flex items-center justify-center flex-shrink-0"><DocumentTextIcon className="h-5 w-5 text-[#C85D3A]" /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Upload transaction statements</p>
                                                    <p className="text-xs text-gray-500">Drop CSV or PDF files. We'll extract transactions automatically.</p>
                                                </div>
                                            </div>
                                            <FileUploadZone value={data.statement_files} onChange={(files) => setData('statement_files', files)} maxFiles={5} className={errors.statement_files ? '!border-red-500' : (data.statement_files?.length > 0 ? '!border-emerald-500' : '')} />
                                            {errors.statement_files && <p className="text-red-600 text-xs mt-1">{errors.statement_files}</p>}
                                            <div className="flex items-center justify-between pt-2">
                                                <button type="button" onClick={() => setModalStep(1)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Back</button>
                                                <div className="flex gap-3">
                                                    <button type="submit" disabled={processing} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all" onClick={() => setData('statement_files', [])}>Skip & Create</button>
                                                    <button type="submit" disabled={processing || !data.statement_files?.length} className="px-6 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 disabled:cursor-not-allowed transition-all">{processing ? 'Processing...' : 'Create Account'}</button>
                                    </div>
                                    </div>
                                    </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Processing overlay */}
            {isProcessingModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
                        {processingStep === 'error' ? (
                            <>
                                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <XMarkIcon className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                                <p className="text-sm text-gray-500 mb-6">{processingError || 'The file could not be processed. Please check the format and try again.'}</p>
                                <button
                                    onClick={() => { setIsProcessingModalOpen(false); setProcessingStep('idle'); setProcessingError(null); setIsModalOpen(true); setModalStep(2); }}
                                    className="px-5 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all text-sm"
                                >
                                    Try again
                                </button>
                            </>
                        ) : processingStep !== 'done' ? (
                            <>
                                <div className="relative mx-auto w-16 h-16 mb-6">
                                    <div className="absolute inset-0 rounded-full border-4 border-[#C85D3A]/20 animate-ping" style={{ animationDuration: '2s' }} />
                                    <div className="absolute inset-2 rounded-full border-4 border-[#C85D3A]/30 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {(() => { const s = processingSteps.find((p) => p.key === processingStep); const I = s?.icon || SparklesIcon; return <I className="h-7 w-7 text-[#C85D3A]" />; })()}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {processingSteps.find((s) => s.key === processingStep)?.label || 'Processing...'}
                                </h3>
                                <p className="text-sm text-gray-500">This may take a few seconds.</p>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                                    <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">All done!</h3>
                                <p className="text-sm text-gray-500">Account created and transactions imported.</p>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
