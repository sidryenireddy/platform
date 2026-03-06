package handlers

import (
	"encoding/json"
	"fmt"
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

var notifCounter int

func CreateNotification(w http.ResponseWriter, r *http.Request) {
	var n models.Notification
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if n.ID == "" {
		notifCounter++
		n.ID = fmt.Sprintf("notif-%d", notifCounter+100)
	}
	n.CreatedAt = time.Now()
	notifications[n.ID] = &n
	writeJSON(w, http.StatusCreated, n)
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

func MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	for _, n := range notifications {
		if userID == "" || n.UserID == userID {
			n.Read = true
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// WebhookNotification is called by upstream apps to push notifications
func WebhookNotification(w http.ResponseWriter, r *http.Request) {
	var payload models.WebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// If no user specified, broadcast to all users (use user-1 for dev)
	targetUser := payload.UserID
	if targetUser == "" {
		targetUser = "user-1"
	}

	notifCounter++
	n := &models.Notification{
		ID:           fmt.Sprintf("webhook-%d", notifCounter+100),
		UserID:       targetUser,
		Type:         payload.Type,
		Title:        payload.Title,
		Message:      payload.Message,
		ResourceType: payload.ResourceType,
		ResourceID:   payload.ResourceID,
		AppURL:       payload.AppURL,
		Read:         false,
		CreatedAt:    time.Now(),
	}
	notifications[n.ID] = n
	writeJSON(w, http.StatusCreated, n)
}
