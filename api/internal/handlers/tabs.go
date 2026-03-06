package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var tabs = map[string]*models.Tab{}

func ListTabs(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	list := make([]*models.Tab, 0)
	for _, t := range tabs {
		if userID == "" || t.UserID == userID {
			list = append(list, t)
		}
	}
	writeJSON(w, http.StatusOK, list)
}

func CreateTab(w http.ResponseWriter, r *http.Request) {
	var t models.Tab
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	tabs[t.ID] = &t
	writeJSON(w, http.StatusCreated, t)
}

func UpdateTab(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	existing, ok := tabs[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "tab not found"})
		return
	}
	if err := json.NewDecoder(r.Body).Decode(existing); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, existing)
}

func DeleteTab(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	delete(tabs, id)
	w.WriteHeader(http.StatusNoContent)
}
