import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    MagnifyingGlassIcon,
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
    const [toastMessage, setToastMessage] = useState(null);
    const page = usePage();
    const url = page.url || '';
    const auth = page.props?.auth || { user: null };
    const notifications = page.props?.notifications || [];
    const flash = page.props?.flash || {};

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (flash.success) {
            setToastMessage(flash.success);
            const timeout = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timeout);
        }
    }, [flash.success]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleNotificationClick = (notificationId, e) => {
        if (e) {
            e.stopPropagation();
        }
        // Only mark as read if it's not already read
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            router.post(`/notifications/${notificationId}/read`, {}, {
                preserveState: false,
                preserveScroll: false,
                only: ['notifications'],
                onError: (errors) => {
                    console.error('Error marking notification as read:', errors);
                }
            });
        }
    };

    const markAllAsRead = (e) => {
        if (e) {
            e.stopPropagation();
        }
        if (unreadCount > 0) {
            router.post('/notifications/read-all', {}, {
                preserveState: false,
                preserveScroll: false,
                only: ['notifications'],
                onError: (errors) => {
                    console.error('Error marking all notifications as read:', errors);
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white rounded-r-2xl shadow-xl relative z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
                            <h1 className="text-xl font-bold text-gray-900">Ombr</h1>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mx-4 mt-4 mb-3">
                            <div className="bg-gradient-to-br from-[#C85D3A] to-[#B85450] rounded-xl p-4 text-white shadow-lg">
                                <p className="text-xs font-medium opacity-90 mb-1">Balance</p>
                                <p className="text-2xl font-bold">
                                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <nav className="flex-1 space-y-0.5 px-3 py-2">
                            {navigation.map((item) => {
                                const isActive = url && url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                            isActive ? 'bg-[#C85D3A]/10 text-[#B85450]' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="border-t border-gray-100 pt-2 px-3 pb-4">
                            <Link href="/settings" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100">
                                <Cog6ToothIcon className="mr-3 h-5 w-5" />
                                Settings
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100">
                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar - clean card style */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-56 lg:flex-col z-30">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-100 rounded-r-2xl m-2 ml-0 shadow-sm overflow-hidden">
                    <div className="flex items-center flex-shrink-0 px-5 pt-6">
                        <h1 className="text-xl font-bold text-gray-900">Ombr</h1>
                    </div>
                    <div className="mx-3 mt-4 mb-3">
                        <div className="bg-gradient-to-br from-[#C85D3A] to-[#B85450] rounded-xl p-4 text-white shadow-lg">
                            <p className="text-xs font-medium opacity-90 mb-1">Balance</p>
                            <p className="text-lg font-bold truncate">
                                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                    <nav className="flex-1 flex flex-col space-y-0.5 px-2 py-2">
                        {navigation.map((item) => {
                            const isActive = url && url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                        isActive ? 'bg-[#C85D3A]/10 text-[#B85450]' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t border-gray-100 pt-2 px-2 pb-4">
                        <Link href="/settings" className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${url && url.startsWith('/settings') ? 'bg-[#C85D3A]/10 text-[#B85450]' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cog6ToothIcon className="mr-3 h-5 w-5" />
                            Settings
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 text-left">
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-60 relative z-0">
                <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-4 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8">
                    <button type="button" className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
                        <div className="hidden sm:flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search transactions, accounts..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setNotificationsOpen(true)} className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                            <BellIcon className="h-5 w-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#C85D3A] rounded-full" />}
                        </button>
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85D3A] to-[#B85450] flex items-center justify-center text-white font-semibold text-sm">
                                {(auth.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{auth.user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[140px]">{auth.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>

            {/* Notifications Side Panel */}
            {notificationsOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-transparent z-[45]"
                        onClick={() => setNotificationsOpen(false)}
                        style={{ pointerEvents: notificationsOpen ? 'auto' : 'none' }}
                    />
                    <div 
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[50] overflow-y-auto transform transition-transform duration-300 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-[#C85D3A] hover:text-[#B85450] font-medium transition-colors"
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
                                        onClick={(e) => handleNotificationClick(notification.id, e)}
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
                                                    {notification.time || 'Just now'}
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

            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-[60]">
                    <div className="bg-black text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-xs flex items-start space-x-2">
                        <span className="mt-0.5">✓</span>
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}


