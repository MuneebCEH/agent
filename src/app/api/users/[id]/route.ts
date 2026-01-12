import { NextResponse } from 'next/server'
import { prismadb } from '@/lib/prismadb'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    try {
        const body = await req.json()
        const { name, email, role, permissions, password } = body

        const updateData: any = {
            name,
            email,
            role,
            permissions: JSON.stringify(permissions || [])
        }

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 12)
        }

        const user = await prismadb.user.update({
            where: { id },
            data: updateData
        })

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
            ...userWithoutPassword,
            permissions: JSON.parse(user.permissions)
        })
    } catch (error) {
        console.error('[USER_PATCH]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    if (id === session.id) {
        return new NextResponse('Cannot delete yourself', { status: 400 })
    }

    try {
        await prismadb.user.delete({
            where: { id }
        })

        return new NextResponse('User deleted', { status: 200 })
    } catch (error) {
        console.error('[USER_DELETE]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
