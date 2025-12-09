import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { 
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import { 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4'];

export default function Analytics({ 
    accounts = [], 
    selectedAccountId = 'all',
    totalBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    totalInvestments = 0,
    monthlyData = [],
    categoryData = [],
    accountDistribution = [],
    dailyData = []
}) {
    const [filterAccountId, setFilterAccountId] = useState(selectedAccountId);

    const handleAccountFilter = (accountId) => {
        setFilterAccountId(accountId);
        router.get('/analytics', { account_id: accountId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const selectedAccount = accounts.find(acc => acc.id.toString() === filterAccountId.toString());
    const pageTitle = filterAccountId === 'all' 
        ? 'Analytics' 
        : `${selectedAccount?.provider || 'Account'} Analysis`;

    const totalBalanceValue = filterAccountId === 'all' 
        ? totalBalance 
        : (selectedAccount?.balance || 0);

    return (
        <AppLayout title={pageTitle} totalBalance={totalBalance}>
            {/* Account Filter */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <select
                        value={filterAccountId}
                        onChange={(e) => handleAccountFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                        <option value="all">All Accounts</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.provider} - {account.account_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Total Balance</span>
                        <div className="p-1.5 bg-blue-100 rounded">
                            <BanknotesIcon className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${totalBalanceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Total Income</span>
                        <div className="p-1.5 bg-green-100 rounded">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Total Expenses</span>
                        <div className="p-1.5 bg-red-100 rounded">
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Investments</span>
                        <div className="p-1.5 bg-purple-100 rounded">
                            <ChartBarIcon className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        ${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Income vs Expenses */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" fill="#10B981" name="Income" />
                            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Spending by Category */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                            No category data available
                        </div>
                    )}
                </div>

                {/* Daily Transaction Trends */}
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Transaction Trends (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="income" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                name="Income"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="expenses" 
                                stroke="#EF4444" 
                                strokeWidth={2}
                                name="Expenses"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Account Distribution */}
                {filterAccountId === 'all' && accountDistribution.length > 0 && (
                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={accountDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {accountDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

