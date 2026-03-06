package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var navigationActions = map[string]*models.NavigationAction{}

func ListNavigationActions(w http.ResponseWriter, r *http.Request) {
	sourceID := r.URL.Query().Get("source_module_id")
	list := make([]*models.NavigationAction, 0)
	for _, na := range navigationActions {
		if sourceID == "" || na.SourceModuleID == sourceID {
			list = append(list, na)
		}
	}
	writeJSON(w, http.StatusOK, list)
}

func CreateNavigationAction(w http.ResponseWriter, r *http.Request) {
	var na models.NavigationAction
	if err := json.NewDecoder(r.Body).Decode(&na); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	navigationActions[na.ID] = &na
	writeJSON(w, http.StatusCreated, na)
}

func DeleteNavigationAction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	delete(navigationActions, id)
	w.WriteHeader(http.StatusNoContent)
}
