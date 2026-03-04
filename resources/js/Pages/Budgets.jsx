import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';

export default function Budgets({ budgets = [], categories = [], totalBalance = 0 }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const expenseCategories = categories.filter(
        (c) => c.type === 'expense' || c.type === 'both'
    );

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
            setData('period', 'monthly');
            setData('start_date', new Date().toISOString().split('T')[0]);
            setData('is_active', true);
            setData('alert_enabled', true);
            setData('alert_threshold', 80);
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
            put(`/budgets/${editingBudget.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/budgets', {
                onSuccess: () => closeModal(),
            });
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

    const formatCurrency = (value) =>
        `$${Number(value || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <AppLayout title="Budgets" totalBalance={totalBalance}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Set spending limits and track progress by category.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Budget
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Active Budgets</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {budgets.filter((b) => b.is_active).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Budgeted</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalBudgeted)}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Overall Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {overallProgress.toFixed(0)}%
                    </p>
                </div>
            </div>

            {/* Budgets List */}
            <div className="bg-white rounded-lg shadow">
                {budgets.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No budgets yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Create your first budget to start tracking your spending against goals.
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Your First Budget
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {budgets.map((budget) => {
                            const categoryMeta = categories.find(
                                (c) => c.name === budget.category
                            );

                            const progress = budget.progress ?? 0;
                            const remaining = budget.remaining ?? 0;
                            const spent = budget.spent ?? 0;

                            return (
                                <div
                                    key={budget.id}
                                    className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {categoryMeta
                                                    ? `${categoryMeta.icon} ${categoryMeta.name}`
                                                    : budget.category}
                                            </p>
                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                                {budget.period.charAt(0).toUpperCase() +
                                                    budget.period.slice(1)}
                                            </span>
                                            {!budget.is_active && (
                                                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            From{' '}
                                            <span className="font-medium">
                                                {budget.start_date}
                                            </span>{' '}
                                            {budget.end_date && (
                                                <>
                                                    to{' '}
                                                    <span className="font-medium">
                                                        {budget.end_date}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full ${
                                                    progress >= 100
                                                        ? 'bg-red-500'
                                                        : progress >= 80
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <span className="mr-4">
                                                Budget: {formatCurrency(budget.amount)}
                                            </span>
                                            <span className="mr-4">
                                                Spent: {formatCurrency(spent)}
                                            </span>
                                            <span>
                                                Remaining:{' '}
                                                <span
                                                    className={
                                                        remaining <= 0
                                                            ? 'text-red-600 font-medium'
                                                            : 'font-medium'
                                                    }
                                                >
                                                    {formatCurrency(remaining)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-3">
                                        {budget.alert_enabled && (
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                                                Alerts at {budget.alert_threshold}%
                                            </span>
                                        )}
                                        <button
                                            onClick={() => openModal(budget)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeModal}
                        />

                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {expenseCategories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) =>
                                                setData('amount', e.target.value)
                                            }
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Period */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Period
                                    </label>
                                    <select
                                        value={data.period}
                                        onChange={(e) =>
                                            setData('period', e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                    {errors.period && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors.period}
                                        </p>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData('start_date', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.start_date && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date (optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={data.end_date || ''}
                                            onChange={(e) =>
                                                setData('end_date', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        {errors.end_date && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Alerts */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData('is_active', e.target.checked)
                                            }
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            Active budget
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.alert_enabled}
                                            onChange={(e) =>
                                                setData(
                                                    'alert_enabled',
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            Enable alerts
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alert Threshold (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.alert_threshold}
                                        onChange={(e) =>
                                            setData(
                                                'alert_threshold',
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    {errors.alert_threshold && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors.alert_threshold}
                                        </p>
                                    )}
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
                                        {processing
                                            ? editingBudget
                                                ? 'Saving...'
                                                : 'Adding...'
                                            : editingBudget
                                            ? 'Update Budget'
                                            : 'Add Budget'}
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

