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
}

export interface HomePageConfig {
  sections: HomePageSection[];
}

export interface HomePageSection {
  type: "favorites" | "recent" | "promoted_apps" | "object_types" | "links" | "search" | "custom_text";
  title: string;
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
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  title: string;
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
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  object_type?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  grouped: Record<string, SearchResult[]>;
  total: number;
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
