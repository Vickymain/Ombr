import { useState, useMemo } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
    FunnelIcon,
    ScaleIcon,
    ShieldCheckIcon,
    ClockIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    LineChart, Line,
    AreaChart, Area,
    ComposedChart,
    XAxis, YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const CHART_COLORS = ['#1A6B5C', '#C85D3A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#EF4444', '#6366F1'];
const PIE_COLORS = ['#1A6B5C', '#C85D3A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#6366F1', '#84CC16'];

const fmt = (v) => {
    if (v == null) return 'KSh 0';
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${v < 0 ? '-' : ''}KSh ${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${v < 0 ? '-' : ''}KSh ${(abs / 1_000).toFixed(1)}K`;
    return `KSh ${Number(v).toLocaleString()}`;
};

const fmtFull = (v) => `KSh ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl p-3 text-sm min-w-[160px]">
            <p className="font-semibold text-gray-900 mb-1.5 text-xs">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-gray-600 flex items-center gap-1.5 text-xs">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || p.fill }} />
                    <span className="flex-1">{p.name}</span>
                    <span className="font-medium text-gray-900">{fmtFull(p.value)}</span>
                </p>
            ))}
        </div>
    );
};

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl p-3 text-sm">
            <p className="font-semibold text-gray-900">{d.name}</p>
            <p className="text-gray-600">{fmtFull(d.value)}</p>
        </div>
    );
};

const TABS = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'income-expenses', label: 'INCOME & EXPENSES' },
    { id: 'cash-flow', label: 'CASH FLOW' },
    { id: 'budget', label: 'BUDGET VS ACTUAL' },
];

function StatCard({ label, value, prefix = 'KSh ', icon: Icon, color, change, subtitle, large = false }) {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${large ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider leading-tight">
                    {label}
                </span>
                {Icon && (
                    <div className={`p-1.5 ${color} rounded-lg flex-shrink-0`}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
            <p className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-gray-900`}>
                {prefix}{typeof value === 'number' ? Number(value).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}
            </p>
            {change !== undefined && change !== null && (
                <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}% vs last month
                </p>
            )}
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

function ChartCard({ title, children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function PieWithLegend({ data, colors = PIE_COLORS, height = 240 }) {
    if (!data?.length) return <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No data available</div>;
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                        {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 min-w-[140px]">
                {data.slice(0, 8).map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-gray-600 truncate flex-1">{entry.name}</span>
                        <span className="text-gray-900 font-medium">{fmt(entry.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Analytics({
    accounts = [],
    selectedAccountId = 'all',
    period = '12',
    totalBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    netProfit = 0,
    grossMargin = 0,
    thisMonthIncome = 0,
    thisMonthExpenses = 0,
    lastMonthIncome = 0,
    lastMonthExpenses = 0,
    ytdIncome = 0,
    ytdExpenses = 0,
    incomeChange = 0,
    expenseChange = 0,
    monthlyData = [],
    cashFlowData = [],
    expenseByCategory = [],
    incomeByCategory = [],
    thisMonthCategoryExpenses = [],
    monthlyCategoryData = [],
    topExpenseCategories = [],
    incomeByAccount = [],
    expenseByAccount = [],
    accountDistribution = [],
    balanceByCurrency = [],
    dailyData = [],
    cashRunwayMonths = 0,
    savingsRate = 0,
    expenseRatio = 0,
    avgMonthlyIncome = 0,
    avgMonthlyExpenses = 0,
    plStatement = [],
    budgetVsActual = [],
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [filterAccountId, setFilterAccountId] = useState(selectedAccountId);
    const [filterPeriod, setFilterPeriod] = useState(period);

    const handleAccountFilter = (accountId) => {
        setFilterAccountId(accountId);
        router.get('/analytics', { account_id: accountId, period: filterPeriod }, { preserveState: true, preserveScroll: true });
    };

    const handlePeriodFilter = (p) => {
        setFilterPeriod(p);
        router.get('/analytics', { account_id: filterAccountId, period: p }, { preserveState: true, preserveScroll: true });
    };

    const selectedAccount = accounts.find((a) => a.id.toString() === filterAccountId.toString());

    const stackedKeys = useMemo(() => [...topExpenseCategories, 'Others'], [topExpenseCategories]);

    return (
        <AppLayout title="Insights" totalBalance={totalBalance}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedAccount
                            ? `Showing insights for ${selectedAccount.provider} — ${selectedAccount.account_name}`
                            : 'Comprehensive view across all your linked accounts'}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        {['6', '12'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodFilter(p)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                                    filterPeriod === p ? 'bg-[#1A6B5C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {p}mo
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-4 w-4 text-gray-400" />
                        <select
                            value={filterAccountId}
                            onChange={(e) => handleAccountFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A6B5C]/20 focus:border-[#1A6B5C] bg-white text-sm outline-none transition-all"
                        >
                            <option value="all">All Accounts</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.provider} — {a.account_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 text-xs font-semibold tracking-wider whitespace-nowrap transition-all border-b-2 ${
                            activeTab === tab.id
                                ? 'text-[#1A6B5C] border-[#1A6B5C]'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===================== OVERVIEW TAB ===================== */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stat cards row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard
                            label="Total Balance"
                            value={totalBalance}
                            icon={BanknotesIcon}
                            color="bg-blue-100 text-blue-600"
                            hint="Combined balance of the accounts included in the filter (or all accounts)."
                        />
                        <StatCard
                            label="Total Income"
                            value={totalIncome}
                            icon={ArrowTrendingUpIcon}
                            color="bg-emerald-100 text-emerald-600"
                            change={incomeChange}
                            hint="All income ever recorded on those accounts. Change compares this calendar month to last month."
                        />
                        <StatCard
                            label="Total Expenses"
                            value={totalExpenses}
                            icon={ArrowTrendingDownIcon}
                            color="bg-red-100 text-red-600"
                            change={expenseChange}
                            hint="All expenses ever recorded on those accounts. Change compares this calendar month to last month."
                        />
                        <StatCard
                            label="Net Profit"
                            value={netProfit}
                            prefix={netProfit < 0 ? '-KSh ' : 'KSh '}
                            icon={ScaleIcon}
                            color="bg-purple-100 text-purple-600"
                            hint="Total income minus total expenses so far (same account scope). Negative means you’ve spent more than you’ve received overall."
                        />
                        <StatCard
                            label="Savings Rate"
                            value={`${savingsRate}%`}
                            prefix=""
                            icon={ShieldCheckIcon}
                            color="bg-teal-100 text-teal-600"
                            hint="Share of total income that is left after total expenses (lifetime in this view: (income − expenses) ÷ income)."
                        />
                        <StatCard
                            label="Cash Runway"
                            value={`${cashRunwayMonths} mo`}
                            prefix=""
                            icon={ClockIcon}
                            color="bg-amber-100 text-amber-600"
                            hint="Rough months of cover: current total balance ÷ average monthly expense. Average uses total expenses ÷ chart length (6 or 12)—treat as a guide, not a forecast."
                        />
                    </div>

                    {/* Main charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard title={`Income & Expenses past ${filterPeriod} months`} className="lg:col-span-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={monthlyData} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[-50, 50]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar yAxisId="left" dataKey="income" fill="#1A6B5C" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar yAxisId="left" dataKey="expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Expenses" />
                                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#C85D3A" strokeWidth={2} dot={{ r: 3 }} name="Margin %" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard
                            title="Expense breakdown"
                            description="Groups spending under your expense categories. Imported or uncategorised rows are split using the same merchant keywords as budgets (plus any you set under Budgets → Your merchant keywords)."
                        >
                            <PieWithLegend data={expenseByCategory} />
                        </ChartCard>
                    </div>

                    {/* Second row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Daily Trends (Last 30 Days)">
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1A6B5C" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1A6B5C" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={55} axisLine={false} tickLine={false} interval={4} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Area type="monotone" dataKey="income" stroke="#1A6B5C" strokeWidth={2} fill="url(#incGrad)" name="Income" />
                                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {filterAccountId === 'all' && accountDistribution.length > 0 ? (
                            <ChartCard title="Balance by Account">
                                <PieWithLegend data={accountDistribution} />
                            </ChartCard>
                        ) : (
                            <ChartCard title="Income Sources">
                                <PieWithLegend data={incomeByCategory} />
                            </ChartCard>
                        )}
                    </div>

                    {/* P&L Statement */}
                    <ChartCard title="Profit & Loss Statement">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account type</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month to date</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last month</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Year to date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plStatement.map((row, i) => (
                                        <tr key={i} className={`border-b border-gray-50 ${i === plStatement.length - 1 ? 'font-semibold bg-gray-50/50' : ''}`}>
                                            <td className="py-3 px-4 text-gray-700">{row.label}</td>
                                            <td className={`py-3 px-4 text-right ${row.mtd < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.mtd)}</td>
                                            <td className={`py-3 px-4 text-right ${row.lastMonth < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.lastMonth)}</td>
                                            <td className={`py-3 px-4 text-right ${row.ytd < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.ytd)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>
            )}

            {/* ===================== INCOME & EXPENSES TAB ===================== */}
            {activeTab === 'income-expenses' && (
                <div className="space-y-6">
                    {/* Top stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard
                            label="Total Revenue"
                            value={totalIncome}
                            icon={ArrowTrendingUpIcon}
                            color="bg-emerald-100 text-emerald-600"
                            large
                            hint="All income recorded on the filtered accounts."
                        />
                        <StatCard
                            label="Total Expenses"
                            value={totalExpenses}
                            icon={ArrowTrendingDownIcon}
                            color="bg-red-100 text-red-600"
                            large
                            hint="All expenses on those accounts; category charts use your category list, not a single “Imported” bucket."
                        />
                        <StatCard
                            label="Gross Margin"
                            value={`${grossMargin}%`}
                            prefix=""
                            icon={ScaleIcon}
                            color="bg-purple-100 text-purple-600"
                            large
                            hint="(Total income − total expenses) ÷ total income, as a percentage."
                        />
                        <StatCard
                            label="Net Profit (Loss)"
                            value={Math.abs(netProfit)}
                            prefix={netProfit < 0 ? '-KSh ' : 'KSh '}
                            icon={BanknotesIcon}
                            color="bg-blue-100 text-blue-600"
                            large
                            hint="Same as total income minus total expenses; sign is shown in the amount prefix."
                        />
                    </div>

                    {/* Revenue & Expenses charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title={`Revenue past ${filterPeriod} months`}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="income" fill="#1A6B5C" radius={[4, 4, 0, 0]} name="Income" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard
                            title={`Expenses by category (${filterPeriod} months)`}
                            description="Stacked totals use your category names; imported lines are inferred from descriptions where possible."
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyCategoryData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 10 }} />
                                    {stackedKeys.map((key, i) => (
                                        <Bar key={key} dataKey={key} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} name={key} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* Revenue/Expenses by account (only for "all accounts") */}
                    {filterAccountId === 'all' && incomeByAccount.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Revenue by Account">
                                <PieWithLegend data={incomeByAccount} height={260} />
                            </ChartCard>
                            <ChartCard title="Expenses by Account">
                                <PieWithLegend data={expenseByAccount} colors={['#C85D3A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']} height={260} />
                            </ChartCard>
                        </div>
                    )}

                    {/* Operating margin chart */}
                    <ChartCard title={`Net Profit & Margin past ${filterPeriod} months`}>
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar yAxisId="left" dataKey="net" fill="#1A6B5C" radius={[4, 4, 0, 0]} name="Net Profit" />
                                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Margin %" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Detailed P&L table */}
                    <ChartCard title="Profit & Loss Statement">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account type</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month to date</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last month</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Year to date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plStatement.map((row, i) => (
                                        <tr key={i} className={`border-b border-gray-50 ${i === plStatement.length - 1 ? 'font-semibold bg-gray-50/50' : ''}`}>
                                            <td className="py-3 px-4 text-gray-700">{row.label}</td>
                                            <td className={`py-3 px-4 text-right ${row.mtd < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.mtd)}</td>
                                            <td className={`py-3 px-4 text-right ${row.lastMonth < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.lastMonth)}</td>
                                            <td className={`py-3 px-4 text-right ${row.ytd < 0 ? 'text-red-600' : 'text-gray-900'}`}>{fmtFull(row.ytd)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>

                    {/* Expense categories this month */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard
                            title="Expense breakdown (this month)"
                            description="This month’s spending by your categories (imported rows mapped with merchant keywords)."
                        >
                            <PieWithLegend data={thisMonthCategoryExpenses} height={260} />
                        </ChartCard>
                        <ChartCard title="Income by Category (All Time)">
                            <PieWithLegend data={incomeByCategory} colors={['#1A6B5C', '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#84CC16']} height={260} />
                        </ChartCard>
                    </div>
                </div>
            )}

            {/* ===================== CASH FLOW TAB ===================== */}
            {activeTab === 'cash-flow' && (
                <div className="space-y-6">
                    {/* Top stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard
                            label="Cash in Bank"
                            value={totalBalance}
                            icon={BanknotesIcon}
                            color="bg-blue-100 text-blue-600"
                            subtitle="Current"
                            hint="Same as total balance: sum of account balances in scope."
                        />
                        <StatCard
                            label="Avg Monthly Income"
                            value={avgMonthlyIncome}
                            icon={ArrowTrendingUpIcon}
                            color="bg-emerald-100 text-emerald-600"
                            hint="Total income ÷ number of months in the chart window (6 or 12)—not calendar-year-only."
                        />
                        <StatCard
                            label="Avg Monthly Expense"
                            value={avgMonthlyExpenses}
                            icon={ArrowTrendingDownIcon}
                            color="bg-red-100 text-red-600"
                            hint="Total expenses ÷ months in the window. Paired with balance for the runway figure."
                        />
                        <StatCard
                            label="Savings Rate"
                            value={`${savingsRate}%`}
                            prefix=""
                            icon={ShieldCheckIcon}
                            color="bg-teal-100 text-teal-600"
                            hint="Portion of lifetime income not spent, as a percentage."
                        />
                        <StatCard
                            label="Expense Ratio"
                            value={`${expenseRatio}%`}
                            prefix=""
                            icon={ChartBarIcon}
                            color="bg-amber-100 text-amber-600"
                            hint="Total expenses as a share of total income (100% means you’ve spent every shilling earned in aggregate)."
                        />
                        <StatCard
                            label="Cash Runway"
                            value={`${cashRunwayMonths}`}
                            prefix=""
                            icon={ClockIcon}
                            color="bg-purple-100 text-purple-600"
                            subtitle="months"
                            hint="Balance ÷ avg monthly expense from this tab. Illustrative only—real spending varies."
                        />
                    </div>

                    {/* Cash balance chart with line */}
                    <ChartCard title={`Cash Balance past ${filterPeriod} months`}>
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar yAxisId="left" dataKey="inflow" fill="#1A6B5C" radius={[4, 4, 0, 0]} name="Inflow" />
                                <Bar yAxisId="left" dataKey="outflow" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Outflow" />
                                <Line yAxisId="left" type="monotone" dataKey="closingBalance" stroke="#C85D3A" strokeWidth={2.5} dot={{ r: 3 }} name="Closing Balance" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cash balance by currency */}
                        {balanceByCurrency.length > 1 && (
                            <ChartCard title="Cash Balance by Currency">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={balanceByCurrency}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" name="Balance" radius={[6, 6, 0, 0]}>
                                            {balanceByCurrency.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        )}

                        {/* Balance by bank/account */}
                        {filterAccountId === 'all' && accountDistribution.length > 0 && (
                            <ChartCard title="Cash Balance by Account">
                                <PieWithLegend data={accountDistribution} height={260} />
                            </ChartCard>
                        )}

                        {/* Net cash flow */}
                        <ChartCard title="Net Cash Flow per Month" className={balanceByCurrency.length <= 1 && (filterAccountId !== 'all' || accountDistribution.length === 0) ? 'lg:col-span-2' : ''}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={cashFlowData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="net" name="Net Cash Flow" radius={[4, 4, 0, 0]}>
                                        {cashFlowData.map((entry, i) => (
                                            <Cell key={i} fill={entry.net >= 0 ? '#1A6B5C' : '#EF4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* Cash flow as table */}
                    <ChartCard title="Cash Flow Summary">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inflow</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Outflow</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Running Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cashFlowData.map((row, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-2.5 px-4 text-gray-700 font-medium">{row.month}</td>
                                            <td className="py-2.5 px-4 text-right text-emerald-600">{fmtFull(row.inflow)}</td>
                                            <td className="py-2.5 px-4 text-right text-red-500">{fmtFull(row.outflow)}</td>
                                            <td className={`py-2.5 px-4 text-right font-medium ${row.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtFull(row.net)}</td>
                                            <td className="py-2.5 px-4 text-right text-gray-900 font-medium">{fmtFull(row.closingBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>
            )}

            {/* ===================== BUDGET VS ACTUAL TAB ===================== */}
            {activeTab === 'budget' && (
                <div className="space-y-6">
                    {budgetVsActual.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets set yet</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Create budgets in the Budgets page to see how your actual spending compares against your targets.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Budget comparison chart */}
                            <ChartCard title="Budget vs Actual Spending">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={budgetVsActual} layout="vertical" barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, width: 100 }} axisLine={false} tickLine={false} width={120} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="budgeted" fill="#1A6B5C" radius={[0, 4, 4, 0]} name="Budgeted" />
                                        <Bar dataKey="spent" fill="#C85D3A" radius={[0, 4, 4, 0]} name="Spent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* Budget progress cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {budgetVsActual.map((b, i) => {
                                    const isOver = b.progress > 100;
                                    const isWarning = b.progress > 75 && b.progress <= 100;
                                    return (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-sm">{b.category}</h4>
                                                    {b.period_label && <p className="text-[10px] text-gray-400 mt-0.5">{b.period_label}</p>}
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    isOver ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {b.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all ${
                                                        isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${Math.min(b.progress, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Spent: <span className="font-medium text-gray-900">{fmtFull(b.spent)}</span></span>
                                                <span>Budget: <span className="font-medium text-gray-900">{fmtFull(b.budgeted)}</span></span>
                                            </div>
                                            {b.remaining > 0 && (
                                                <p className="text-xs text-emerald-600 mt-2">{fmtFull(b.remaining)} remaining</p>
                                            )}
                                            {isOver && (
                                                <p className="text-xs text-red-600 mt-2">{fmtFull(b.spent - b.budgeted)} over budget</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
