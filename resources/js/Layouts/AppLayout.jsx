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
    PresentationChartLineIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
    { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
];

function OmbrLogo({ className = '' }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C85D3A] to-[#B85450] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Ombr</span>
        </div>
    );
}

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
        if (e) e.stopPropagation();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            router.post(`/notifications/${notificationId}/read`, {}, {
                preserveState: false,
                preserveScroll: false,
                only: ['notifications'],
            });
        }
    };

    const markAllAsRead = (e) => {
        if (e) e.stopPropagation();
        if (unreadCount > 0) {
            router.post('/notifications/read-all', {}, {
                preserveState: false,
                preserveScroll: false,
                only: ['notifications'],
            });
        }
    };

    const firstName = auth.user?.name?.split(' ')[0] || 'User';

    return (
        <div className="min-h-screen bg-[#FFF5F0] relative">
            {/* Subtle organic background shapes on app */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
                <path d="M1200 50 Q1300 200 1350 400 Q1400 600 1300 750 Q1200 850 1050 800 Q900 750 950 600 Q1000 450 1100 350 Q1150 200 1200 50Z" fill="#FFD4C4" opacity="0.3" />
                <path d="M-50 400 Q50 300 150 350 Q250 400 200 550 Q150 700 50 750 Q-50 700 -50 550Z" fill="#FFE5D9" opacity="0.25" />
            </svg>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white/95 backdrop-blur-xl shadow-2xl relative z-50 overflow-hidden rounded-r-3xl">
                        {/* Mobile sidebar header */}
                        <div className="flex items-center justify-between px-5 py-5">
                            <OmbrLogo />
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Balance card */}
                        <div className="mx-4 mb-4">
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#C85D3A] to-[#9E4A47] rounded-2xl p-5 text-white shadow-lg">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WalletIcon className="h-4 w-4 text-white/70" />
                                        <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Balance</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        KSh {totalBalance.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-1 px-3 py-2">
                            <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
                            {navigation.map((item) => {
                                const isActive = url && url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                            isActive
                                                ? 'bg-[#C85D3A] text-white shadow-md shadow-[#C85D3A]/25'
                                                : 'text-gray-600 hover:bg-[#C85D3A]/5 hover:text-[#C85D3A]'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-gray-100/80 pt-3 px-3 pb-5">
                            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                <Cog6ToothIcon className="h-5 w-5" />
                                Settings
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
                <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/50 overflow-hidden m-3 ml-0 rounded-r-3xl shadow-lg shadow-[#C85D3A]/5">
                    {/* Logo */}
                    <div className="flex items-center px-6 pt-6 pb-2">
                        <OmbrLogo />
                    </div>

                    {/* Balance card */}
                    <div className="mx-4 mt-3 mb-4">
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#C85D3A] via-[#B85450] to-[#9E4A47] rounded-2xl p-4 text-white shadow-lg shadow-[#C85D3A]/20">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <WalletIcon className="h-3.5 w-3.5 text-white/70" />
                                    <p className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Total Balance</p>
                                </div>
                                <p className="text-xl font-bold truncate">
                                    KSh {totalBalance.toLocaleString('en-KE', { minimumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 flex flex-col space-y-1 px-3 py-1">
                        <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
                        {navigation.map((item) => {
                            const isActive = url && url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#C85D3A] text-white shadow-md shadow-[#C85D3A]/25'
                                            : 'text-gray-600 hover:bg-[#C85D3A]/5 hover:text-[#C85D3A]'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                    {item.name}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-gray-100/80 pt-3 px-3 pb-4 space-y-0.5">
                        <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${url && url.startsWith('/settings') ? 'bg-[#C85D3A] text-white shadow-md shadow-[#C85D3A]/25' : 'text-gray-600 hover:bg-[#C85D3A]/5 hover:text-[#C85D3A]'}`}>
                            <Cog6ToothIcon className="h-5 w-5" />
                            Settings
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-left">
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 relative z-10">
                <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 bg-white/70 backdrop-blur-xl border-b border-white/50 px-4 sm:px-6 lg:px-8 shadow-sm shadow-[#C85D3A]/5">
                    <button type="button" className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
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
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200/80 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setNotificationsOpen(true)} className="relative p-2.5 rounded-xl text-gray-500 hover:bg-[#C85D3A]/5 hover:text-[#C85D3A] transition-all">
                            <BellIcon className="h-5 w-5" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#C85D3A] rounded-full ring-2 ring-white" />}
                        </button>
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-200/80">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85D3A] to-[#B85450] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-[#C85D3A]/20">
                                {firstName.charAt(0).toUpperCase()}
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[45]"
                        onClick={() => setNotificationsOpen(false)}
                    />
                    <div
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-[50] overflow-y-auto rounded-l-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-tl-3xl">
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-[#C85D3A] hover:text-[#B85450] font-medium transition-colors">
                                        Mark all as read
                                    </button>
                                )}
                                <button onClick={() => setNotificationsOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={(e) => handleNotificationClick(notification.id, e)}
                                        className={`p-4 cursor-pointer hover:bg-[#FFF5F0]/50 transition-colors ${!notification.read ? 'bg-[#FFF5F0]/30' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {!notification.read && (
                                                <div className="mt-2 flex-shrink-0">
                                                    <span className="h-2 w-2 bg-[#C85D3A] rounded-full block" />
                                                </div>
                                            )}
                                            <div className={`flex-1 ${notification.read ? 'ml-5' : ''}`}>
                                                <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>{notification.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-2">{notification.time || 'Just now'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Toast */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-[60]">
                    <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-xs flex items-start space-x-2">
                        <span className="mt-0.5 text-emerald-400">&#10003;</span>
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
