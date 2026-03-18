import { useState, useMemo } from 'react';
import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import {
    ArrowLeftIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    DocumentArrowUpIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Link, useForm } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import FileUploadZone from '../Components/FileUploadZone';
import { createPortal } from 'react-dom';

const COLORS = ['#C85D3A', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444'];

const currencySymbols = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    BTC: '\u20BF',
    KES: 'KSh',
};

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

export default function AccountShow({
    account,
    transactions = [],
    thisMonthIncome = 0,
    thisMonthExpenses = 0,
    monthlyData = [],
    categoryBreakdown = [],
    budgets = [],
    accounts = [],
}) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [visibleTransactions, setVisibleTransactions] = useState(20);

    const cs = currencySymbols[account.currency] || account.currency || '$';
    const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);

    const filtered = useMemo(() => {
        let list = transactions;
        if (filter !== 'all') list = list.filter((t) => t.type === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((t) =>
                (t.category || '').toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q) ||
                (t.reference_number || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [transactions, filter, search]);

    const transactionGroups = useMemo(() => groupTransactionsByDate(filtered.slice(0, visibleTransactions)), [filtered, visibleTransactions]);
    const totalTransactions = transactions.length;
    const incomeCount = transactions.filter((t) => t.type === 'income').length;
    const expenseCount = transactions.filter((t) => t.type === 'expense').length;

    const { data: importData, setData: setImportData, post: importPost, processing: importProcessing, reset: importReset } = useForm({
        account_id: account.id,
        statement_files: [],
    });

    const handleImport = (e) => {
        e.preventDefault();
        importPost('/transactions/import', {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                importReset();
            },
        });
    };

    return (
        <AppLayout title={account.account_name} totalBalance={totalBalance}>
            {/* Back button */}
            <Link href="/accounts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to accounts
            </Link>

            {/* Main layout: content left, card right */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left content - 2 cols */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</span>
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <BanknotesIcon className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {cs} {parseFloat(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{totalTransactions} transactions</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Income</span>
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">
                                +{cs} {thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</span>
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                -{cs} {thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">This month</p>
                        </div>
                    </div>

                    {/* Income vs Expense chart */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Overview</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => [`${cs} ${Number(val).toLocaleString()}`, undefined]}
                                />
                                <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Transactions list */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-gray-900">Transactions</h3>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none w-48"
                                        />
                                    </div>
                                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                                        {[{ key: 'all', label: 'All' }, { key: 'income', label: 'Income' }, { key: 'expense', label: 'Expense' }].map((f) => (
                                            <button
                                                key={f.key}
                                                onClick={() => setFilter(f.key)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                                        title="Import transactions"
                                    >
                                        <DocumentArrowUpIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <div className="px-6 py-16 text-center">
                                    <p className="text-gray-400 text-sm">No transactions found</p>
                                </div>
                            ) : (
                                transactionGroups.map((group) => (
                                    <div key={group.label}>
                                        <div className="px-6 py-2 bg-gray-50/80 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            {group.label}
                                        </div>
                                        {group.items.map((t) => (
                                            <div key={t.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                        {t.type === 'income'
                                                            ? <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                                                            : <ArrowDownIcon className="h-4 w-4 text-red-600" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{t.category || 'Uncategorised'}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[220px]">{t.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{cs} {parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>

                        {filtered.length > visibleTransactions && (
                            <div className="px-6 py-4 border-t border-gray-100 text-center">
                                <button
                                    onClick={() => setVisibleTransactions((v) => v + 20)}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#C85D3A] hover:text-[#B85450] transition-colors"
                                >
                                    <ChevronDownIcon className="h-4 w-4" />
                                    Load more ({filtered.length - visibleTransactions} remaining)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right sidebar - card + details */}
                <div className="space-y-6">
                    {/* Card preview */}
                    <div className="flex justify-center">
                        <AccountCard account={account} />
                    </div>

                    {/* Account details */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Account Details</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'Provider', value: account.provider },
                                { label: 'Account Name', value: account.account_name },
                                { label: 'Type', value: account.account_type?.charAt(0).toUpperCase() + account.account_type?.slice(1) },
                                { label: 'Currency', value: account.currency },
                                { label: 'Status', value: account.is_active ? 'Active' : 'Inactive' },
                            ].map((row) => (
                                <div key={row.label} className="flex justify-between text-sm">
                                    <span className="text-gray-500">{row.label}</span>
                                    <span className="font-medium text-gray-900">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Spending by category */}
                    {categoryBreakdown.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Categories</h4>
                            <div className="mb-4">
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                                            {categoryBreakdown.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => [`${cs} ${Number(val).toLocaleString()}`, undefined]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {categoryBreakdown.slice(0, 5).map((cat, i) => (
                                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-gray-600 flex-1 truncate">{cat.name}</span>
                                        <span className="font-medium text-gray-900">{cs} {Number(cat.value).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Budget progress */}
                    {budgets.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Budget Progress</h4>
                            <div className="space-y-4">
                                {budgets.slice(0, 4).map((budget) => (
                                    <div key={budget.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{budget.category}</span>
                                            <span className="font-medium text-gray-900">
                                                {cs} {Number(budget.spent).toLocaleString()} / {cs} {Number(budget.amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full transition-all ${budget.progress >= 100 ? 'bg-red-500' : budget.progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(budget.progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/budgets" className="mt-4 block text-center text-sm font-medium text-[#C85D3A] hover:text-[#B85450] transition-colors">
                                Manage budgets
                            </Link>
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <DocumentArrowUpIcon className="h-5 w-5 text-[#C85D3A]" />
                                <span className="text-sm font-medium text-gray-700">Import statements</span>
                            </button>
                            <Link
                                href="/transactions"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <CalendarDaysIcon className="h-5 w-5 text-[#C85D3A]" />
                                <span className="text-sm font-medium text-gray-700">View all transactions</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import modal */}
            {showImportModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Transactions</h3>
                            <p className="text-sm text-gray-500 mb-4">Upload CSV or PDF statement files for {account.provider}.</p>
                            <form onSubmit={handleImport}>
                                <FileUploadZone
                                    value={importData.statement_files}
                                    onChange={(files) => setImportData('statement_files', files)}
                                    maxFiles={5}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importProcessing || !importData.statement_files?.length}
                                        className="px-5 py-2 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 transition-all"
                                    >
                                        {importProcessing ? 'Importing...' : 'Import'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
