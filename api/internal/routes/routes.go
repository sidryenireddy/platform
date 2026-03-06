package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/sidryenireddy/platform/api/internal/config"
	"github.com/sidryenireddy/platform/api/internal/handlers"
)

func Setup(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL, "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		// Workspaces
		r.Route("/workspaces", func(r chi.Router) {
			r.Get("/", handlers.ListWorkspaces)
			r.Post("/", handlers.CreateWorkspace)
			r.Get("/{id}", handlers.GetWorkspace)
			r.Put("/{id}", handlers.UpdateWorkspace)
			r.Delete("/{id}", handlers.DeleteWorkspace)
		})

		// Modules
		r.Route("/modules", func(r chi.Router) {
			r.Get("/", handlers.ListModules)
			r.Post("/", handlers.CreateModule)
			r.Get("/{id}", handlers.GetModule)
			r.Delete("/{id}", handlers.DeleteModule)
		})

		// Navigation actions
		r.Route("/navigation-actions", func(r chi.Router) {
			r.Get("/", handlers.ListNavigationActions)
			r.Post("/", handlers.CreateNavigationAction)
			r.Delete("/{id}", handlers.DeleteNavigationAction)
		})

		// Tabs
		r.Route("/tabs", func(r chi.Router) {
			r.Get("/", handlers.ListTabs)
			r.Post("/", handlers.CreateTab)
			r.Put("/{id}", handlers.UpdateTab)
			r.Delete("/{id}", handlers.DeleteTab)
			r.Post("/sync", handlers.SyncTabs)
		})

		// Favorites
		r.Route("/favorites", func(r chi.Router) {
			r.Get("/", handlers.ListFavorites)
			r.Post("/", handlers.CreateFavorite)
			r.Delete("/{id}", handlers.DeleteFavorite)
			r.Post("/reorder", handlers.ReorderFavorites)
		})

		// Notifications
		r.Route("/notifications", func(r chi.Router) {
			r.Get("/", handlers.ListNotifications)
			r.Post("/", handlers.CreateNotification)
			r.Patch("/{id}/read", handlers.MarkNotificationRead)
			r.Post("/read-all", handlers.MarkAllNotificationsRead)
			r.Post("/webhook", handlers.WebhookNotification)
		})

		// Search
		r.Get("/search", handlers.GlobalSearch)

		// User preferences
		r.Get("/users/{userId}/preferences", handlers.GetPreferences)
		r.Put("/users/{userId}/preferences", handlers.UpdatePreferences)

		// User access (what apps/workspaces a user can see)
		r.Get("/users/{userId}/access", handlers.GetUserAccess)

		// Application access control
		r.Get("/application-access", handlers.ListApplicationAccess)
		r.Put("/application-access/{appName}", handlers.UpdateApplicationAccess)

		// Organizations
		r.Get("/organizations", handlers.ListOrganizations)
		r.Post("/organizations", handlers.CreateOrganization)
		r.Get("/organizations/{id}", handlers.GetOrganization)

		// Users
		r.Get("/users", handlers.ListUsers)
		r.Post("/users", handlers.CreateUser)
		r.Get("/users/{id}", handlers.GetUser)

		// Health
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"status":"ok"}`))
		})
	})

	return r
}
