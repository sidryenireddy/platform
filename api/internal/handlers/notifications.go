package handlers

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/sidryenireddy/platform/api/internal/models"
)

var notifications = map[string]*models.Notification{
	"notif-1": {
		ID:        "notif-1",
		UserID:    "user-1",
		Type:      "sync_completed",
		Title:     "Data Sync Complete",
		Message:   "Customer dataset has been synced successfully.",
		Read:      false,
		CreatedAt: time.Now(),
	},
	"notif-2": {
		ID:        "notif-2",
		UserID:    "user-1",
		Type:      "build_failed",
		Title:     "Pipeline Build Failed",
		Message:   "ETL pipeline 'customer-enrichment' failed at step 3.",
		Read:      false,
		CreatedAt: time.Now(),
	},
}

func ListNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	list := make([]*models.Notification, 0)
	for _, n := range notifications {
		if userID == "" || n.UserID == userID {
			list = append(list, n)
		}
	}
	writeJSON(w, http.StatusOK, list)
}

func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	n, ok := notifications[id]
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "notification not found"})
		return
	}
	n.Read = true
	writeJSON(w, http.StatusOK, n)
}
