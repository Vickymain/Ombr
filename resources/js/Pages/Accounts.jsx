import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { providerCategories } from '../Config/providers.jsx';

export default function Accounts({ accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showManualForm, setShowManualForm] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        provider: '',
        provider_api_key: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        currency: 'USD',
        is_active: true,
        notes: '',
    });

    const accountTypes = [
        { value: 'checking', label: 'Checking', color: 'bg-blue-100 text-blue-800' },
        { value: 'savings', label: 'Savings', color: 'bg-green-100 text-green-800' },
        { value: 'credit', label: 'Credit Card', color: 'bg-purple-100 text-purple-800' },
        { value: 'investment', label: 'Investment', color: 'bg-orange-100 text-orange-800' },
        { value: 'cash', label: 'Cash', color: 'bg-gray-100 text-gray-800' },
        { value: 'other', label: 'Other', color: 'bg-indigo-100 text-indigo-800' },
    ];

    const openModal = (account = null) => {
        if (account) {
            setEditingAccount(account);
            setData(account);
            setSelectedProvider(null);
            setShowManualForm(true);
        } else {
            setEditingAccount(null);
            reset();
            setSelectedProvider(null);
            setShowManualForm(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
        setSelectedProvider(null);
        setShowManualForm(false);
        reset();
    };

    const handleProviderSelect = (provider) => {
        setSelectedProvider(provider);
        setData('provider', provider.name);
        setData('provider_api_key', provider.apiKey);
        setShowManualForm(true);
    };

    const handleShowManualForm = () => {
        setSelectedProvider(null);
        setShowManualForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(`/accounts/${editingAccount.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/accounts', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (accountId) => {
        if (confirm('Are you sure you want to delete this account?')) {
            destroy(`/accounts/${accountId}`);
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    return (
        <AppLayout title="Accounts" totalBalance={totalBalance}>
            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage your financial accounts</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Account
                </button>
            </div>

            {/* Total Balance Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                <p className="text-sm font-medium opacity-90">Total Balance</p>
                <p className="mt-2 text-4xl font-bold">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-2 text-sm opacity-75">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first financial account</p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Your First Account
                        </button>
                    </div>
                ) : (
                    accounts.map((account) => {
                        const typeInfo = accountTypes.find(t => t.value === account.account_type) || accountTypes[accountTypes.length - 1];
                        return (
                            <div key={account.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{account.account_name}</h3>
                                            <p className="text-sm text-gray-500">{account.provider}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                                            {typeInfo.label}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        {account.account_number && (
                                            <p className="text-sm text-gray-500 mt-1">••••{account.account_number.slice(-4)}</p>
                                        )}
                                    </div>

                                    {account.notes && (
                                        <p className="text-sm text-gray-600 mb-4">{account.notes}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className={`text-xs font-medium ${account.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                            {account.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(account)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {editingAccount ? 'Edit Account' : 'Add New Account'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                {!showManualForm && !editingAccount ? (
                                    <>
                                        {/* Provider Selection */}
                                        <div className="mb-8">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Select a Financial Provider</h4>
                                            <p className="text-sm text-gray-600 mb-6">Choose from our supported providers or add manually</p>
                                            
                                            {providerCategories.map((category) => (
                                                <div key={category.name} className="mb-8">
                                                    <div className="flex items-center mb-3">
                                                        <span className="text-lg mr-2">{category.icon}</span>
                                                        <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                            {category.name}
                                                        </h5>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                        {category.providers.map((provider) => {
                                                            const LogoComponent = provider.logo;
                                                            return (
                                                                <button
                                                                    key={provider.apiKey}
                                                                    onClick={() => handleProviderSelect(provider)}
                                                                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                                                >
                                                                    <div className="mb-3 flex items-center justify-center">
                                                                        <LogoComponent />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 text-center">
                                                                        {provider.name}
                                                                    </span>
                                                                    {provider.apiAvailable && (
                                                                        <span className="text-xs text-green-600 mt-1">API Ready</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Manual Entry Option */}
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                                                            Don't see your provider?
                                                        </h5>
                                                        <p className="text-sm text-gray-600">
                                                            Add your account manually from any financial institution
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleShowManualForm}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                    >
                                                        Add Manually
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {selectedProvider && (
                                            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="mr-3">
                                                        {(() => {
                                                            const LogoComponent = selectedProvider.logo;
                                                            return <LogoComponent />;
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-indigo-900">Selected Provider</p>
                                                        <p className="text-lg font-semibold text-indigo-700">{selectedProvider.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                    <input
                                        type="text"
                                        value={data.account_name}
                                        onChange={e => setData('account_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Personal Savings"
                                        required
                                    />
                                    {errors.account_name && <p className="text-red-600 text-sm mt-1">{errors.account_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider/Bank</label>
                                    <input
                                        type="text"
                                        value={data.provider}
                                        onChange={e => setData('provider', e.target.value)}
                                        disabled={selectedProvider !== null}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                            selectedProvider ? 'bg-gray-50 cursor-not-allowed' : ''
                                        }`}
                                        placeholder="e.g., Chase Bank"
                                        required
                                    />
                                    {errors.provider && <p className="text-red-600 text-sm mt-1">{errors.provider}</p>}
                                    {selectedProvider && (
                                        <p className="text-xs text-gray-500 mt-1">Provider selected from list (API Key: {selectedProvider.apiKey})</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                    <select
                                        value={data.account_type}
                                        onChange={e => setData('account_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        {accountTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (optional)</label>
                                    <input
                                        type="text"
                                        value={data.account_number}
                                        onChange={e => setData('account_number', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Last 4 digits"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.balance}
                                        onChange={e => setData('balance', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.balance && <p className="text-red-600 text-sm mt-1">{errors.balance}</p>}
                                </div>

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

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Active account
                                    </label>
                                </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            {!editingAccount && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowManualForm(false);
                                                        setSelectedProvider(null);
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Back
                                                </button>
                                            )}
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
                                                {processing ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}


