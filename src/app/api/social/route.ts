import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const posts = await prismadb.socialPost.findMany({
            where: { workspaceId: session.workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(posts);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { content, platform, scheduledFor } = body;

        const post = await prismadb.socialPost.create({
            data: {
                workspaceId: session.workspaceId,
                content,
                platform,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                status: 'DRAFT'
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
