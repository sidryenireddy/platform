CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'builder', 'operator')),
    organization_id UUID NOT NULL REFERENCES organizations(id)
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    home_page_config JSONB DEFAULT '{}',
    menu_bar_config JSONB DEFAULT '{}',
    restrict_navigation BOOLEAN NOT NULL DEFAULT false,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    is_promoted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    module_type TEXT NOT NULL CHECK (module_type IN (
        'data_connection', 'pipeline_builder', 'ontology', 'prism',
        'lattice', 'ai_platform', 'object_explorer', 'object_view'
    )),
    resource_id TEXT,
    resource_url TEXT,
    display_name TEXT NOT NULL,
    anchored BOOLEAN NOT NULL DEFAULT false,
    input_parameter_type TEXT,
    output_parameter_type TEXT
);

CREATE TABLE navigation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    target_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    parameter_mapping JSONB DEFAULT '{}',
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('click', 'button', 'open_in'))
);

CREATE TABLE tabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_type TEXT NOT NULL,
    resource_url TEXT,
    title TEXT NOT NULL,
    state JSONB DEFAULT '{}',
    "order" INT NOT NULL DEFAULT 0,
    pinned BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    title TEXT NOT NULL,
    pinned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    default_workspace_id UUID REFERENCES workspaces(id),
    theme TEXT NOT NULL DEFAULT 'dark',
    sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
    recent_resources JSONB DEFAULT '[]'
);

CREATE TABLE application_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    application_name TEXT NOT NULL,
    access_type TEXT NOT NULL DEFAULT 'everyone' CHECK (access_type IN ('everyone', 'allowlist', 'blocklist')),
    user_group_ids JSONB DEFAULT '[]',
    UNIQUE(organization_id, application_name)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_modules_workspace ON modules(workspace_id);
CREATE INDEX idx_tabs_user ON tabs(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
