package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var organizations = map[string]*models.Organization{
	"org-1": {
		ID:   "org-1",
		Name: "Rebel Inc",
	},
}

var users = map[string]*models.User{
	"user-1": {
		ID:             "user-1",
		Email:          "admin@rebelinc.ai",
		Name:           "Admin User",
		Role:           "admin",
		OrganizationID: "org-1",
	},
}

func CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var org models.Organization
	if err := json.NewDecoder(r.Body).Decode(&org); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	organizations[org.ID] = &org
	writeJSON(w, http.StatusCreated, org)
}

func ListOrganizations(w http.ResponseWriter, r *http.Request) {
	list := make([]*models.Organization, 0, len(organizations))
	for _, o := range organizations {
		list = append(list, o)
	}
	writeJSON(w, http.StatusOK, list)
}

func GetOrganization(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	org, ok := organizations[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "organization not found"})
		return
	}
	writeJSON(w, http.StatusOK, org)
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
	list := make([]*models.User, 0, len(users))
	for _, u := range users {
		list = append(list, u)
	}
	writeJSON(w, http.StatusOK, list)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	u, ok := users[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "user not found"})
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var u models.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	users[u.ID] = &u
	writeJSON(w, http.StatusCreated, u)
}
