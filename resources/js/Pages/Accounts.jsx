import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import FileUploadZone from '../Components/FileUploadZone';
import { PROVIDER_CATEGORIES } from '../data/providers';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    const [showOtherProvider, setShowOtherProvider] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        statement_files: [],
    });

    const totalBalance = accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance || 0),
        0,
    );

    const openModal = () => {
        reset();
        setShowOtherProvider(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const hasFiles = data.statement_files && data.statement_files.length > 0;
        const formOptions = {
            forceFormData: hasFiles,
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

            {/* Accounts as provider-styled cards */}
            <div className="bg-transparent">
                {accounts.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 px-6 py-12 text-center text-gray-500">
                        <p className="mb-4">No accounts yet. Click &quot;Add Account&quot; to get started.</p>
                        <button
                            onClick={openModal}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Account
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((account) => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </div>
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

                        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Add New Account
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provider / Bank
                                        </label>
                                        <div className="space-y-4">
                                            {PROVIDER_CATEGORIES.map((category) => (
                                                <div key={category.id}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-base">{category.icon}</span>
                                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{category.name}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                        {category.providers.map((p) => {
                                                            const isSelected = data.provider === p.name && !showOtherProvider;
                                                            return (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData('provider', p.name);
                                                                        setShowOtherProvider(false);
                                                                    }}
                                                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                                                        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-1"
                                                                        style={{ background: p.cardStyle.bg }}
                                                                    >
                                                                        {p.initial}
                                                                    </div>
                                                                    <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{p.name}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowOtherProvider(true); setData('provider', ''); }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Other provider? Type below
                                                </button>
                                                {showOtherProvider && (
                                                    <input
                                                        type="text"
                                                        value={data.provider}
                                                        onChange={(e) => setData('provider', e.target.value)}
                                                        placeholder="e.g. My Bank"
                                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {errors.provider && <p className="text-red-600 text-sm mt-1">{errors.provider}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            value={data.account_name}
                                            onChange={(e) => setData('account_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        >
                                            {accountTypes.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (optional)</label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Last 4 digits"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.balance}
                                            onChange={(e) => setData('balance', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
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
                </div>
            )}
        </AppLayout>
    );
}

