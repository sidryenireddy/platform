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
	},
	"pipeline_builder": {
		ID:              "acc-2",
		OrganizationID:  "org-1",
		ApplicationName: "pipeline_builder",
		AccessType:      models.AccessEveryone,
	},
	"ontology": {
		ID:              "acc-3",
		OrganizationID:  "org-1",
		ApplicationName: "ontology",
		AccessType:      models.AccessEveryone,
	},
	"prism": {
		ID:              "acc-4",
		OrganizationID:  "org-1",
		ApplicationName: "prism",
		AccessType:      models.AccessEveryone,
	},
	"lattice": {
		ID:              "acc-5",
		OrganizationID:  "org-1",
		ApplicationName: "lattice",
		AccessType:      models.AccessEveryone,
	},
	"ai_platform": {
		ID:              "acc-6",
		OrganizationID:  "org-1",
		ApplicationName: "ai_platform",
		AccessType:      models.AccessEveryone,
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
