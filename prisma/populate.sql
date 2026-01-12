-- Create Workspace first
INSERT INTO Workspace (id, name, createdAt, updatedAt) 
VALUES ('ws-default', 'Default Workspace', datetime('now'), datetime('now'));

-- Create Super Admin (no workspace needed)
INSERT INTO User (id, email, name, password, role, createdAt, updatedAt) 
VALUES (
  'user-super', 
  'super@admin.com', 
  'Super Admin', 
  '$2a$12$e.g.encodedhashvalueforpassword123', 
  'SUPER_ADMIN', 
  datetime('now'), 
  datetime('now')
);

-- Create Admin User
INSERT INTO User (id, email, name, password, role, workspaceId, createdAt, updatedAt) 
VALUES (
  'user-admin', 
  'admin@company.com', 
  'Admin User', 
  '$2a$12$e.g.encodedhashvalueforpassword123', 
  'ADMIN', 
  'ws-default',
  datetime('now'), 
  datetime('now')
);

-- Create Agent User
INSERT INTO User (id, email, name, password, role, workspaceId, createdAt, updatedAt) 
VALUES (
  'user-agent', 
  'agent@company.com', 
  'Agent User', 
  '$2a$12$e.g.encodedhashvalueforpassword123', 
  'AGENT', 
  'ws-default',
  datetime('now'), 
  datetime('now')
);

-- Create sample leads
INSERT INTO Lead (id, name, company, email, status, dealValue, workspaceId, assignedAgentId, source, createdAt, updatedAt)
VALUES 
('lead-1', 'John Doe', 'Acme Corp', 'john@acme.com', 'Follow-Up', 5000, 'ws-default', 'user-agent', 'Website', datetime('now'), datetime('now')),
('lead-2', 'Sarah Smith', 'Tech Solutions', 'sarah@tech.com', 'Qualified', 12000, 'ws-default', 'user-agent', 'Referral', datetime('now'), datetime('now')),
('lead-3', 'Mike Johnson', 'Global Inc', 'mike@global.com', 'Sales Complete', 25000, 'ws-default', 'user-agent', 'Cold Call', datetime('now'), datetime('now'));
