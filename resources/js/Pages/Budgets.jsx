import { useState } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../Layouts/AppLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    BellAlertIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    SparklesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useForm, router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const periodLabels = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

function BudgetOnboarding({ onCreateFirst }) {
    const steps = [
        {
            icon: ChartBarIcon,
            color: 'bg-[#C85D3A]/10 text-[#C85D3A]',
            title: 'Set spending limits',
            description: 'Choose a category like Groceries or Dining and set a maximum you want to spend each month.',
        },
        {
            icon: ArrowTrendingUpIcon,
            color: 'bg-emerald-100 text-emerald-600',
            title: 'Track progress automatically',
            description: 'Ombr matches your transactions to budget categories and shows your progress in real time.',
        },
        {
            icon: BellAlertIcon,
            color: 'bg-amber-100 text-amber-600',
            title: 'Get alerts before you overspend',
            description: 'Set a threshold (e.g., 80%) and get notified before you blow your budget.',
        },
        {
            icon: LightBulbIcon,
            color: 'bg-blue-100 text-blue-600',
            title: 'Gain insights over time',
            description: 'See how your spending compares to your budgets month over month with visual charts.',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#C85D3A] via-[#B85450] to-[#9E4A47] rounded-3xl shadow-xl p-8 sm:p-12 text-white mb-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-6">
                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Take control of your spending</h1>
                    <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">
                        Create budgets by category, track your progress, and build better financial habits one month at a time.
                    </p>
                    <button
                        onClick={onCreateFirst}
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#B85450] rounded-2xl font-semibold hover:bg-white/95 transition-all shadow-lg"
                    >
                        <PlusIcon className="h-6 w-6 mr-2" />
                        Create your first budget
                    </button>
                </div>
            </div>

            {/* How it works */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How budgets work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {steps.map((step, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-4 hover:border-[#C85D3A]/20 transition-colors">
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${step.color} flex items-center justify-center`}>
                            <step.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Example */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-[#C85D3A]" />
                    Example: How a monthly Groceries budget looks
                </h3>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Groceries</span>
                            <span className="font-medium text-gray-900">KSh 8,500 / KSh 12,000</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                            <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: '71%' }} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>71% used</span>
                            <span>KSh 3,500 remaining</span>
                            <span className="text-amber-600 font-medium">Alert at 80%</span>
                        </div>
                    </div>
                    <div className="w-40 h-24">
                        <ResponsiveContainer width="100%" height={96}>
                            <BarChart data={[
                                { m: 'Jan', spent: 9800 },
                                { m: 'Feb', spent: 11200 },
                                { m: 'Mar', spent: 10500 },
                                { m: 'Apr', spent: 8500 },
                            ]}>
                                <Bar dataKey="spent" fill="#C85D3A" radius={[4, 4, 0, 0]} />
                                <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-600 mb-4">Ready to set your first spending limit?</p>
                <button
                    onClick={onCreateFirst}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create budget
                </button>
            </div>
        </div>
    );
}

function CategoryKeywordManager({ expenseCategories = [], categoryKeywords = [] }) {
    const keywordForm = useForm({
        category: '',
        keyword: '',
    });

    const addKeyword = (e) => {
        e.preventDefault();
        keywordForm.post('/budgets/category-keywords', {
            preserveScroll: true,
            onSuccess: () => keywordForm.reset(),
        });
    };

    const removeKeyword = (id) => {
        if (!confirm('Remove this keyword?')) return;
        router.delete(`/budgets/category-keywords/${id}`, { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Your merchant keywords</h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        When a transaction is imported/uncategorised, we also match the description to these keywords so it counts toward the right budget category.
                    </p>
                </div>
            </div>

            <form onSubmit={addKeyword} className="flex flex-col sm:flex-row gap-3 sm:items-end mb-5">
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                        value={keywordForm.data.category}
                        onChange={(e) => keywordForm.setData('category', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none"
                        required
                    >
                        <option value="">Select category</option>
                        {expenseCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                    {keywordForm.errors.category && <p className="text-red-600 text-xs mt-1">{keywordForm.errors.category}</p>}
                </div>

                <div className="flex-1 min-w-0 sm:max-w-xs">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description contains</label>
                    <input
                        type="text"
                        value={keywordForm.data.keyword}
                        onChange={(e) => keywordForm.setData('keyword', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none"
                        placeholder="e.g. KPLC, Safaricom, TOKENS"
                        maxLength={120}
                        required
                    />
                    {keywordForm.errors.keyword && <p className="text-red-600 text-xs mt-1">{keywordForm.errors.keyword}</p>}
                </div>

                <button
                    type="submit"
                    disabled={keywordForm.processing}
                    className="inline-flex justify-center items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {keywordForm.processing ? 'Adding…' : 'Add keyword'}
                </button>
            </form>

            {categoryKeywords.length === 0 ? (
                <p className="text-sm text-gray-400">No personal keywords yet.</p>
            ) : (
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {categoryKeywords.map((row) => (
                        <li
                            key={row.id}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50/80 text-sm"
                        >
                            <span className="text-gray-700">
                                <span className="font-medium text-gray-900">{row.category_label}</span>
                                <span className="text-gray-400 mx-2">·</span>
                                contains &quot;{row.keyword}&quot;
                            </span>
                            <button
                                type="button"
                                onClick={() => removeKeyword(row.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                aria-label="Remove keyword"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Budgets({ budgets = [], categories = [], totalBalance = 0, categoryKeywords = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        category: '',
        amount: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true,
        alert_enabled: true,
        alert_threshold: 80,
    });

    const openModal = (budget = null) => {
        if (budget) {
            setEditingBudget(budget);
            setData({
                category: budget.category || '',
                amount: budget.amount?.toString() || '',
                period: budget.period || 'monthly',
                start_date: budget.start_date || new Date().toISOString().split('T')[0],
                end_date: budget.end_date || '',
                is_active: budget.is_active ?? true,
                alert_enabled: budget.alert_enabled ?? true,
                alert_threshold: budget.alert_threshold ?? 80,
            });
        } else {
            setEditingBudget(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBudget) {
            put(`/budgets/${editingBudget.id}`, { onSuccess: closeModal });
        } else {
            post('/budgets', { onSuccess: closeModal });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            destroy(`/budgets/${id}`);
        }
    };

    const totalBudgeted = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const totalRemaining = Math.max(0, totalBudgeted - totalSpent);

    const fmt = (v) => `KSh ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const hasBudgets = budgets.length > 0;

    return (
        <AppLayout title="Budgets" totalBalance={totalBalance}>
            {!hasBudgets ? (
                <>
                    <BudgetOnboarding onCreateFirst={() => openModal()} />
                    <CategoryKeywordManager expenseCategories={expenseCategories} categoryKeywords={categoryKeywords} />
                </>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Spending is counted from expenses in the budget category within each period. Assign categories on transactions (or we infer some merchants from descriptions when the category is Imported).
                            </p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] transition-all shadow-sm"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Budget
                        </button>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{budgets.filter((b) => b.is_active).length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalBudgeted)}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalSpent)}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</span>
                            <p className={`text-2xl font-bold mt-1 ${totalRemaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(totalRemaining)}</p>
                        </div>
                    </div>

                    {/* Overall progress bar */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">Overall budget progress</span>
                            <span className={`text-sm font-bold ${overallProgress >= 100 ? 'text-red-600' : overallProgress >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {overallProgress.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all ${overallProgress >= 100 ? 'bg-red-500' : overallProgress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{fmt(totalSpent)} spent of {fmt(totalBudgeted)}</span>
                        </div>
                    </div>

                    <CategoryKeywordManager expenseCategories={expenseCategories} categoryKeywords={categoryKeywords} />

                    {/* Budget list */}
                    <div className="space-y-4">
                        {budgets.map((budget) => {
                            const progress = budget.progress ?? 0;
                            const isOverBudget = progress >= 100;
                            const isWarning = progress >= 80 && !isOverBudget;
                            const catMeta = categories.find((c) => c.name === budget.category);

                            return (
                                <div key={budget.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {isOverBudget && <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                                                {isWarning && <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />}
                                                {!isOverBudget && !isWarning && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {catMeta?.icon ? `${catMeta.icon} ` : ''}{budget.category}
                                                </span>
                                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 uppercase">
                                                    {periodLabels[budget.period] || budget.period}
                                                </span>
                                                {!budget.is_active && (
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-400 uppercase">Inactive</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-gray-500">{fmt(budget.spent)} of {fmt(budget.amount)}</span>
                                                <span className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {progress.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 flex-wrap">
                                                {budget.spent_period_label && (
                                                    <span className="text-gray-500">Period: {budget.spent_period_label}</span>
                                                )}
                                                <span>Remaining: <span className={`font-medium ${budget.remaining <= 0 ? 'text-red-600' : 'text-gray-600'}`}>{fmt(budget.remaining)}</span></span>
                                                {budget.alert_enabled && (
                                                    <span className="flex items-center gap-1">
                                                        <BellAlertIcon className="h-3 w-3" />
                                                        Alert at {budget.alert_threshold}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openModal(budget)} className="p-2 rounded-xl text-gray-400 hover:text-[#C85D3A] hover:bg-[#C85D3A]/5 transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(budget.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Budget modal */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true" role="dialog">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                                </h3>
                                <button onClick={closeModal} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {expenseCategories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Amount (KSh)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                            placeholder="e.g., 15000"
                                            required
                                        />
                                        {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Period</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['weekly', 'monthly', 'yearly'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setData('period', p)}
                                                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${data.period === p ? 'bg-[#C85D3A] text-white border-[#C85D3A]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#C85D3A]/50'}`}
                                                >
                                                    {periodLabels[p]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date <span className="text-gray-400">(optional)</span></label>
                                            <input
                                                type="date"
                                                value={data.end_date || ''}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 py-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="h-4 w-4 text-[#C85D3A] focus:ring-[#C85D3A] border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.alert_enabled}
                                                onChange={(e) => setData('alert_enabled', e.target.checked)}
                                                className="h-4 w-4 text-[#C85D3A] focus:ring-[#C85D3A] border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Alerts enabled</span>
                                        </label>
                                    </div>

                                    {data.alert_enabled && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Alert threshold: <span className="text-[#C85D3A] font-bold">{data.alert_threshold}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                step="5"
                                                value={data.alert_threshold}
                                                onChange={(e) => setData('alert_threshold', Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C85D3A]"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>10%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-3">
                                        <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium hover:bg-[#B85450] disabled:opacity-40 transition-all"
                                        >
                                            {processing ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
