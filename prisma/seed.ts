import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const password = '$2a$12$e.g.encodedhashvalueforpassword123' // TODO: Replace with real hash if needed or fix bcrypt

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Default Workspace'
    }
  })

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {
      workspaceId: workspace.id
    },
    create: {
      email: 'super@admin.com',
      name: 'Super Admin',
      password,
      role: 'SUPER_ADMIN',
      workspaceId: workspace.id
    },
  })

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
      workspaceId: workspace.id
    },
  })

  // Agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@company.com' },
    update: {},
    create: {
      email: 'agent@company.com',
      name: 'Agent User',
      password,
      role: 'AGENT',
      workspaceId: workspace.id
    },
  })

  // Create a default project
  const project = await prisma.project.create({
    data: {
      name: 'Alpha Campaign',
      description: 'Q1 Sales Initiation',
      workspaceId: workspace.id
    }
  })

  // Create some leads linked to the project
  await prisma.lead.createMany({
    data: [
      {
        name: 'John Doe',
        company: 'Acme Corp',
        email: 'john@acme.com',
        status: 'Follow-Up',
        dealValue: 5000,
        workspaceId: workspace.id,
        projectId: project.id,
        assignedAgentId: agent.id,
        source: 'Website'
      },
      {
        name: 'Sarah Smith',
        company: 'Tech Solutions',
        email: 'sarah@tech.com',
        status: 'Qualified',
        dealValue: 12000,
        workspaceId: workspace.id,
        projectId: project.id,
        assignedAgentId: agent.id,
        source: 'Referral'
      },
      {
        name: 'Mike Johnson',
        company: 'Global Inc',
        email: 'mike@global.com',
        status: 'Sales Complete',
        dealValue: 25000,
        workspaceId: workspace.id,
        projectId: project.id,
        assignedAgentId: agent.id,
        source: 'Cold Call'
      }
    ]
  })

  console.log({ superAdmin, admin, agent })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
