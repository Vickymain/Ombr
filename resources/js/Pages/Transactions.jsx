import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useForm, router } from '@inertiajs/react';

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    BTC: '₿',
};

// Approximate KES conversion rates for display when showing all in KSh alongside native currency
const KES_RATES = {
    USD: 130,
    EUR: 140,
    GBP: 160,
};

function formatTransactionAmounts(transaction, account) {
    const currency = account?.currency || 'USD';
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const rawAmount = parseFloat(transaction.amount || 0);

    if (Number.isNaN(rawAmount)) {
        return { main: `${symbol}0.00`, converted: null };
    }

    if (currency === 'KES') {
        const formatted = `KSh ${rawAmount.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
        return { main: formatted, converted: null };
    }

    const main = `${symbol}${rawAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    const rate = KES_RATES[currency];
    if (!rate) {
        return { main, converted: null };
    }

    const kesAmount = rawAmount * rate;
    const converted = `KSh ${kesAmount.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    return { main, converted };
}

function getTransactionActionLabel(transaction) {
    if (transaction.type === 'income') return 'Received';
    if (transaction.type === 'expense') return 'Paid';
    if (transaction.type === 'transfer') return 'Transfer';
    return 'Transaction';
}

export default function Transactions({ transactions = [], accounts = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        account_id: accounts[0]?.id || '',
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'card',
        notes: '',
    });

    const [importAccountId, setImportAccountId] = useState(accounts[0]?.id || '');
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState('');

    const openModal = () => {
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const openImportModal = () => {
        setImportAccountId(accounts[0]?.id || '');
        setImportFile(null);
        setImportError('');
        setIsImportModalOpen(true);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/transactions', {
            onSuccess: () => closeModal(),
        });
    };

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
    const currentCategories = data.type === 'income' ? incomeCategories : expenseCategories;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    return (
        <AppLayout title="Transactions" totalBalance={totalBalance}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-600">Track your income and expenses</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={openImportModal}
                        className="inline-flex items-center px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Import CSV / PDF
                    </button>
                    <button
                        onClick={openModal}
                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex space-x-2">
                        {['all', 'income', 'expense', 'transfer'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    filterType === type
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-lg shadow">
                <div className="divide-y divide-gray-200">
                    {filteredTransactions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                            <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
                            <button
                                onClick={openModal}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Transaction
                            </button>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => {
                            const account = accounts.find(a => a.id === transaction.account_id);
                            const { main: mainAmount, converted } = formatTransactionAmounts(transaction, account);
                            const actionLabel = getTransactionActionLabel(transaction);
                            const typeLabel = transaction.type === 'income'
                                ? 'Income'
                                : transaction.type === 'expense'
                                    ? 'Expense'
                                    : 'Transfer';
                            return (
                                <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                transaction.type === 'income'
                                                    ? 'bg-green-100 text-green-700'
                                                    : transaction.type === 'expense'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-900 text-white'
                                            }`}
                                        >
                                            {transaction.type === 'income' ? (
                                                <ArrowUpIcon className="h-6 w-6" />
                                            ) : transaction.type === 'expense' ? (
                                                <ArrowDownIcon className="h-6 w-6" />
                                            ) : (
                                                <span className="text-sm font-medium">↔</span>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {transaction.category && transaction.category !== 'Imported'
                                                        ? transaction.category
                                                        : actionLabel}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                                            <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                    {account?.account_name || 'Unknown Account'}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-900 text-white">
                                                    {typeLabel}
                                                </span>
                                                {transaction.payment_method && <span>• {transaction.payment_method}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p
                                            className={`text-lg font-semibold ${
                                                transaction.type === 'income'
                                                    ? 'text-green-600'
                                                    : transaction.type === 'expense'
                                                    ? 'text-red-600'
                                                    : 'text-gray-900'
                                            }`}
                                        >
                                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                            {mainAmount}
                                        </p>
                                        {converted && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                [{converted}]
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Transaction Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['income', 'expense', 'transfer'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setData('type', type)}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                    data.type === type
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Account */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                        <select
                                        value={data.account_id}
                                        onChange={e => setData('account_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        required
                                    >
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.account_name} - {account.provider}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.account_id && <p className="text-red-600 text-sm mt-1">{errors.account_id}</p>}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={accounts.find(a => a.id === Number(data.account_id))?.currency || 'USD'}
                                            disabled
                                            className="flex-shrink-0 w-28 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
                                        >
                                            <option>
                                                {accounts.find(a => a.id === Number(data.account_id))?.currency || 'USD'}
                                            </option>
                                        </select>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {currentCategories.map(cat => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Grocery shopping"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={e => setData('transaction_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            required
                                        />
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        rows="2"
                                        placeholder="Any additional notes..."
                                    />
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {processing ? 'Adding...' : 'Add Transaction'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeImportModal}
                        />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Import Transactions from File
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Upload a CSV or PDF statement with columns like <span className="font-mono">date, description, amount, type</span>.
                                We&apos;ll create transactions for the selected account.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account
                                    </label>
                                    <select
                                        value={importAccountId}
                                        onChange={(e) => setImportAccountId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.account_name} - {account.provider}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statement File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv,application/pdf,.pdf"
                                        onChange={(e) => {
                                            setImportFile(e.target.files?.[0] || null);
                                            setImportError('');
                                        }}
                                        className="w-full text-sm text-gray-700"
                                    />
                                    {importError && (
                                        <p className="mt-1 text-sm text-red-600">{importError}</p>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                                    Example header:
                                    <span className="font-mono block mt-1">
                                        date,description,amount,type
                                    </span>
                                    <span className="block mt-1">
                                        Type can be <span className="font-mono">income</span>,{' '}
                                        <span className="font-mono">expense</span>,{' '}
                                        <span className="font-mono">credit</span>, or{' '}
                                        <span className="font-mono">debit</span>. If type is missing, positive
                                        amounts are treated as income and negative as expense.
                                    </span>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeImportModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!importFile) {
                                                setImportError('Please choose a CSV file to upload.');
                                                return;
                                            }

                                            const formData = new FormData();
                                            formData.append('account_id', importAccountId);
                                            formData.append('file', importFile);

                                            router.post('/transactions/import', formData, {
                                                forceFormData: true,
                                                onError: (errs) => {
                                                    setImportError(
                                                        errs.file ||
                                                            'There was a problem importing the file.'
                                                    );
                                                },
                                                onSuccess: () => {
                                                    closeImportModal();
                                                },
                                            });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                                    >
                                        Import
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}


