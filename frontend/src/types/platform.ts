export type ModuleType =
  | "data_connection"
  | "pipeline_builder"
  | "ontology"
  | "prism"
  | "lattice"
  | "ai_platform"
  | "object_explorer"
  | "object_view";

export type TriggerType = "click" | "button" | "open_in";
export type AccessType = "everyone" | "allowlist" | "blocklist";
export type UserRole = "admin" | "builder" | "operator";

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization_id: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  theme: "dark" | "light";
  home_page_config?: HomePageConfig;
  menu_bar_config?: MenuBarConfig;
  restrict_navigation: boolean;
  organization_id: string;
  is_promoted: boolean;
  allowed_roles?: string[];
}

export type SectionType = "favorites" | "recent" | "promoted_apps" | "object_types" | "links" | "search" | "custom_text" | "metrics";

export interface HomePageConfig {
  sections: HomePageSection[];
}

export interface HomePageSection {
  type: SectionType;
  title: string;
  column?: number;
  config?: Record<string, unknown>;
}

export interface MenuBarConfig {
  anchored: ModuleType[];
  new_tab: ModuleType[];
}

export interface Module {
  id: string;
  workspace_id: string;
  module_type: ModuleType;
  resource_id?: string;
  resource_url?: string;
  display_name: string;
  anchored: boolean;
  input_parameter_type?: string;
  output_parameter_type?: string;
  discoverable?: boolean;
}

export interface NavigationAction {
  id: string;
  source_module_id: string;
  target_module_id: string;
  parameter_mapping?: Record<string, string>;
  trigger_type: TriggerType;
}

export interface Tab {
  id: string;
  user_id: string;
  module_type: ModuleType;
  resource_url?: string;
  title: string;
  state?: Record<string, unknown>;
  order: number;
  pinned: boolean;
  active?: boolean;
  // Navigation parameter passed from another module
  navParam?: NavigationParam;
}

export interface NavigationParam {
  objectType: string;
  objectId: string;
  objectTitle: string;
  sourceModule: ModuleType;
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  title: string;
  order?: number;
  pinned_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  resource_type?: string;
  resource_id?: string;
  app_url?: string;
  read: boolean;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  default_workspace_id?: string;
  theme: "dark" | "light";
  sidebar_collapsed: boolean;
  recent_resources?: string[];
}

export interface ApplicationAccess {
  id: string;
  organization_id: string;
  application_name: string;
  access_type: AccessType;
  user_group_ids?: string[];
  allowed_roles?: string[];
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  object_type?: string;
  app_url?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  grouped: Record<string, SearchResult[]>;
  total: number;
}

export interface UserAccessResponse {
  allowed_apps: string[];
  workspaces: Workspace[];
  role: string;
  show_builder: boolean;
}

export const APP_REGISTRY: Record<ModuleType, { name: string; icon: string; description: string; color: string }> = {
  data_connection: { name: "Data Connection", icon: "🔌", description: "Connect to external data sources", color: "#58a6ff" },
  pipeline_builder: { name: "Pipeline Builder", icon: "🔧", description: "Build data transformation pipelines", color: "#3fb950" },
  ontology: { name: "Ontology", icon: "🧬", description: "Define and manage object types", color: "#d29922" },
  prism: { name: "Prism", icon: "📊", description: "Analyze data with visualizations", color: "#f778ba" },
  lattice: { name: "Lattice", icon: "📋", description: "Build operational applications", color: "#bc8cff" },
  ai_platform: { name: "AI Platform", icon: "🤖", description: "Build and deploy AI agents", color: "#f85149" },
  object_explorer: { name: "Object Explorer", icon: "🔍", description: "Browse ontology objects", color: "#8b949e" },
  object_view: { name: "Object View", icon: "📄", description: "View object details", color: "#8b949e" },
};

export const APP_ENV_URLS: Record<string, string> = {
  data_connection: process.env.NEXT_PUBLIC_DATA_CONNECTION_URL || "http://localhost:4001",
  pipeline_builder: process.env.NEXT_PUBLIC_PIPELINE_BUILDER_URL || "http://localhost:4002",
  ontology: process.env.NEXT_PUBLIC_ONTOLOGY_URL || "http://localhost:4003",
  prism: process.env.NEXT_PUBLIC_PRISM_URL || "http://localhost:4004",
  lattice: process.env.NEXT_PUBLIC_LATTICE_URL || "http://localhost:4005",
  ai_platform: process.env.NEXT_PUBLIC_AI_PLATFORM_URL || "http://localhost:4006",
};

export const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  sync_completed: { icon: "✓", color: "var(--success)" },
  build_failed: { icon: "✕", color: "var(--danger)" },
  action_executed: { icon: "⚡", color: "var(--accent)" },
  agent_alert: { icon: "🤖", color: "var(--warning)" },
  health_check_violated: { icon: "⚠", color: "var(--danger)" },
};

export const SEARCH_TYPE_ICONS: Record<string, string> = {
  object: "◆",
  dataset: "▤",
  pipeline: "⟿",
  analysis: "◈",
  app: "◧",
  agent: "◉",
};

// Maps resource types to the module that opens them
export const RESOURCE_TYPE_TO_MODULE: Record<string, ModuleType> = {
  object: "object_explorer",
  dataset: "data_connection",
  pipeline: "pipeline_builder",
  analysis: "prism",
  app: "lattice",
  agent: "ai_platform",
};
