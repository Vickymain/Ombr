import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import FileUploadZone from '../Components/FileUploadZone';
import {
    PlusIcon,
    XMarkIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    WalletIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    SparklesIcon,
    DocumentTextIcon,
    CpuChipIcon,
    CloudArrowUpIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useForm, Link, router } from '@inertiajs/react';
import { PROVIDER_CATEGORIES, CURRENCIES, getProviderCardConfig, getProviderTheme } from '../data/providers';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { parseTransactionLabel, getActionStyle } from '../utils/transactionLabels';

function fieldBorderClass(error, value) {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    if (value !== undefined && value !== null && value !== '') return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20';
    return 'border-gray-300 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A]';
}

const accountTypes = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
];

const KES_RATES = { USD: 130, EUR: 140, GBP: 160 };

const processingSteps = [
    { key: 'creating', icon: CloudArrowUpIcon, label: 'Creating account...', description: 'Setting up your new account' },
    { key: 'reading', icon: DocumentTextIcon, label: 'Reading statements...', description: 'Extracting transaction data from your files' },
    { key: 'analysing', icon: CpuChipIcon, label: 'Analysing data...', description: 'Categorising and processing transactions' },
    { key: 'finalising', icon: SparklesIcon, label: 'Finalising...', description: 'Updating your account balance and insights' },
];

export default function Accounts({
    accounts = [],
    thisMonthIncome = 0,
    thisMonthExpenses = 0,
    incomeChange = 0,
    expenseChange = 0,
    monthlyData = [],
    recentTransactions = [],
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const stepTimersRef = useRef([]);
    const scrollContainerRef = useRef(null);
    const [modalStep, setModalStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        currency: 'KES',
        statement_files: [],
    });

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [processingError, setProcessingError] = useState(null);

    const totalBalanceKes = accounts.reduce((sum, acc) => {
        const raw = parseFloat(acc.balance || 0);
        if (Number.isNaN(raw)) return sum;
        if (acc.currency === 'KES') return sum + raw;
        const rate = KES_RATES[acc.currency];
        return rate ? sum + raw * rate : sum + raw;
    }, 0);

    const netSavings = thisMonthIncome - thisMonthExpenses;

    const capPercent = (val) => {
        const n = parseFloat(val);
        if (Number.isNaN(n)) return '0';
        if (n > 999) return '>999';
        if (n < -999) return '<-999';
        return n.toFixed(1);
    };

    const handleDeleteAccount = (id) => {
        router.delete(`/accounts/${id}`, {
            onSuccess: () => setDeleteConfirmId(null),
        });
    };

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
        return () => {
            stepTimersRef.current.forEach(clearTimeout);
            stepTimersRef.current = [];
        };
    }, []);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -340 : 340,
                behavior: 'smooth',
            });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessingError(null);
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
                        window.__ombrSkipLoading = false;
                        closeModal();
                    }, 1500);
                    stepTimersRef.current.push(t);
                } else {
                    closeModal();
                }
            },
            onError: (errs) => {
                stepTimersRef.current.forEach(clearTimeout);
                stepTimersRef.current = [];
                setProcessingStep('error');
                const msg = errs?.statement_files || Object.values(errs || {}).flat().join(' ') || 'Something went wrong. Please try again.';
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
                setTimeout(() => setProcessingStep('finalising'), 3200),
            ];
        }

        post('/accounts', formOptions);
    };

    const previewConfig = getProviderCardConfig(data.provider);

    return (
        <AppLayout title="Accounts" totalBalance={totalBalanceKes}>
            {/* Page header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your financial accounts and track balances across providers.
                    </p>
                </div>
                <button
                    onClick={openModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all shadow-sm hover:shadow-md"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Account
                </button>
            </div>

            {/* Stats overview - flat, no card background */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <WalletIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        KSh {totalBalanceKes.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Income</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        KSh {thisMonthIncome.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        vs last month <span className={`font-semibold ${incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{incomeChange >= 0 ? '+' : ''}{capPercent(incomeChange)}%</span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        KSh {thisMonthExpenses.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        vs last month <span className={`font-semibold ${expenseChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{expenseChange >= 0 ? '+' : ''}{capPercent(expenseChange)}%</span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BanknotesIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Savings</span>
                    </div>
                    <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {netSavings >= 0 ? '+' : ''}KSh {Math.abs(netSavings).toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">This month</p>
                </div>
            </div>

            {/* Income vs expenses: dual line (not bars) */}
            {monthlyData.length > 0 && (
                <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Income &amp; expenses by month</h3>
                    <p className="text-xs text-gray-500 mb-4">Last six months across all accounts (line trend)</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <ComposedChart data={monthlyData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                formatter={(val, name) => [`KSh ${Number(val).toLocaleString()}`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} connectNulls isAnimationActive={false} />
                            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} connectNulls isAnimationActive={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Cards section */}
                {accounts.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C85D3A]/10 flex items-center justify-center">
                        <BanknotesIcon className="h-8 w-8 text-[#C85D3A]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        Add your first account to start tracking your finances. Upload a bank statement and we'll do the rest.
                    </p>
                        <button
                            onClick={openModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all shadow-sm"
                        >
                        <PlusIcon className="h-5 w-5" />
                        Add your first account
                        </button>
                    </div>
                ) : (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Your Cards</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Click a card to view detailed insights</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all">
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all">
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div className="relative -mx-2">
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            {accounts.map((account) => (
                                <div key={account.id} className="flex-shrink-0 relative group">
                                    <Link href={`/accounts/${account.id}`}>
                                        <AccountCard account={account} />
                                    </Link>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmId(account.id); }}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Delete account"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {/* Add card button */}
                            <button
                                onClick={openModal}
                                className="flex-shrink-0 w-80 h-52 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-[#C85D3A] hover:bg-[#C85D3A]/5 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-[#C85D3A]/10 flex items-center justify-center transition-colors">
                                    <PlusIcon className="h-6 w-6 text-gray-400 group-hover:text-[#C85D3A] transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-[#C85D3A] transition-colors">Add new account</span>
                            </button>
                        </div>
                        </div>
                    </div>
                )}

            {/* Recent transactions section */}
            {recentTransactions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                        <Link href="/transactions" className="text-sm font-medium text-[#C85D3A] hover:text-[#B85450] transition-colors">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentTransactions.slice(0, 8).map((transaction) => {
                            const { action, displayLabel } = parseTransactionLabel(transaction);
                            const style = getActionStyle(action);
                            const theme = transaction.account ? getProviderTheme(transaction.account.provider) : null;
                            const cardBg = theme ? theme.bg : '#374151';
                            const cardTxt = theme ? (theme.text || '#fff') : '#fff';
                            return (
                                <div key={transaction.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: style.icon === 'up' ? '#10B981' : style.icon === 'transfer' ? '#3B82F6' : '#EF4444' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{displayLabel}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(transaction.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 w-12 h-8 rounded-md flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${cardBg}, ${theme?.bgEnd || cardBg})` }}>
                                        <span className="text-[10px] font-bold" style={{ color: cardTxt }}>{transaction.account?.provider?.slice(0, 4)?.toUpperCase() || '?'}</span>
                                    </div>
                                    <p className={`text-sm font-bold flex-shrink-0 ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}KSh {parseFloat(transaction.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
            </div>
            )}

            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

            {/* Delete account confirmation modal */}
            {deleteConfirmId && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-500 mb-6">This will permanently delete this account and all its transactions. This action cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
                                <button onClick={() => handleDeleteAccount(deleteConfirmId)} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Add account modal - multi-step with live card preview */}
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

                            {/* Step indicator */}
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
                                            {/* Live card preview */}
                                            {data.provider && (
                                                <div className="flex justify-center mb-2">
                                                    <AccountCard account={{
                                                        provider: data.provider,
                                                        account_name: data.account_name || 'Your Name',
                                                        account_number: data.account_number || '0000',
                                                        account_type: data.account_type,
                                                        balance: data.balance || '0',
                                                        currency: data.currency,
                                                    }} />
                                                </div>
                                            )}

                                    <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
                                        <select
                                            value={data.provider}
                                            onChange={(e) => setData('provider', e.target.value)}
                                                    className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.provider, data.provider)}`}
                                            required
                                        >
                                                    <option value="">Select your bank or provider</option>
                                            {PROVIDER_CATEGORIES.map((cat) => (
                                                <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                                                    {cat.providers.map((p) => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                                {errors.provider && <p className="text-red-600 text-xs mt-1">{errors.provider}</p>}
                                    </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                                        className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.account_name, data.account_name)}`}
                                                        placeholder="e.g., Personal Savings"
                                            required
                                        />
                                                    {errors.account_name && <p className="text-red-600 text-xs mt-1">{errors.account_name}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last 4 digits</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={4}
                                                        value={data.account_number}
                                                        onChange={(e) => setData('account_number', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                        className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.account_number, data.account_number)}`}
                                                        placeholder="e.g., 5643"
                                                    />
                                                </div>
                                    </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                                        <select
                                            value={data.account_type}
                                            onChange={(e) => setData('account_type', e.target.value)}
                                                        className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(null, data.account_type)}`}
                                        >
                                            {accountTypes.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                                            <select
                                                value={data.currency}
                                                onChange={(e) => setData('currency', e.target.value)}
                                                        className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.currency, data.currency)}`}
                                            >
                                                {CURRENCIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Balance</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.balance}
                                                onChange={(e) => setData('balance', e.target.value)}
                                                    className={`w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none transition-all border ${fieldBorderClass(errors.balance, data.balance && data.balance !== '0.00' ? data.balance : null)}`}
                                                placeholder="0.00"
                                                required
                                            />
                                                {errors.balance && <p className="text-red-600 text-xs mt-1">{errors.balance}</p>}
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setModalStep(2)}
                                                    disabled={!data.provider || !data.account_name}
                                                    className="px-6 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {modalStep === 2 && (
                                        <div className="space-y-5">
                                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#C85D3A]/10 flex items-center justify-center flex-shrink-0">
                                                    <DocumentTextIcon className="h-5 w-5 text-[#C85D3A]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Upload transaction statements</p>
                                                    <p className="text-xs text-gray-500">Drop CSV or PDF files from {data.provider || 'your provider'}. We'll extract transactions automatically.</p>
                                                </div>
                                    </div>

                                        <FileUploadZone
                                            value={data.statement_files}
                                            onChange={(files) => setData('statement_files', files)}
                                            maxFiles={5}
                                            className={errors.statement_files ? '!border-red-500' : (data.statement_files?.length > 0 ? '!border-emerald-500' : '')}
                                        />
                                            {errors.statement_files && <p className="text-red-600 text-xs mt-1">{errors.statement_files}</p>}

                                            <div className="flex items-center justify-between pt-2">
                                                <button type="button" onClick={() => setModalStep(1)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                                    Back
                                                </button>
                                                <div className="flex gap-3">
                                        <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                                                        onClick={() => setData('statement_files', [])}
                                                    >
                                                        Skip & Create
                                        </button>
                                        <button
                                            type="submit"
                                                        disabled={processing || !data.statement_files?.length}
                                                        className="px-6 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                                        {processing ? 'Processing...' : 'Create Account'}
                                        </button>
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

            {/* Creative processing overlay */}
            {isProcessingModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
                        {processingStep === 'error' ? (
                            <div className="text-center">
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
                            </div>
                        ) : processingStep !== 'done' ? (
                            <div className="text-center">
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 rounded-full border-4 border-[#C85D3A]/20 animate-ping" style={{ animationDuration: '2s' }} />
                                    <div className="absolute inset-2 rounded-full border-4 border-[#C85D3A]/30 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
                                    <div className="absolute inset-4 rounded-full border-4 border-[#C85D3A]/40 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {(() => {
                                            const step = processingSteps.find(s => s.key === processingStep);
                                            const Icon = step?.icon || SparklesIcon;
                                            return <Icon className="h-8 w-8 text-[#C85D3A]" />;
                                        })()}
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    {processingSteps.map((step, i) => {
                                        const currentIdx = processingSteps.findIndex(s => s.key === processingStep);
                                        const isComplete = i < currentIdx;
                                        const isCurrent = step.key === processingStep;
                                        return (
                                            <div key={step.key} className={`flex items-center gap-3 transition-all duration-300 ${isCurrent ? 'opacity-100' : isComplete ? 'opacity-60' : 'opacity-30'}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isComplete ? 'bg-emerald-500' : isCurrent ? 'bg-[#C85D3A] animate-pulse' : 'bg-gray-200'}`}>
                                                    {isComplete ? (
                                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>{step.label}</p>
                                                    {isCurrent && <p className="text-xs text-gray-500">{step.description}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">All done!</h3>
                                <p className="text-sm text-gray-500">
                                    Your account has been created and transactions imported. Redirecting to your accounts...
                                </p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
