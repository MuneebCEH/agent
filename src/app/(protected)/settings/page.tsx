import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsView from '@/components/settings/SettingsView'
import { User } from '@/types'

export default async function SettingsPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const currentUser: User = {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role as 'SUPER_ADMIN' | 'ADMIN' | 'AGENT',
        workspaceId: session.workspaceId,
        permissions: session.permissions
    }

    return (
        <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <SettingsView user={currentUser} />
        </div>
    )
}
