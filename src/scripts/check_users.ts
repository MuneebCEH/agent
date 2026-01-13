
import { prismadb } from '../lib/prismadb';

async function main() {
    try {
        const users = await prismadb.user.findMany({
            select: { email: true, role: true }
        });
        console.log('USERS_START');
        console.log(JSON.stringify(users, null, 2));
        console.log('USERS_END');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prismadb.$disconnect();
    }
}

main();
