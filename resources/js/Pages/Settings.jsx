import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';
import {
    LockClosedIcon,
    ShieldCheckIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

export default function Settings({ accounts = [], totalBalance = 0, twoFactorEnabled = false }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            onSuccess: () => {
                passwordForm.reset();
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3000);
            },
        });
    };

    const handleToggle2FA = () => {
        router.post('/settings/two-factor');
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete('/settings/account', {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <AppLayout title="Settings" totalBalance={totalBalance}>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your account security and preferences.</p>
                </div>

                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-[#C85D3A]/10 rounded-xl">
                                <LockClosedIcon className="h-5 w-5 text-[#C85D3A]" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                                <p className="text-xs text-gray-500">Update your password to keep your account secure.</p>
                            </div>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                            {passwordSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                                    Password updated successfully!
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.data.current_password}
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none pr-10"
                                        placeholder="Enter current password"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showCurrentPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.current_password && <p className="text-red-600 text-xs mt-1">{passwordForm.errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.data.password}
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none pr-10"
                                        placeholder="Enter new password"
                                    />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showNewPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.password && <p className="text-red-600 text-xs mt-1">{passwordForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C85D3A]/20 focus:border-[#C85D3A] outline-none pr-10"
                                        placeholder="Confirm new password"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-5 py-2.5 bg-[#C85D3A] text-white rounded-xl font-medium text-sm hover:bg-[#B85450] disabled:opacity-50 transition-all"
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h2>
                                    <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle2FA}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? 'bg-[#C85D3A]' : 'bg-gray-200'}`}
                            >
                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="px-6 pb-5">
                            <div className={`px-4 py-3 rounded-xl text-sm ${twoFactorEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
                                {twoFactorEnabled
                                    ? 'Two-factor authentication is currently enabled. Your account has an extra layer of protection.'
                                    : 'Two-factor authentication is currently disabled. Enable it to enhance your account security.'}
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Danger Zone</h2>
                                <p className="text-xs text-gray-500">Irreversible actions that affect your account permanently.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Delete your account</p>
                                    <p className="text-xs text-gray-500 mt-0.5">This will permanently delete your account, all accounts, transactions, and budgets.</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all flex-shrink-0"
                                >
                                    <TrashIcon className="h-4 w-4 inline mr-1" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-xl">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                                </div>
                                <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                This action is <strong>permanent and cannot be undone</strong>. All your data including accounts, transactions, budgets, and notifications will be deleted.
                            </p>
                            <form onSubmit={handleDeleteAccount} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter your password to confirm</label>
                                    <input
                                        type="password"
                                        value={deleteForm.data.password}
                                        onChange={e => deleteForm.setData('password', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                        placeholder="Your password"
                                        required
                                    />
                                    {deleteForm.errors.password && <p className="text-red-600 text-xs mt-1">{deleteForm.errors.password}</p>}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={deleteForm.processing}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
                                    >
                                        {deleteForm.processing ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
