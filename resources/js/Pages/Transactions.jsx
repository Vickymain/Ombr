import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';

export default function Transactions({ transactions = [], accounts = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const openModal = () => {
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
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

    return (
        <AppLayout title="Transactions">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-600">Track your income and expenses</p>
                </div>
                <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Transaction
                </button>
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
                                        ? 'bg-indigo-600 text-white'
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
                            return (
                                <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            transaction.type === 'income' ? 'bg-green-100' : 
                                            transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                                        }`}>
                                            {transaction.type === 'income' ? (
                                                <ArrowUpIcon className="h-6 w-6 text-green-600" />
                                            ) : transaction.type === 'expense' ? (
                                                <ArrowDownIcon className="h-6 w-6 text-red-600" />
                                            ) : (
                                                <span className="text-blue-600">↔</span>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-gray-900">{transaction.category}</p>
                                                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                                                    transaction.type === 'income' ? 'bg-green-100 text-green-800' :
                                                    transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {transaction.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                                            <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                                <span>{account?.account_name || 'Unknown Account'}</span>
                                                {transaction.payment_method && <span>• {transaction.payment_method}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-lg font-semibold ${
                                            transaction.type === 'income' ? 'text-green-600' : 
                                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                            ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
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
                                                        ? 'bg-indigo-600 text-white'
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Adding...' : 'Add Transaction'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}


