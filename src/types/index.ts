export interface User {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
    workspaceId: string;
    permissions?: string[];
}

export interface Lead {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    status: string;
    notes?: string;
    dealValue?: number;
    assignedAgentId?: string;
    assignedAgent?: { name: string; email: string };
    nextFollowUp?: string;
    createdAt: string;

    // New Fields
    title?: string;
    industry?: string;
    revenue?: string;
    employees?: string;
    mobile?: string;
    corporatePhone?: string;
    state?: string;
    linkedin?: string;
    website?: string;
}

export interface SocialPost {
    id: string;
    content: string;
    platform: 'twitter' | 'linkedin' | 'facebook';
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
    scheduledFor?: string;
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    action: string;
    lead: { name: string };
    user: { name: string };
    previousStatus?: string;
    newStatus?: string;
    timestamp: string;
}
