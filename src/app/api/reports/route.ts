import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        // Simple aggregation: Count leads by status
        const statusCounts = await prismadb.lead.groupBy({
            by: ['status'],
            where: { workspaceId: session.workspaceId },
            _count: { status: true }
        });

        // Recent Activity for report
        const recentActivity = await prismadb.activityLog.findMany({
            where: {
                lead: { workspaceId: session.workspaceId }
            },
            include: {
                lead: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { timestamp: 'desc' },
            take: 20
        });

        return NextResponse.json({
            statusCounts,
            recentActivity
        });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
