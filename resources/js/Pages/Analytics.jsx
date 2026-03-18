import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const COLORS = ['#C85D3A', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-3 text-sm">
            <p className="font-medium text-gray-900 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-gray-600">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
                    {p.name}: KSh {Number(p.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
};

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
    dailyData = [],
}) {
    const [filterAccountId, setFilterAccountId] = useState(selectedAccountId);

    const handleAccountFilter = (accountId) => {
        setFilterAccountId(accountId);
        router.get('/analytics', { account_id: accountId }, { preserveState: true, preserveScroll: true });
    };

    const selectedAccount = accounts.find((acc) => acc.id.toString() === filterAccountId.toString());
    const totalBalanceValue = filterAccountId === 'all' ? totalBalance : (selectedAccount?.balance || 0);

    const stats = [
        { label: 'Total Balance', value: totalBalanceValue, icon: BanknotesIcon, color: 'bg-blue-100 text-blue-600', prefix: 'KSh ' },
        { label: 'Total Income', value: totalIncome, icon: ArrowTrendingUpIcon, color: 'bg-emerald-100 text-emerald-600', prefix: 'KSh ' },
        { label: 'Total Expenses', value: totalExpenses, icon: ArrowTrendingDownIcon, color: 'bg-red-100 text-red-600', prefix: 'KSh ' },
        { label: 'Investments', value: totalInvestments, icon: ChartBarIcon, color: 'bg-purple-100 text-purple-600', prefix: 'KSh ' },
    ];

    return (
        <AppLayout title="Analytics" totalBalance={totalBalance}>
            {/* Header with filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">Visualise your financial data and identify trends.</p>
                </div>
                <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                    <select
                        value={filterAccountId}
                        onChange={(e) => handleAccountFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] bg-white text-sm outline-none transition-all"
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

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                            <div className={`p-1.5 ${stat.color} rounded-lg`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {stat.prefix}{Number(stat.value).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly income vs expenses */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
                            <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Spending by category */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Spending by Category</h3>
                    {categoryData.length > 0 ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`KSh ${Number(val).toLocaleString()}`]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 min-w-[140px]">
                                {categoryData.slice(0, 6).map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-gray-600 truncate">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No category data available</div>
                    )}
                </div>

                {/* Daily trends */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Daily Trends (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                            <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Account distribution */}
                {filterAccountId === 'all' && accountDistribution.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Account Distribution</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={accountDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {accountDistribution.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`KSh ${Number(val).toLocaleString()}`]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 min-w-[140px]">
                                {accountDistribution.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-gray-600 truncate">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
