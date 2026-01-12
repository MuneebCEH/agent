import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        let workspaceId = session.workspaceId;

        // Fallback: If workspaceId is missing in session, fetch it from DB
        if (!workspaceId) {
            const user = await prismadb.user.findUnique({
                where: { id: session.id },
                select: { workspaceId: true }
            });
            workspaceId = user?.workspaceId || "";
        }

        if (!workspaceId) {
            // If still no workspace, try to find the first workspace this user belongs to
            const firstWorkspace = await prismadb.workspace.findFirst({
                where: {
                    users: { some: { id: session.id } }
                }
            });
            workspaceId = firstWorkspace?.id || "";
        }

        if (!workspaceId && session.role !== 'SUPER_ADMIN') {
            return new NextResponse("No workspace found", { status: 400 });
        }

        const whereClause: any = {};

        // 1. SUPER_ADMIN sees everything.
        // 2. ADMIN sees everything in their workspace.
        // 3. AGENT sees only their assigned projects.
        if (session.role === 'ADMIN') {
            if (workspaceId) {
                whereClause.workspaceId = workspaceId;
            }
        } else if (session.role !== 'SUPER_ADMIN') {
            whereClause.assignedUsers = {
                some: { id: session.id }
            };
        }

        // Fetch all projects in the workspace (or all for Super Admin if no workspace)
        const projects = await prismadb.project.findMany({
            where: whereClause,
            include: {
                leads: {
                    select: {
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Aggregate stats per project
        const projectStats = projects.map((project: any) => {
            const statusCounts: Record<string, number> = {};
            project.leads.forEach((lead: any) => {
                statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
            });

            return {
                id: project.id,
                name: project.name,
                description: project.description,
                totalLeads: project.leads.length,
                statusCounts,
                createdAt: project.createdAt
            };
        });

        // Global stats
        const totalLeads = projectStats.reduce((sum: number, p: any) => sum + p.totalLeads, 0);
        const totalProjects = projectStats.length;

        return NextResponse.json({
            totalLeads,
            totalProjects,
            projectStats
        });
    } catch (error) {
        console.error('[DASHBOARD_STATS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
