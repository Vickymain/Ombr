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
    ArrowPathIcon,
    ChartBarIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { PROVIDER_CATEGORIES, CURRENCIES } from '../data/providers';

/** Border classes: grey default, red when error, green when valid */
function fieldBorderClass(error, value) {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    if (value !== undefined && value !== null && value !== '') return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20';
    return 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500';
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
        let label = null;
        let dateStr = '';
        if (d === today) {
            label = 'Today';
            dateStr = new Date(t.transaction_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } else if (d === yesterday) {
            label = 'Yesterday';
            dateStr = new Date(t.transaction_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            label = new Date(t.transaction_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            dateStr = label;
        }
        if (label !== currentLabel) {
            if (currentItems.length) groups.push({ label: currentLabel, dateStr: currentItems[0]?.transaction_date, items: currentItems });
            currentLabel = label;
            currentItems = [];
        }
        currentItems.push({ ...t, _dateStr: dateStr });
    });
    if (currentItems.length) groups.push({ label: currentLabel, dateStr: currentItems[0]?.transaction_date, items: currentItems });
    return groups;
}

const accountTypes = [
    { value: 'checking', label: 'Checking', color: 'bg-blue-100 text-blue-800' },
    { value: 'savings', label: 'Savings', color: 'bg-green-100 text-green-800' },
    { value: 'credit', label: 'Credit Card', color: 'bg-purple-100 text-purple-800' },
    { value: 'investment', label: 'Investment', color: 'bg-orange-100 text-orange-800' },
    { value: 'cash', label: 'Cash', color: 'bg-gray-100 text-gray-800' },
    { value: 'other', label: 'Other', color: 'bg-indigo-100 text-indigo-800' },
];

export default function Dashboard({ accounts = [], recentTransactions = [], monthlyData = [], categoryData = [] }) {
    const page = usePage();
    const user = page.props?.auth?.user;
    const scrollContainerRef = useRef(null);
    const transactionGroups = useMemo(() => groupTransactionsByDate(recentTransactions), [recentTransactions]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle');
    const stepTimersRef = useRef([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        currency: 'USD',
        statement_files: [],
    });

    // Ensure monthlyData has at least 6 months of data
    const safeMonthlyData = monthlyData && monthlyData.length > 0 ? monthlyData : Array(6).fill(null).map((_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        return {
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            income: 0,
            expenses: 0,
        };
    });

    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const totalInvestments = accounts
        .filter(acc => acc.account_type === 'investment')
        .reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const thisMonthIncome = safeMonthlyData[safeMonthlyData.length - 1]?.income || 0;
    const thisMonthExpenses = safeMonthlyData[safeMonthlyData.length - 1]?.expenses || 0;
    const lastMonthIncome = safeMonthlyData[safeMonthlyData.length - 2]?.income || 1;
    const lastMonthExpenses = safeMonthlyData[safeMonthlyData.length - 2]?.expenses || 1;
    
    const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1);
    const expenseChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1);

    // Mock data for additional stats
    const cashback = 1324;
    const monthlyTurnover = 87324;

    // Fast payment options
    const fastPayments = [
        { name: 'Training', amount: 650, icon: '🏋️' },
        { name: 'Internet', amount: 45, icon: '📡' },
        { name: 'Gas Station', amount: 135, icon: '⛽' },
        { name: 'Cinema', amount: 15, icon: '🎬' },
        { name: 'Clothes', amount: 700, icon: '👔' },
        { name: 'Coffee', amount: 50, icon: '☕' },
    ];

    // Check scroll position
    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; // Card width + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // Check position after scroll
            setTimeout(checkScrollPosition, 300);
        }
    };

    // Check scroll position on mount and when accounts change
    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [accounts]);

    const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

    // Check if user has no accounts (new user)
    const hasNoAccounts = accounts.length === 0;

    const openModal = () => {
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    useEffect(() => {
        return () => {
            stepTimersRef.current.forEach(clearTimeout);
            stepTimersRef.current = [];
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const hasFiles = data.statement_files && data.statement_files.length > 0;
        const formOptions = {
            forceFormData: hasFiles,
            onSuccess: () => {
                if (hasFiles) {
                    setProcessingStep('done');
                    stepTimersRef.current.forEach(clearTimeout);
                    stepTimersRef.current = [];
                    const t = setTimeout(() => {
                        setIsProcessingModalOpen(false);
                        setProcessingStep('idle');
                        closeModal();
                    }, 1200);
                    stepTimersRef.current.push(t);
                } else {
                    closeModal();
                }
            },
            onError: () => {
                stepTimersRef.current.forEach(clearTimeout);
                stepTimersRef.current = [];
                setIsProcessingModalOpen(false);
                setProcessingStep('idle');
            },
        };

        if (hasFiles) {
            setIsProcessingModalOpen(true);
            setProcessingStep('creating');
            stepTimersRef.current.forEach(clearTimeout);
            stepTimersRef.current = [
                setTimeout(() => setProcessingStep('reading'), 700),
                setTimeout(() => setProcessingStep('analysing'), 1500),
            ];
        }

        post('/accounts', formOptions);
    };

    return (
        <AppLayout title="Dashboard" totalBalance={totalBalance}>
            {hasNoAccounts ? (
                /* Welcome / onboarding for new users */
                <div className="max-w-4xl mx-auto">
                    {/* Hero */}
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
                            <button
                                onClick={openModal}
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#B85450] rounded-2xl font-semibold hover:bg-white/95 transition-all shadow-lg"
                            >
                                <PlusIcon className="h-6 w-6 mr-2" />
                                Add your first account
                            </button>
                            <p className="mt-4 text-sm text-white/70">CSV or PDF · Takes under 2 minutes</p>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#C85D3A]/10 text-[#B85450] font-bold flex items-center justify-center">1</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Choose your bank or provider</h3>
                                    <p className="text-sm text-gray-600">Mpesa, Equity, KCB, or any other — we support mobile money and banks.</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#C85D3A]/10 text-[#B85450] font-bold flex items-center justify-center">2</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Upload your statement</h3>
                                    <p className="text-sm text-gray-600">Drop a CSV or PDF; we read it and pull in your transactions automatically.</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#C85D3A]/10 text-[#B85450] font-bold flex items-center justify-center">3</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">See your dashboard</h3>
                                    <p className="text-sm text-gray-600">Balance, income, expenses, and insights — all in one view.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Value props */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-[#C85D3A]/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                <CreditCardIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">All accounts in one place</h3>
                            <p className="text-sm text-gray-600">Banks, mobile money, and cards — one dashboard, one balance view.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-[#C85D3A]/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Insights that make sense</h3>
                            <p className="text-sm text-gray-600">Spending by category, income vs expense, and trends over time.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-[#C85D3A]/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                                <BanknotesIcon className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Budgets and goals</h3>
                            <p className="text-sm text-gray-600">Set limits, track progress, and stay on top of your finances.</p>
                        </div>
                    </div>

                    {/* Secondary CTA */}
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
                        <p className="text-gray-600 mb-4">Ready to connect your first account?</p>
                        <button
                            onClick={openModal}
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add account
                        </button>
                    </div>
                </div>
            ) : (
                /* Regular Dashboard with Accounts */
                <>
            {/* Greeting + Account selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your financial overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
                        {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                    </div>
                    <Link
                        href="/accounts"
                        className="inline-flex items-center px-4 py-2 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-colors shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Account
                    </Link>
                </div>
            </div>

            {/* Your cards - carousel */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your cards</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => scroll('left')} disabled={!canScrollLeft} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-40 hover:bg-gray-50">
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <button onClick={() => scroll('right')} disabled={!canScrollRight} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-40 hover:bg-gray-50">
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <button onClick={openModal} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add card
                        </button>
                    </div>
                </div>
                <div className="relative -mx-2">
                    <div ref={scrollContainerRef} className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {accounts.length === 0 ? (
                            <div className="w-full min-w-[320px] bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center shadow-sm">
                                <CreditCardIcon className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-base font-medium text-gray-900 mb-1">No cards yet</h3>
                                <p className="text-sm text-gray-500 mb-4">Add your first account to see it here</p>
                                <button onClick={openModal} className="inline-flex items-center px-4 py-2 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450]">
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add card
                                </button>
                            </div>
                        ) : (
                            accounts.map((account) => <AccountCard key={account.id} account={account} />)
                        )}
                    </div>
                </div>
            </div>

            {/* Income + Expense cards + Right sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left: Income & Expense */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-600">Income</span>
                                <div className="p-2 bg-emerald-100 rounded-xl"><ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" /></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-500 mt-1">vs last month <span className={(incomeChange >= 0) ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{(incomeChange >= 0) ? '+' : ''}{incomeChange}%</span></p>
                            <div className="mt-3 h-10">
                                <ResponsiveContainer width="100%" height={40}>
                                    <LineChart data={safeMonthlyData.slice(-6)}><Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-600">Expense</span>
                                <div className="p-2 bg-red-100 rounded-xl"><ArrowDownIcon className="h-5 w-5 text-red-600" /></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-500 mt-1">vs last month <span className={(expenseChange >= 0) ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>{(expenseChange >= 0) ? '+' : ''}{expenseChange}%</span></p>
                            <div className="mt-3 h-10">
                                <ResponsiveContainer width="100%" height={40}>
                                    <LineChart data={safeMonthlyData.slice(-6)}><Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions - date grouped */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Recent transactions</h3>
                            <Link href="/transactions" className="text-sm font-medium text-[#C85D3A] hover:text-[#B85450]">View all</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentTransactions.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 text-sm">No transactions yet</div>
                            ) : (
                                transactionGroups.slice(0, 3).map((group) => (
                                    <div key={group.label + group.dateStr}>
                                        <div className="px-5 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            {group.label} | {group.items[0]?._dateStr}
                                        </div>
                                        {group.items.slice(0, 5).map((transaction) => (
                                            <div key={transaction.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                        {transaction.type === 'income' ? <ArrowUpIcon className="h-5 w-5 text-emerald-600" /> : <ArrowDownIcon className="h-5 w-5 text-red-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{transaction.category}</p>
                                                        <p className="text-xs text-gray-500">{transaction.description || 'Transaction'}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-base font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Wallet summary + quick stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Wallet summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><ArrowUpIcon className="h-5 w-5 text-emerald-600" /></div>
                                    <span className="text-sm text-gray-600">Income</span>
                                </div>
                                <span className="font-semibold text-gray-900">${thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><ArrowDownIcon className="h-5 w-5 text-red-600" /></div>
                                    <span className="text-sm text-gray-600">Outcome</span>
                                </div>
                                <span className="font-semibold text-gray-900">${thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                        <button onClick={openModal} className="mt-4 w-full py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-colors">
                            Add another card
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total balance</span>
                                <span className="font-semibold text-gray-900">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Investments</span>
                                <span className="font-semibold text-gray-900">${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spending by category */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by category</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={categoryData.slice(0, 4)} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                {categoryData.slice(0, 4).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 text-sm text-gray-600">
                        {categoryData.slice(0, 4).map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {entry.name}: ${Number(entry.value || 0).toLocaleString()}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
                </>
            )}

            {/* Add Account Modal - portaled so it always appears on top */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true" role="dialog">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div
                            className="fixed inset-0 bg-gray-500/75 transition-opacity"
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        <div className="relative z-10 bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Add New Account
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                                        <select
                                            value={data.provider}
                                            onChange={(e) => setData('provider', e.target.value)}
                                            className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(errors.provider, data.provider)}`}
                                            required
                                        >
                                            <option value="">Select provider</option>
                                            {PROVIDER_CATEGORIES.map((cat) => (
                                                <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                                                    {cat.providers.map((p) => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        {errors.provider && <p className="text-red-600 text-sm mt-1">{errors.provider}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                            className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(errors.account_name, data.account_name)}`}
                                            placeholder="e.g., Mpesa Personal"
                                            required
                                        />
                                        {errors.account_name && <p className="text-red-600 text-sm mt-1">{errors.account_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                        <select
                                            value={data.account_type}
                                            onChange={(e) => setData('account_type', e.target.value)}
                                            className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(null, data.account_type)}`}
                                            required
                                        >
                                            {accountTypes.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (last 4 digits)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={data.account_number}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                setData('account_number', v);
                                            }}
                                            className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(errors.account_number, data.account_number)}`}
                                            placeholder="e.g. 5643"
                                        />
                                        {errors.account_number && <p className="text-red-600 text-sm mt-1">{errors.account_number}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={data.currency}
                                                onChange={(e) => setData('currency', e.target.value)}
                                                className={`flex-shrink-0 w-28 px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(errors.currency, data.currency)}`}
                                            >
                                                {CURRENCIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.balance}
                                                onChange={(e) => setData('balance', e.target.value)}
                                                className={`flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-colors ${fieldBorderClass(errors.balance, data.balance && data.balance !== '0.00' ? data.balance : null)}`}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        {errors.balance && <p className="text-red-600 text-sm mt-1">{errors.balance}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction Logs (CSV or PDF, up to 5 files) <span className="text-red-500">*</span>
                                        </label>
                                        <FileUploadZone
                                            value={data.statement_files}
                                            onChange={(files) => setData('statement_files', files)}
                                            maxFiles={5}
                                            required
                                            className={errors.statement_files ? '!border-red-500' : (data.statement_files?.length > 0 ? '!border-emerald-500' : '')}
                                        />
                                        {errors.statement_files && <p className="text-red-600 text-sm mt-1">{errors.statement_files}</p>}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Upload statements from Mpesa or your bank. Ombr will read them and create transactions for this account.
                                        </p>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Add Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {isProcessingModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 text-center">
                        {processingStep !== 'done' ? (
                            <>
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {processingStep === 'creating' && 'Creating account...'}
                                    {processingStep === 'reading' && 'Reading transaction logs...'}
                                    {processingStep === 'analysing' && 'Processing transactions...'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    We&apos;re reading your statement and updating your account insights. This may take a few seconds.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Done!</h3>
                                <p className="text-sm text-gray-600">
                                    Your account and transactions have been imported. You can now explore your updated insights.
                                </p>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
