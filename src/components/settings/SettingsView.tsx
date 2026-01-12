'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Save, User as UserIcon, Building, Bell, Lock, Shield, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SettingsView({ user }: { user: User }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState(false)

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user.name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Workspace State (Mock for now)
    const [workspaceData, setWorkspaceData] = useState({
        name: 'My Workspace',
        domain: 'golexcel.com',
        timezone: 'UTC-5'
    })

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileData.name,
                    currentPassword: profileData.currentPassword,
                    newPassword: profileData.newPassword
                })
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text)
            }

            toast.success('Profile updated successfully')
            setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: UserIcon },
        { id: 'workspace', label: 'Workspace', icon: Building, show: user.role === 'SUPER_ADMIN' },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ]

    return (
        <div className="flex bg-slate-900 min-h-[calc(100vh-4rem)] rounded-2xl border border-slate-800 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-4">
                <nav className="space-y-1">
                    {tabs.filter(t => t.show !== false).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                ${activeTab === tab.id
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }
                            `}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 bg-slate-900">
                {activeTab === 'profile' && (
                    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
                            <p className="text-slate-400">Manage your personal account information and security.</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-6">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-700/50">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                        <Shield className="w-3 h-3" />
                                        <span>{user.role.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Mail className="w-3 h-3" />
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Change Password
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={profileData.currentPassword}
                                            onChange={e => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                value={profileData.newPassword}
                                                onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={profileData.confirmPassword}
                                                onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'workspace' && (
                    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Workspace Settings</h2>
                            <p className="text-slate-400">Manage your organization's global settings.</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
                            <Building className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Workspace Management Coming Soon</h3>
                            <p className="text-slate-400">
                                This feature is under development. Soon you'll be able to manage custom statuses, pipelines, and integrations.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                            <p className="text-slate-400">Choose how and when you want to be notified.</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                            {['Lead Assigned', 'Lead Status Change', 'New Comment', 'Daily Digest'].map((item) => (
                                <div key={item} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                                    <div>
                                        <div className="font-medium text-white">{item}</div>
                                        <div className="text-xs text-slate-500">Receive alerts via email and in-app</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
