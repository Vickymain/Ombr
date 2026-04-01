import AppLayout from '../Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const periodLabels = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

const fmt = (v) => `KSh ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function BudgetShow({ budget, transactions = [], totalBalance = 0 }) {
    const progress = Number(budget?.progress || 0);
    const over = Number(budget?.over_amount || 0);

    return (
        <AppLayout title={`${budget?.category || 'Budget'} Details`} totalBalance={totalBalance}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{budget?.category}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {periodLabels[budget?.period] || budget?.period} period: {budget?.period_label}
                        </p>
                    </div>
                    <Link
                        href="/budgets"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to budgets
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(budget?.amount)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(budget?.spent)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</span>
                        <p className={`text-2xl font-bold mt-1 ${Number(budget?.remaining || 0) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {fmt(budget?.remaining)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</span>
                        <p className={`text-2xl font-bold mt-1 ${progress >= 100 ? 'text-red-600' : progress >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {progress.toFixed(0)}%
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">Budget progress</span>
                        {over > 0 ? (
                            <span className="text-xs font-semibold text-red-600">{fmt(over)} over budget</span>
                        ) : (
                            <span className="text-xs font-semibold text-gray-500">{fmt(budget?.remaining)} remaining</span>
                        )}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full ${progress >= 100 ? 'bg-red-500' : progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900">Transactions in this budget</h2>
                        <p className="text-xs text-gray-500 mt-1">{transactions.length} matching transaction{transactions.length === 1 ? '' : 's'}</p>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="p-8 text-sm text-gray-400 text-center">No matching transactions in this budget period.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{tx.description || tx.category}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {tx.account ? ` • ${tx.account.provider} - ${tx.account.account_name}` : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-red-600">-{fmt(tx.amount).replace('KSh ', 'KSh ')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
