import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const view = searchParams.get('view');
        const projectId = searchParams.get('projectId');

        const whereClause: Prisma.LeadWhereInput = {};

        if (projectId) {
            whereClause.projectId = projectId;
        }

        // 1. SUPER_ADMIN sees everything.
        // 2. ADMIN sees everything in their workspace.
        // 3. AGENT sees only leads assigned to them OR leads in projects assigned to them.
        if (session.role === 'ADMIN') {
            if (session.workspaceId) {
                whereClause.workspaceId = session.workspaceId;
            }
        } else if (session.role === 'AGENT' || view === 'mine') {
            whereClause.OR = [
                { assignedAgentId: session.id },
                { project: { assignedUsers: { some: { id: session.id } } } }
            ];
        }

        const leads = await prismadb.lead.findMany({
            where: whereClause,
            include: {
                assignedAgent: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error('[LEADS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, email, phone, company, source, notes, dealValue, projectId, assignedAgentId } = body;

        if (!name) return new NextResponse("Name is required", { status: 400 });
        if (!projectId) return new NextResponse("Project ID is required", { status: 400 });

        // Ensure workspaceId exists
        let workspaceId = session.workspaceId;
        if (!workspaceId) {
            // Create or get default workspace for super admin
            const defaultWorkspace = await prismadb.workspace.findFirst({
                where: { name: 'Default Workspace' }
            });

            if (defaultWorkspace) {
                workspaceId = defaultWorkspace.id;
            } else {
                const newWorkspace = await prismadb.workspace.create({
                    data: { name: 'Default Workspace' }
                });
                workspaceId = newWorkspace.id;
            }
        }

        const lead = await prismadb.lead.create({
            data: {
                workspaceId,
                projectId,
                name,
                email: email || null,
                phone: phone || null,
                company: company || null,
                source: source || 'Manual',
                status: 'Not Interested', // Default as per UI
                notes: notes || null,
                dealValue: Number(dealValue) || 0,
                assignedAgentId: assignedAgentId || (session.role === 'AGENT' ? session.id : null),
            }
        });

        // Log Activity
        await prismadb.activityLog.create({
            data: {
                leadId: lead.id,
                userId: session.id,
                action: 'CREATED',
                newStatus: 'Follow-Up',
                details: 'Lead created manually'
            }
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error('[LEADS_POST]', error);
        return NextResponse.json({ error: "Failed to create lead", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
