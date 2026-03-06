package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

// In-memory store for development (replace with PostgreSQL)
var workspaces = map[string]*models.Workspace{
	"default": {
		ID:          "default",
		Name:        "Default Builder",
		Description: "Main builder workspace",
		Theme:       "dark",
		HomePageConfig: json.RawMessage(`{
			"sections": [
				{"type": "favorites", "title": "Favorites"},
				{"type": "recent", "title": "Recent"},
				{"type": "promoted_apps", "title": "Promoted Apps"}
			]
		}`),
		MenuBarConfig: json.RawMessage(`{
			"anchored": ["data_connection", "pipeline_builder", "ontology", "prism", "lattice", "ai_platform"],
			"new_tab": ["object_explorer"]
		}`),
		RestrictNavigation: false,
		OrganizationID:     "org-1",
		IsPromoted:         true,
	},
}

func ListWorkspaces(w http.ResponseWriter, r *http.Request) {
	list := make([]*models.Workspace, 0, len(workspaces))
	for _, ws := range workspaces {
		list = append(list, ws)
	}
	writeJSON(w, http.StatusOK, list)
}

func GetWorkspace(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ws, ok := workspaces[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "workspace not found"})
		return
	}
	writeJSON(w, http.StatusOK, ws)
}

func CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	var ws models.Workspace
	if err := json.NewDecoder(r.Body).Decode(&ws); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	workspaces[ws.ID] = &ws
	writeJSON(w, http.StatusCreated, ws)
}

func UpdateWorkspace(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	existing, ok := workspaces[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "workspace not found"})
		return
	}
	if err := json.NewDecoder(r.Body).Decode(existing); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, existing)
}

func DeleteWorkspace(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, ok := workspaces[id]; !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "workspace not found"})
		return
	}
	delete(workspaces, id)
	w.WriteHeader(http.StatusNoContent)
}
