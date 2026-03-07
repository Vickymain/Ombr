import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import FileUploadZone from '../Components/FileUploadZone';
import { PlusIcon, XMarkIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { PROVIDER_CATEGORIES, CURRENCIES } from '../data/providers';

/** Border classes: grey default, red when error, green when valid (has value, no error) */
function fieldBorderClass(error, value) {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    if (value !== undefined && value !== null && value !== '') return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20';
    return 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500';
}

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
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const stepTimersRef = useRef([]);
    const scrollContainerRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        provider: '',
        account_name: '',
        account_number: '',
        account_type: 'checking',
        balance: '0.00',
        currency: 'USD',
        statement_files: [],
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
            const scrollAmount = 320;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
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

            {/* Your cards - carousel (same layout as dashboard) */}
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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Your cards</h2>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => scroll('left')} disabled={!canScrollLeft} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-40 hover:bg-gray-50">
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button type="button" onClick={() => scroll('right')} disabled={!canScrollRight} className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm disabled:opacity-40 hover:bg-gray-50">
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
                {accounts.length > 0 && (
                    <div className="relative -mx-2">
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-2"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                        >
                            {accounts.map((account) => (
                                <AccountCard key={account.id} account={account} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Add account modal - portaled so it always appears on top */}
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
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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

            {/* Processing / loading overlay - matches example: spinner + status text */}
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

