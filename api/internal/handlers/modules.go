package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var modules = map[string]*models.Module{}

func ListModules(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.URL.Query().Get("workspace_id")
	list := make([]*models.Module, 0)
	for _, m := range modules {
		if workspaceID == "" || m.WorkspaceID == workspaceID {
			list = append(list, m)
		}
	}
	writeJSON(w, http.StatusOK, list)
}

func GetModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	m, ok := modules[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "module not found"})
		return
	}
	writeJSON(w, http.StatusOK, m)
}

func CreateModule(w http.ResponseWriter, r *http.Request) {
	var m models.Module
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	modules[m.ID] = &m
	writeJSON(w, http.StatusCreated, m)
}

func DeleteModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	delete(modules, id)
	w.WriteHeader(http.StatusNoContent)
}
