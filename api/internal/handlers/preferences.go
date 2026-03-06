package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var preferences = map[string]*models.UserPreference{
	"user-1": {
		ID:               "pref-1",
		UserID:           "user-1",
		Theme:            "dark",
		SidebarCollapsed: false,
		RecentResources:  json.RawMessage(`[]`),
	},
}

func GetPreferences(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")
	pref, ok := preferences[userID]
	if !ok {
		writeJSON(w, http.StatusOK, &models.UserPreference{UserID: userID, Theme: "dark"})
		return
	}
	writeJSON(w, http.StatusOK, pref)
}

func UpdatePreferences(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")
	pref, ok := preferences[userID]
	if !ok {
		pref = &models.UserPreference{UserID: userID}
		preferences[userID] = pref
	}
	if err := json.NewDecoder(r.Body).Decode(pref); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, pref)
}
