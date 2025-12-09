import { Link, usePage, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import {
    HomeIcon,
    CreditCardIcon,
    BanknotesIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    PresentationChartLineIcon,
    BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
    { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
];

export default function AppLayout({ children, title, totalBalance = 0 }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const page = usePage();
    const url = page.url || '';
    const auth = page.props?.auth || { user: null };

    // Mock notifications - replace with backend data later
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Account Connected', message: 'Your Mpesa account has been successfully connected.', time: '2 hours ago', read: false },
        { id: 2, title: 'Budget Alert', message: 'You\'ve reached 80% of your monthly grocery budget.', time: '5 hours ago', read: false },
        { id: 3, title: 'Transaction Completed', message: 'Payment of $150.00 to Amazon has been processed.', time: '1 day ago', read: true },
        { id: 4, title: 'Weekly Summary', message: 'Your weekly spending summary is ready to view.', time: '2 days ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleNotificationClick = (notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, read: true }
                    : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    return (
        <div className="min-h-screen bg-[#FFF5F0]">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex w-60 flex-col bg-[#FFF5F0] relative">
                        {/* Organic Background Shapes */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
                            <path
                                d="M 600 100 Q 650 200 700 350 Q 750 500 700 650 Q 650 800 500 900 Q 350 950 200 850 Q 100 750 150 600 Q 200 450 300 350 Q 400 250 500 200 Q 550 150 600 100 Z"
                                fill="#FFD4C4"
                                opacity="0.6"
                            />
                            <path
                                d="M 100 200 Q 150 300 100 450 Q 50 600 150 700 Q 250 750 350 650 Q 400 550 350 450 Q 300 350 250 300 Q 200 250 150 250 Q 100 250 100 200 Z"
                                fill="#FFE5D9"
                                opacity="0.5"
                            />
                        </svg>
                        <div className="relative z-10 flex items-center justify-between px-4 py-4 border-b">
                            <h1 className="text-xl font-bold text-black">Ombr</h1>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* Total Balance Card - Mobile */}
                        <div className="relative z-10 mx-4 mt-4 mb-4">
                            <div className="bg-gradient-to-br from-[#C85D3A] to-[#B85450] rounded-xl p-4 text-white">
                                <p className="text-xs font-medium opacity-90 mb-1">Balance</p>
                                <p className="text-2xl font-bold">
                                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        
                        <nav className="relative z-10 flex-1 space-y-1 px-3 py-4">
                            {navigation.map((item) => {
                                const isActive = url && url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                                            isActive
                                                ? 'bg-white/50 text-black'
                                                : 'text-gray-700 hover:bg-white/30'
                                        }`}
                                    >
                                        <item.icon className="mr-3 h-6 w-6" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        
                        {/* Settings and Logout at bottom - Mobile */}
                        <div className="relative z-10 mt-auto border-t border-gray-200 pt-2 px-3">
                            <Link
                                href="/settings"
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                                    url && url.startsWith('/settings')
                                        ? 'bg-white/50 text-black'
                                        : 'text-gray-700 hover:bg-white/30'
                                }`}
                            >
                                <Cog6ToothIcon className="mr-3 h-6 w-6" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-white/30"
                            >
                                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-52 lg:flex-col">
                <div className="flex flex-col flex-grow bg-[#FFF5F0] border-r border-gray-200 pt-5 pb-4 overflow-y-auto relative">
                    {/* Organic Background Shapes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
                        <path
                            d="M 600 100 Q 650 200 700 350 Q 750 500 700 650 Q 650 800 500 900 Q 350 950 200 850 Q 100 750 150 600 Q 200 450 300 350 Q 400 250 500 200 Q 550 150 600 100 Z"
                            fill="#FFD4C4"
                            opacity="0.6"
                        />
                        <path
                            d="M 100 200 Q 150 300 100 450 Q 50 600 150 700 Q 250 750 350 650 Q 400 550 350 450 Q 300 350 250 300 Q 200 250 150 250 Q 100 250 100 200 Z"
                            fill="#FFE5D9"
                            opacity="0.5"
                        />
                    </svg>
                    <div className="relative z-10 flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-black">Ombr</h1>
                    </div>
                    
                    {/* Total Balance Card */}
                    <div className="relative z-10 mx-3 mt-4 mb-3">
                        <div className="bg-gradient-to-br from-[#C85D3A] to-[#B85450] rounded-lg p-3 text-white">
                            <p className="text-[10px] font-medium opacity-90 mb-0.5">Balance</p>
                            <p className="text-lg font-bold truncate">
                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                    
                    <nav className="relative z-10 mt-2 flex-1 flex flex-col space-y-1 px-2">
                        {navigation.map((item) => {
                            const isActive = url && url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-white/50 text-black'
                                            : 'text-gray-700 hover:bg-white/30'
                                    }`}
                                >
                                    <item.icon className="mr-2 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    
                    {/* Settings and Logout at bottom */}
                    <div className="relative z-10 mt-auto border-t border-gray-200 pt-2 px-2">
                        <Link
                            href="/settings"
                            className={`flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors mb-1 ${
                                url && url.startsWith('/settings')
                                    ? 'bg-white/50 text-black'
                                    : 'text-gray-700 hover:bg-white/30'
                            }`}
                        >
                            <Cog6ToothIcon className="mr-2 h-5 w-5" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors text-gray-700 hover:bg-white/30"
                        >
                            <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-52">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-[#FFF5F0] border-b border-gray-200 relative">
                    {/* Organic Background Shapes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
                        <path
                            d="M 600 50 Q 650 75 700 100 Q 750 125 700 150 Q 650 175 500 180 Q 350 185 200 170 Q 100 160 150 130 Q 200 100 300 80 Q 400 60 500 55 Q 550 52 600 50 Z"
                            fill="#FFD4C4"
                            opacity="0.6"
                        />
                    </svg>
                    <button
                        type="button"
                        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="relative z-10 flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-1 items-center">
                            <h2 className="text-xl font-semibold text-black">{title}</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setNotificationsOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-white/30 rounded-lg transition-colors"
                            >
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-[#C85D3A] rounded-full"></span>
                                )}
                            </button>
                            <div className="flex items-center space-x-3">
                                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-black">{auth.user?.name}</p>
                                    <p className="text-xs text-gray-600">{auth.user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Notifications Side Panel */}
            {notificationsOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:z-50"
                        onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-[#C85D3A] hover:text-[#B85450] font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                <button
                                    onClick={() => setNotificationsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            !notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {!notification.read && (
                                                <div className="mt-2 flex-shrink-0">
                                                    <span className="h-2 w-2 bg-[#C85D3A] rounded-full block"></span>
                                                </div>
                                            )}
                                            <div className={`flex-1 ${!notification.read ? '' : 'ml-5'}`}>
                                                <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


