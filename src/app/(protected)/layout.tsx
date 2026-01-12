import Sidebar from '@/components/layout/Sidebar'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <Sidebar user={session as any} />
            <main className="flex-1 overflow-auto bg-slate-950">
                <div className="h-full p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
