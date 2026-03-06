package models

import (
	"encoding/json"
	"time"
)

type Organization struct {
	ID       string          `json:"id"`
	Name     string          `json:"name"`
	LogoURL  string          `json:"logo_url,omitempty"`
	Settings json.RawMessage `json:"settings,omitempty"`
}

type User struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	Name           string `json:"name"`
	Role           string `json:"role"` // admin, builder, operator
	OrganizationID string `json:"organization_id"`
}

type Workspace struct {
	ID                 string          `json:"id"`
	Name               string          `json:"name"`
	Description        string          `json:"description,omitempty"`
	LogoURL            string          `json:"logo_url,omitempty"`
	Theme              string          `json:"theme"` // dark, light
	HomePageConfig     json.RawMessage `json:"home_page_config,omitempty"`
	MenuBarConfig      json.RawMessage `json:"menu_bar_config,omitempty"`
	RestrictNavigation bool            `json:"restrict_navigation"`
	OrganizationID     string          `json:"organization_id"`
	IsPromoted         bool            `json:"is_promoted"`
	AllowedRoles       json.RawMessage `json:"allowed_roles,omitempty"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

type ModuleType string

const (
	ModuleDataConnection  ModuleType = "data_connection"
	ModulePipelineBuilder ModuleType = "pipeline_builder"
	ModuleOntology        ModuleType = "ontology"
	ModulePrism           ModuleType = "prism"
	ModuleLattice         ModuleType = "lattice"
	ModuleAIPlatform      ModuleType = "ai_platform"
	ModuleObjectExplorer  ModuleType = "object_explorer"
	ModuleObjectView      ModuleType = "object_view"
)

type Module struct {
	ID                  string     `json:"id"`
	WorkspaceID         string     `json:"workspace_id"`
	ModuleType          ModuleType `json:"module_type"`
	ResourceID          string     `json:"resource_id,omitempty"`
	ResourceURL         string     `json:"resource_url,omitempty"`
	DisplayName         string     `json:"display_name"`
	Anchored            bool       `json:"anchored"`
	InputParameterType  string     `json:"input_parameter_type,omitempty"`
	OutputParameterType string     `json:"output_parameter_type,omitempty"`
	Discoverable        bool       `json:"discoverable"`
}

type TriggerType string

const (
	TriggerClick  TriggerType = "click"
	TriggerButton TriggerType = "button"
	TriggerOpenIn TriggerType = "open_in"
)

type NavigationAction struct {
	ID               string          `json:"id"`
	SourceModuleID   string          `json:"source_module_id"`
	TargetModuleID   string          `json:"target_module_id"`
	ParameterMapping json.RawMessage `json:"parameter_mapping,omitempty"`
	TriggerType      TriggerType     `json:"trigger_type"`
}

type Tab struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	ModuleType  ModuleType      `json:"module_type"`
	ResourceURL string          `json:"resource_url,omitempty"`
	Title       string          `json:"title"`
	State       json.RawMessage `json:"state,omitempty"`
	Order       int             `json:"order"`
	Pinned      bool            `json:"pinned"`
	Active      bool            `json:"active"`
}

type Favorite struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	ResourceType string    `json:"resource_type"`
	ResourceID   string    `json:"resource_id"`
	Title        string    `json:"title"`
	Order        int       `json:"order"`
	PinnedAt     time.Time `json:"pinned_at"`
}

type Notification struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Type         string    `json:"type"`
	Title        string    `json:"title"`
	Message      string    `json:"message"`
	ResourceType string    `json:"resource_type,omitempty"`
	ResourceID   string    `json:"resource_id,omitempty"`
	AppURL       string    `json:"app_url,omitempty"`
	Read         bool      `json:"read"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserPreference struct {
	ID                 string          `json:"id"`
	UserID             string          `json:"user_id"`
	DefaultWorkspaceID string          `json:"default_workspace_id,omitempty"`
	Theme              string          `json:"theme"`
	SidebarCollapsed   bool            `json:"sidebar_collapsed"`
	RecentResources    json.RawMessage `json:"recent_resources,omitempty"`
}

type AccessType string

const (
	AccessEveryone  AccessType = "everyone"
	AccessAllowlist AccessType = "allowlist"
	AccessBlocklist AccessType = "blocklist"
)

type ApplicationAccess struct {
	ID              string          `json:"id"`
	OrganizationID  string          `json:"organization_id"`
	ApplicationName string          `json:"application_name"`
	AccessType      AccessType      `json:"access_type"`
	UserGroupIDs    json.RawMessage `json:"user_group_ids,omitempty"`
	AllowedRoles    json.RawMessage `json:"allowed_roles,omitempty"`
}

type SearchResult struct {
	Type       string          `json:"type"`
	ID         string          `json:"id"`
	Title      string          `json:"title"`
	Subtitle   string          `json:"subtitle,omitempty"`
	ObjectType string          `json:"object_type,omitempty"`
	AppURL     string          `json:"app_url,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
}

// WebhookPayload is sent by upstream apps to create notifications
type WebhookPayload struct {
	Type         string `json:"type"`
	Title        string `json:"title"`
	Message      string `json:"message"`
	UserID       string `json:"user_id,omitempty"`
	ResourceType string `json:"resource_type,omitempty"`
	ResourceID   string `json:"resource_id,omitempty"`
	AppURL       string `json:"app_url,omitempty"`
}

// TabSyncRequest for bulk syncing tabs
type TabSyncRequest struct {
	UserID    string `json:"user_id"`
	Tabs      []Tab  `json:"tabs"`
	ActiveTab string `json:"active_tab"`
}

// FavoriteReorderRequest for reordering favorites
type FavoriteReorderRequest struct {
	IDs []string `json:"ids"`
}

// UserAccessResponse returns what a user can access
type UserAccessResponse struct {
	AllowedApps []string     `json:"allowed_apps"`
	Workspaces  []*Workspace `json:"workspaces"`
	Role        string       `json:"role"`
	ShowBuilder bool         `json:"show_builder"`
}
