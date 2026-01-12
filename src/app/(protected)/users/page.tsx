import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prismadb } from '@/lib/prismadb'
import UserManagement from '@/components/users/UserManagement'
import { User } from '@/types'

export default async function UsersPage() {
    const session = await getSession()

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
        redirect('/dashboard')
    }

    const users = await prismadb.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            permissions: true,
            workspaceId: true
        }
    })

    const parsedUsers: User[] = users.map(u => ({
        ...u,
        role: u.role as 'SUPER_ADMIN' | 'ADMIN' | 'AGENT',
        permissions: u.permissions ? JSON.parse(u.permissions) : [],
        workspaceId: u.workspaceId || ''
    }))

    const currentUser: User = {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role as 'SUPER_ADMIN' | 'ADMIN' | 'AGENT',
        workspaceId: session.workspaceId,
        permissions: [] // Session might not have permissions in token yet, but okay for now
    }

    return (
        <div className="container mx-auto max-w-7xl">
            <UserManagement
                initialUsers={parsedUsers}
                currentUser={currentUser}
            />
        </div>
    )
}
