package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var favorites = map[string]*models.Favorite{}

func ListFavorites(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	list := make([]*models.Favorite, 0)
	for _, f := range favorites {
		if userID == "" || f.UserID == userID {
			list = append(list, f)
		}
	}
	writeJSON(w, http.StatusOK, list)
}

func CreateFavorite(w http.ResponseWriter, r *http.Request) {
	var f models.Favorite
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	f.PinnedAt = time.Now()
	favorites[f.ID] = &f
	writeJSON(w, http.StatusCreated, f)
}

func DeleteFavorite(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	delete(favorites, id)
	w.WriteHeader(http.StatusNoContent)
}
