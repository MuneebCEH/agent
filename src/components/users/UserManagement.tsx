'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Plus, Search, MoreVertical, Shield, Mail, Pencil, Trash2, X, Check, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_leads', label: 'Manage Leads', description: 'Create, edit, and assign leads' },
    { id: 'delete_leads', label: 'Delete Leads', description: 'Permanently remove leads' },
    { id: 'view_reports', label: 'View Analytics', description: 'Access dashboard reports' },
    { id: 'manage_team', label: 'Manage Team', description: 'View other team members' },
    { id: 'export_data', label: 'Export Data', description: 'Download data as CSV/Excel' },
    { id: 'manage_settings', label: 'System Settings', description: 'Configure workspace settings' },
]

const ROLES = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'ADMIN', label: 'Admin', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'AGENT', label: 'Agent', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
]

export default function UserManagement({ initialUsers, currentUser }: { initialUsers: User[], currentUser: User }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AGENT',
        permissions: [] as string[]
    })

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role,
                permissions: user.permissions || []
            })
        } else {
            setEditingUser(null)
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'AGENT',
                permissions: []
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const endpoint = editingUser
                ? `/api/users/${editingUser.id}`
                : '/api/users'

            const method = editingUser ? 'PATCH' : 'POST'

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error)
            }

            const savedUser = await res.json()

            if (editingUser) {
                setUsers(users.map(u => u.id === savedUser.id ? savedUser : u))
                toast.success('User updated successfully')
            } else {
                setUsers([savedUser, ...users])
                toast.success('User created successfully')
            }
            setIsModalOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(await res.text())

            setUsers(users.filter(u => u.id !== id))
            toast.success('User deleted')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const togglePermission = (id: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter(p => p !== id)
                : [...prev.permissions, id]
        }))
    }

    const canEdit = currentUser.role === 'SUPER_ADMIN'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400 mt-1">Manage standard roles and advanced permissions for your team.</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add User
                    </button>
                )}
            </div>

            {/* Users Grid/Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">User</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">Permissions</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLES.find(r => r.id === user.role)?.color}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'SUPER_ADMIN' ? (
                                                <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Full Access
                                                </span>
                                            ) : user.permissions && user.permissions.length > 0 ? (
                                                user.permissions.slice(0, 3).map(p => (
                                                    <span key={p} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
                                                        {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">No extra permissions</span>
                                            )}
                                            {user.permissions && user.permissions.length > 3 && (
                                                <span className="text-[10px] text-slate-500 px-1">+{user.permissions.length - 3} more</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                disabled={!canEdit}
                                                className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={!canEdit || user.id === currentUser.id}
                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-300">
                                            {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Roles & Permissions */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Role & Access</h3>

                                <div className="grid grid-cols-3 gap-3">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.id })}
                                            className={`
                                                relative p-4 rounded-lg border text-left transition-all
                                                ${formData.role === role.id
                                                    ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                                }
                                            `}
                                        >
                                            <div className={`font-semibold mb-1 ${formData.role === role.id ? 'text-blue-400' : 'text-slate-300'}`}>
                                                {role.label}
                                            </div>
                                            {formData.role === role.id && (
                                                <div className="absolute top-2 right-2 text-blue-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {formData.role !== 'SUPER_ADMIN' && (
                                    <div className="mt-6 border-t border-slate-800 pt-6">
                                        <label className="block text-sm font-medium text-slate-300 mb-4">Granular Permissions</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                                <label
                                                    key={perm.id}
                                                    className={`
                                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                                        ${formData.permissions.includes(perm.id)
                                                            ? 'bg-emerald-500/5 border-emerald-500/30'
                                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                        className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                                    />
                                                    <div>
                                                        <div className={`text-sm font-medium ${formData.permissions.includes(perm.id) ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                            {perm.label}
                                                        </div>
                                                        <p className="text-xs text-slate-500">{perm.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
