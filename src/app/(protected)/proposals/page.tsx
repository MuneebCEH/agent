import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prismadb } from '@/lib/prismadb'
import ProposalManager from '@/components/proposals/ProposalManager'

export default async function ProposalsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    let workspaceId: string | null = session.workspaceId

    // Self-healing: If session has no workspaceId, try to find one
    if (!workspaceId) {
        const user = await prismadb.user.findUnique({
            where: { id: session.id },
            select: { workspaceId: true }
        })
        workspaceId = user?.workspaceId || null
    }

    if (!workspaceId) {
        return <div className="p-8 text-white">No workspace configured. Please contact support.</div>
    }

    const templates = await prismadb.proposalTemplate.findMany({
        where: { workspaceId: workspaceId || undefined },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            content: true,
            prompt: true,
            createdAt: true
        }
    })

    const formattedTemplates = templates.map(t => ({
        ...t,
        prompt: t.prompt || undefined, // Handle nullable string
        createdAt: t.createdAt.toISOString()
    }))

    return (
        <div className="h-full flex flex-col">
            <div className="px-8 py-6">
                <h1 className="text-3xl font-bold text-white">Proposal Templates</h1>
                <p className="text-slate-400 mt-1">Generate and manage reusable proposal templates with AI.</p>
            </div>

            <div className="flex-1 px-8 pb-8 overflow-hidden">
                <ProposalManager initialTemplates={formattedTemplates} />
            </div>
        </div>
    )
}
