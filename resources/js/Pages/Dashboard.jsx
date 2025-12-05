import AppLayout from '../Layouts/AppLayout';
import AccountCard from '../Components/AccountCard';
import { 
    ArrowUpIcon, 
    ArrowDownIcon, 
    PlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CreditCardIcon,
    ArrowPathIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';

export default function Dashboard({ accounts = [], recentTransactions = [], monthlyData = [], categoryData = [] }) {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Ensure monthlyData has at least 6 months of data
    const safeMonthlyData = monthlyData && monthlyData.length > 0 ? monthlyData : Array(6).fill(null).map((_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        return {
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            income: 0,
            expenses: 0,
        };
    });

    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
    const thisMonthIncome = safeMonthlyData[safeMonthlyData.length - 1]?.income || 0;
    const thisMonthExpenses = safeMonthlyData[safeMonthlyData.length - 1]?.expenses || 0;
    const lastMonthIncome = safeMonthlyData[safeMonthlyData.length - 2]?.income || 1;
    const lastMonthExpenses = safeMonthlyData[safeMonthlyData.length - 2]?.expenses || 1;
    
    const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1);
    const expenseChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1);

    // Mock data for additional stats
    const cashback = 1324;
    const monthlyTurnover = 87324;

    // Fast payment options
    const fastPayments = [
        { name: 'Training', amount: 650, icon: '🏋️' },
        { name: 'Internet', amount: 45, icon: '📡' },
        { name: 'Gas Station', amount: 135, icon: '⛽' },
        { name: 'Cinema', amount: 15, icon: '🎬' },
        { name: 'Clothes', amount: 700, icon: '👔' },
        { name: 'Coffee', amount: 50, icon: '☕' },
    ];

    // Check scroll position
    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; // Card width + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // Check position after scroll
            setTimeout(checkScrollPosition, 300);
        }
    };

    // Check scroll position on mount and when accounts change
    useEffect(() => {
        checkScrollPosition();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [accounts]);

    const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

    // Check if user has no accounts (new user)
    const hasNoAccounts = accounts.length === 0;

    return (
        <AppLayout title="Dashboard">
            {hasNoAccounts ? (
                /* Empty State for New Users */
                <div className="max-w-4xl mx-auto">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
                            <CreditCardIcon className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Ombr Finance! 🎉</h1>
                        <p className="text-xl text-gray-600 mb-2">Let's get you started on your financial journey</p>
                        <p className="text-gray-500">Connect your accounts to see your complete financial picture</p>
                    </div>

                    {/* Benefits Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track All Accounts</h3>
                            <p className="text-sm text-gray-600">Connect your bank accounts, credit cards, and investments in one place</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                            <p className="text-sm text-gray-600">Get insights into your spending patterns and financial health</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BanknotesIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Organized</h3>
                            <p className="text-sm text-gray-600">Manage transactions, budgets, and goals effortlessly</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                        <p className="text-indigo-100 mb-8 text-lg">Connect your first account and unlock powerful financial insights</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/accounts"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <PlusIcon className="h-6 w-6 mr-2" />
                                Connect Your First Account
                            </Link>
                            <Link
                                href="/accounts"
                                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-all border-2 border-white/20"
                            >
                                <CreditCardIcon className="h-6 w-6 mr-2" />
                                Add Account Manually
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-indigo-100">It only takes a few minutes to set up</p>
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-12 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Getting Started Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Add Your Accounts</h4>
                                    <p className="text-sm text-gray-600">Start by adding your bank accounts, credit cards, or cash accounts</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Record Transactions</h4>
                                    <p className="text-sm text-gray-600">Track your income and expenses to see where your money goes</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Set Budgets</h4>
                                    <p className="text-sm text-gray-600">Create budgets for different categories to stay on track</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold">4</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">View Insights</h4>
                                    <p className="text-sm text-gray-600">Use charts and analytics to understand your financial patterns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Regular Dashboard with Accounts */
                <>
            {/* Account Cards Carousel */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-lg bg-white border border-gray-200 transition-colors ${
                                canScrollLeft ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-lg bg-white border border-gray-200 transition-colors ${
                                canScrollRight ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <Link
                            href="/accounts"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Account
                        </Link>
                    </div>
                </div>

                {/* Scrollable Cards Container - Floating/Transparent */}
                <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                    <div
                        ref={scrollContainerRef}
                        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-6 lg:px-8"
                        style={{ 
                            scrollbarWidth: 'none', 
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {accounts.length === 0 ? (
                            <div className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                                <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
                                <p className="text-gray-500 mb-4">Add your first account to get started</p>
                                <Link
                                    href="/accounts"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add Account
                                </Link>
                            </div>
                        ) : (
                            accounts.map((account) => (
                                <AccountCard key={account.id} account={account} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Income</span>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                        ${thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center text-sm">
                        <span className={`font-medium ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {incomeChange >= 0 ? '+' : ''}{incomeChange}%
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Expense</span>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ArrowDownIcon className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                        ${thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center text-sm">
                        <span className={`font-medium ${expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {expenseChange >= 0 ? '+' : ''}{expenseChange}%
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Cashback</span>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BanknotesIcon className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                        ${cashback.toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm">
                        <span className="font-medium text-green-600">+4.5%</span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Monthly Turnover</span>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ArrowPathIcon className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                        ${monthlyTurnover.toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm">
                        <span className="font-medium text-green-600">+3.1%</span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Fast Payment */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Fast Payment</h3>
                    <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {fastPayments.map((payment) => (
                        <button
                            key={payment.name}
                            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                        >
                            <div className="text-3xl mb-2">{payment.icon}</div>
                            <p className="text-sm font-medium text-gray-900 mb-1">{payment.name}</p>
                            <p className="text-xs text-gray-500 group-hover:text-indigo-600">${payment.amount}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Last Transactions */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Last Transactions</h3>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentTransactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            recentTransactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            {transaction.type === 'income' ? (
                                                <ArrowUpIcon className="h-6 w-6 text-green-600" />
                                            ) : (
                                                <ArrowDownIcon className="h-6 w-6 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{transaction.category}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
                                                    month: '2-digit', 
                                                    day: '2-digit', 
                                                    year: 'numeric' 
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {transaction.payment_method ? `${transaction.payment_method} card` : 'Card'} *{transaction.account_id.toString().padStart(4, '0')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-bold ${
                                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Categories */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                        
                        {/* Spend this week */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">${thisMonthExpenses > 0 ? (thisMonthExpenses / 4).toFixed(0) : '540'}</p>
                                    <p className="text-sm text-gray-500">Spend this week</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">+2.5%</span>
                            </div>
                            <ResponsiveContainer width="100%" height={60}>
                                <BarChart data={safeMonthlyData.slice(-7)}>
                                    <Bar dataKey="expenses" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Total cashback */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">${cashback}</p>
                                    <p className="text-sm text-gray-500">Total cashback</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">+5.4%</span>
                            </div>
                            <ResponsiveContainer width="100%" height={100}>
                                <PieChart>
                                    <Pie
                                        data={categoryData.slice(0, 4)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryData.slice(0, 4).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Spending trend */}
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">87%</p>
                                    <p className="text-sm text-gray-500">Spending trend</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">+4.0%</span>
                            </div>
                            <ResponsiveContainer width="100%" height={60}>
                                <LineChart data={safeMonthlyData}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="expenses" 
                                        stroke="#F59E0B" 
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
                </>
            )}
        </AppLayout>
    );
}
