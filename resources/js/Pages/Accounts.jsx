import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';

const accountTypes = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
];

export default function Accounts({ accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        statement_file: null,
    });

    const totalBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance || 0),
        0,
    );

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

        const hasFile = !!data.statement_file;
        const formOptions = {
            forceFormData: hasFile,
            onSuccess: () => {
                closeModal();
            },
        };

        post('/accounts', formOptions);
    };

    return (
        <AppLayout title="Accounts" totalBalance={totalBalance}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Connect an account and upload a transaction log file so Ombr can
                        analyse your data.
                    </p>
                </div>
                <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Account
                </button>
            </div>

            {/* Accounts summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                <p className="text-sm font-medium opacity-90">Total Balance</p>
                <p className="mt-2 text-4xl font-bold">
                    $
                    {totalBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </p>
                <p className="mt-2 text-sm opacity-75">
                    Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Accounts list (simple) */}
            <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                {accounts.length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-500">
                        No accounts yet. Click &quot;Add Account&quot; to get started.
                    </div>
                ) : (
                    accounts.map((account) => (
                        <div
                            key={account.id}
                            className="px-6 py-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {account.account_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {account.provider} • {account.account_type}
                                </p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                                $
                                {parseFloat(account.balance).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Add account modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Add New Account
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) =>
                                                setData('account_name', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Mpesa Personal"
                                            required
                                        />
                                        {errors.account_name && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.account_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Provider / Bank
                                        </label>
                                        <input
                                            type="text"
                                            value={data.provider}
                                            onChange={(e) => setData('provider', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Mpesa, Equity, KCB"
                                            required
                                        />
                                        {errors.provider && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.provider}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type
                                        </label>
                                        <select
                                            value={data.account_type}
                                            onChange={(e) =>
                                                setData('account_type', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        >
                                            {accountTypes.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Number (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) =>
                                                setData('account_number', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Last 4 digits"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Balance
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.balance}
                                            onChange={(e) => setData('balance', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.balance && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.balance}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction Log (CSV)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData('statement_file', file);
                                            }}
                                            className="w-full text-sm text-gray-700"
                                            required
                                        />
                                        {errors.statement_file && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.statement_file}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Upload a CSV exported from Mpesa or your bank with
                                            columns like{' '}
                                            <span className="font-mono">
                                                date, description, amount, type
                                            </span>
                                            . Ombr will read it and create transactions for this
                                            account.
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
                </div>
            )}
        </AppLayout>
    );
}

