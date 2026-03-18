import { useState, useMemo } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon, CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useForm, router } from '@inertiajs/react';
import { parseTransactionLabel, getActionStyle } from '../utils/transactionLabels';
import { getProviderTheme } from '../data/providers';

const CURRENCY_SYMBOLS = { KES: 'KSh', USD: '$', EUR: '€', GBP: '£', TZS: 'TSh', UGX: 'USh', ZAR: 'R', NGN: '₦', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'Fr', JPY: '¥', CNY: '¥', AED: 'د.إ', BTC: '₿', ETH: 'Ξ', USDT: '$' };
const KES_RATES = { USD: 130, EUR: 140, GBP: 160 };

const DATE_PRESETS = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: '3 Months', value: '3months' },
    { label: '6 Months', value: '6months' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

function fmtAmount(transaction, account) {
    const cur = account?.currency || 'KES';
    const sym = CURRENCY_SYMBOLS[cur] || cur;
    const raw = parseFloat(transaction.amount || 0);
    if (Number.isNaN(raw)) return { main: `${sym}0.00`, converted: null };
    const main = `${sym}${raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (cur === 'KES') return { main, converted: null };
    const rate = KES_RATES[cur];
    if (!rate) return { main, converted: null };
    return { main, converted: `KSh ${(raw * rate).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
}

function groupByDate(transactions) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    const groups = [];
    let cur = null, items = [];
    transactions.forEach((t) => {
        const d = new Date(t.transaction_date).toDateString();
        const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(t.transaction_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        if (label !== cur) { if (items.length) groups.push({ label: cur, items }); cur = label; items = []; }
        items.push(t);
    });
    if (items.length) groups.push({ label: cur, items });
    return groups;
}

function MiniProviderBadge({ provider }) {
    const theme = getProviderTheme(provider);
    const bg = theme ? theme.bg : '#374151';
    const txt = theme ? (theme.text || '#fff') : '#fff';
    const initial = provider ? provider.charAt(0).toUpperCase() : '?';
    return (
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: bg, color: txt }}>
            {initial}
        </div>
    );
}

function ActionIcon({ action }) {
    const style = getActionStyle(action);
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg}`}>
            {style.icon === 'up' ? <ArrowUpIcon className={`h-5 w-5 ${style.text}`} /> :
             style.icon === 'transfer' ? <ArrowsRightLeftIcon className={`h-5 w-5 ${style.text}`} /> :
             <ArrowDownIcon className={`h-5 w-5 ${style.text}`} />}
        </div>
    );
}

export default function Transactions({ transactions = [], accounts = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterAccountId, setFilterAccountId] = useState('all');
    const [filterDatePreset, setFilterDatePreset] = useState('all');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        account_id: accounts[0]?.id || '', type: 'expense', amount: '', category: '', description: '',
        transaction_date: new Date().toISOString().split('T')[0], payment_method: 'card', notes: '',
    });
    const [importAccountId, setImportAccountId] = useState(accounts[0]?.id || '');
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState('');

    const openModal = () => { reset(); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); reset(); };
    const openImportModal = () => { setImportAccountId(accounts[0]?.id || ''); setImportFile(null); setImportError(''); setIsImportModalOpen(true); };
    const closeImportModal = () => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); };
    const handleSubmit = (e) => { e.preventDefault(); post('/transactions', { onSuccess: () => closeModal() }); };

    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
    const currentCategories = data.type === 'income' ? incomeCategories : expenseCategories;
    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

    const filtered = useMemo(() => {
        let list = [...transactions];
        if (filterType !== 'all') list = list.filter(t => t.type === filterType);
        if (filterAccountId !== 'all') list = list.filter(t => String(t.account_id) === String(filterAccountId));

        if (filterDatePreset !== 'all' && filterDatePreset !== 'custom') {
            const now = new Date();
            let start;
            if (filterDatePreset === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            else if (filterDatePreset === 'week') { start = new Date(now); start.setDate(now.getDate() - now.getDay()); }
            else if (filterDatePreset === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (filterDatePreset === '3months') { start = new Date(now); start.setMonth(now.getMonth() - 3); }
            else if (filterDatePreset === '6months') { start = new Date(now); start.setMonth(now.getMonth() - 6); }
            else if (filterDatePreset === 'year') start = new Date(now.getFullYear(), 0, 1);
            if (start) list = list.filter(t => new Date(t.transaction_date) >= start);
        } else if (filterDatePreset === 'custom') {
            if (customStart) list = list.filter(t => new Date(t.transaction_date) >= new Date(customStart));
            if (customEnd) list = list.filter(t => new Date(t.transaction_date) <= new Date(customEnd + 'T23:59:59'));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t => {
                const label = parseTransactionLabel(t);
                const acct = accounts.find(a => a.id === t.account_id);
                const haystack = [
                    t.description, t.category, label.action, label.counterparty, label.displayLabel,
                    acct?.account_name, acct?.provider,
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(q);
            });
        }
        return list;
    }, [transactions, filterType, filterAccountId, filterDatePreset, customStart, customEnd, searchQuery, accounts]);

    const groups = useMemo(() => groupByDate(filtered), [filtered]);
    const hasFilters = filterType !== 'all' || filterAccountId !== 'all' || filterDatePreset !== 'all' || searchQuery.trim();

    return (
        <AppLayout title="Transactions" totalBalance={totalBalance}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openImportModal} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm text-sm">
                        <PlusIcon className="h-4 w-4" /> Import
                    </button>
                    <button onClick={openModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all shadow-sm text-sm">
                        <PlusIcon className="h-4 w-4" /> Add Transaction
                    </button>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, organization, account..."
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter row */}
                <div className="flex flex-wrap items-center gap-3">
                    <FunnelIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />

                    {/* Type filter */}
                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                        {['all', 'income', 'expense', 'transfer'].map(type => (
                            <button key={type} onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Account filter */}
                    <select value={filterAccountId} onChange={e => setFilterAccountId(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none bg-white">
                        <option value="all">All Accounts</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.provider} — {a.account_name}</option>)}
                    </select>

                    {/* Date filter */}
                    <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        <select value={filterDatePreset} onChange={e => setFilterDatePreset(e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none bg-white">
                            <option value="all">All Time</option>
                            {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>

                    {hasFilters && (
                        <button onClick={() => { setFilterType('all'); setFilterAccountId('all'); setFilterDatePreset('all'); setSearchQuery(''); setCustomStart(''); setCustomEnd(''); }}
                            className="text-xs text-[#C85D3A] font-medium hover:underline">Clear all</button>
                    )}
                </div>

                {/* Custom date range */}
                {filterDatePreset === 'custom' && (
                    <div className="flex items-center gap-3 pl-8">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none" />
                        <span className="text-xs text-gray-400">to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none" />
                    </div>
                )}
            </div>

            {/* Transactions grouped by date */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {groups.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{hasFilters ? 'No matching transactions' : 'No transactions yet'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{hasFilters ? 'Try adjusting your filters' : 'Start tracking your finances by adding your first transaction'}</p>
                        {!hasFilters && (
                            <button onClick={openModal} className="inline-flex items-center px-4 py-2 bg-[#C85D3A] text-white rounded-xl text-sm font-medium hover:bg-[#B85450]">
                                <PlusIcon className="h-4 w-4 mr-2" /> Add Transaction
                            </button>
                        )}
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.label}>
                            <div className="px-5 py-2.5 bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">{group.label}</div>
                            {group.items.map((t) => {
                                const account = accounts.find(a => a.id === t.account_id);
                                const { main: mainAmount, converted } = fmtAmount(t, account);
                                const { action, counterparty, displayLabel } = parseTransactionLabel(t);
                                const actionStyle = getActionStyle(action);
                                return (
                                    <div key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-b-0">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <ActionIcon action={action} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{displayLabel}</p>
                                                </div>
                                                {t.description && t.description !== displayLabel && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{t.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {account && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                                            <MiniProviderBadge provider={account.provider} />
                                                            {account.account_name}
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${actionStyle.bg} ${actionStyle.text}`}>
                                                        {action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4 flex-shrink-0">
                                            <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
                                                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{mainAmount}
                                            </p>
                                            {converted && <p className="text-xs text-gray-400 mt-0.5">{converted}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* Add Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['income', 'expense', 'transfer'].map(type => (
                                            <button key={type} type="button" onClick={() => setData('type', type)}
                                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${data.type === type ? 'bg-[#C85D3A] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                    <select value={data.account_id} onChange={e => setData('account_id', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm" required>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} — {a.provider}</option>)}
                                    </select>
                                    {errors.account_id && <p className="text-red-600 text-xs mt-1">{errors.account_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm" placeholder="0.00" required />
                                    {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select value={data.category} onChange={e => setData('category', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm" required>
                                        <option value="">Select a category</option>
                                        {currentCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm" placeholder="e.g., Safaricom payment" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm">
                                            <option value="card">Card</option><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="mobile">Mobile Money</option><option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 text-sm font-medium text-white bg-[#C85D3A] rounded-xl hover:bg-[#B85450] disabled:opacity-50">{processing ? 'Adding...' : 'Add Transaction'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeImportModal} />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Transactions</h3>
                            <p className="text-sm text-gray-500 mb-4">Upload a CSV or PDF statement file.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                    <select value={importAccountId} onChange={e => setImportAccountId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none text-sm">
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} — {a.provider}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statement File</label>
                                    <input type="file" accept=".csv,text/csv,application/pdf,.pdf" onChange={e => { setImportFile(e.target.files?.[0] || null); setImportError(''); }} className="w-full text-sm text-gray-700" />
                                    {importError && <p className="mt-1 text-sm text-red-600">{importError}</p>}
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeImportModal} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                                    <button type="button" onClick={() => {
                                        if (!importFile) { setImportError('Please choose a file.'); return; }
                                        const fd = new FormData(); fd.append('account_id', importAccountId); fd.append('file', importFile);
                                        window.__ombrSkipLoading = true;
                                        router.post('/transactions/import', fd, {
                                            forceFormData: true,
                                            onError: e => { window.__ombrSkipLoading = false; setImportError(e.file || 'Import failed.'); },
                                            onSuccess: () => { window.__ombrSkipLoading = false; closeImportModal(); },
                                            onFinish: () => { window.__ombrSkipLoading = false; },
                                        });
                                    }} className="px-5 py-2.5 text-sm font-medium text-white bg-[#C85D3A] rounded-xl hover:bg-[#B85450]">Import</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
