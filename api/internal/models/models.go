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
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

// ModuleType represents the type of module/application
type ModuleType string

const (
	ModuleDataConnection ModuleType = "data_connection"
	ModulePipelineBuilder ModuleType = "pipeline_builder"
	ModuleOntology       ModuleType = "ontology"
	ModulePrism          ModuleType = "prism"
	ModuleLattice        ModuleType = "lattice"
	ModuleAIPlatform     ModuleType = "ai_platform"
	ModuleObjectExplorer ModuleType = "object_explorer"
	ModuleObjectView     ModuleType = "object_view"
)

type Module struct {
	ID                  string          `json:"id"`
	WorkspaceID         string          `json:"workspace_id"`
	ModuleType          ModuleType      `json:"module_type"`
	ResourceID          string          `json:"resource_id,omitempty"`
	ResourceURL         string          `json:"resource_url,omitempty"`
	DisplayName         string          `json:"display_name"`
	Anchored            bool            `json:"anchored"`
	InputParameterType  string          `json:"input_parameter_type,omitempty"`
	OutputParameterType string          `json:"output_parameter_type,omitempty"`
}

// TriggerType for navigation actions
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
}

type Favorite struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	ResourceType string    `json:"resource_type"`
	ResourceID   string    `json:"resource_id"`
	Title        string    `json:"title"`
	PinnedAt     time.Time `json:"pinned_at"`
}

type Notification struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	Type         string    `json:"type"` // sync_completed, build_failed, action_executed, agent_alert
	Title        string    `json:"title"`
	Message      string    `json:"message"`
	ResourceType string    `json:"resource_type,omitempty"`
	ResourceID   string    `json:"resource_id,omitempty"`
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

// AccessType for application access control
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
}

// Search result for global search
type SearchResult struct {
	Type       string          `json:"type"` // object, dataset, pipeline, analysis, app, agent
	ID         string          `json:"id"`
	Title      string          `json:"title"`
	Subtitle   string          `json:"subtitle,omitempty"`
	ObjectType string          `json:"object_type,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
}
