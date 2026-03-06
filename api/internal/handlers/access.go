package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var applicationAccess = map[string]*models.ApplicationAccess{
	"data_connection": {
		ID:              "acc-1",
		OrganizationID:  "org-1",
		ApplicationName: "data_connection",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder","operator"]`),
	},
	"pipeline_builder": {
		ID:              "acc-2",
		OrganizationID:  "org-1",
		ApplicationName: "pipeline_builder",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder"]`),
	},
	"ontology": {
		ID:              "acc-3",
		OrganizationID:  "org-1",
		ApplicationName: "ontology",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder"]`),
	},
	"prism": {
		ID:              "acc-4",
		OrganizationID:  "org-1",
		ApplicationName: "prism",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder","operator"]`),
	},
	"lattice": {
		ID:              "acc-5",
		OrganizationID:  "org-1",
		ApplicationName: "lattice",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder","operator"]`),
	},
	"ai_platform": {
		ID:              "acc-6",
		OrganizationID:  "org-1",
		ApplicationName: "ai_platform",
		AccessType:      models.AccessEveryone,
		AllowedRoles:    json.RawMessage(`["admin","builder"]`),
	},
}

func ListApplicationAccess(w http.ResponseWriter, r *http.Request) {
	list := make([]*models.ApplicationAccess, 0, len(applicationAccess))
	for _, a := range applicationAccess {
		list = append(list, a)
	}
	writeJSON(w, http.StatusOK, list)
}

func UpdateApplicationAccess(w http.ResponseWriter, r *http.Request) {
	appName := chi.URLParam(r, "appName")
	a, ok := applicationAccess[appName]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "application not found"})
		return
	}
	if err := json.NewDecoder(r.Body).Decode(a); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, a)
}

// GetUserAccess returns which apps and workspaces a user can access
func GetUserAccess(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")

	user, ok := users[userID]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "user not found"})
		return
	}

	allowedApps := make([]string, 0)
	for appName, access := range applicationAccess {
		if access.AccessType == models.AccessEveryone {
			// Check role-based access
			if access.AllowedRoles != nil {
				var roles []string
				if err := json.Unmarshal(access.AllowedRoles, &roles); err == nil {
					for _, role := range roles {
						if role == user.Role {
							allowedApps = append(allowedApps, appName)
							break
						}
					}
					continue
				}
			}
			allowedApps = append(allowedApps, appName)
		}
	}

	allowedWorkspaces := make([]*models.Workspace, 0)
	for _, ws := range workspaces {
		if ws.AllowedRoles != nil {
			var roles []string
			if err := json.Unmarshal(ws.AllowedRoles, &roles); err == nil {
				for _, role := range roles {
					if role == user.Role {
						allowedWorkspaces = append(allowedWorkspaces, ws)
						break
					}
				}
				continue
			}
		}
		allowedWorkspaces = append(allowedWorkspaces, ws)
	}

	showBuilder := user.Role == "admin" || user.Role == "builder"

	writeJSON(w, http.StatusOK, models.UserAccessResponse{
		AllowedApps: allowedApps,
		Workspaces:  allowedWorkspaces,
		Role:        user.Role,
		ShowBuilder: showBuilder,
	})
}
