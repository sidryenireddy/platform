package handlers

import (
	"net/http"
	"strings"

	"github.com/sidryenireddy/platform/api/internal/models"
)

// Mock search data — replace with ontology-aware search against PostgreSQL
var searchIndex = []models.SearchResult{
	{Type: "object", ID: "obj-1", Title: "Acme Corp", Subtitle: "Customer", ObjectType: "Customer"},
	{Type: "object", ID: "obj-2", Title: "Jane Smith", Subtitle: "Contact", ObjectType: "Contact"},
	{Type: "dataset", ID: "ds-1", Title: "Customer Master", Subtitle: "45,230 rows"},
	{Type: "pipeline", ID: "pipe-1", Title: "Customer Enrichment ETL", Subtitle: "Runs daily at 2am"},
	{Type: "analysis", ID: "an-1", Title: "Revenue by Region", Subtitle: "Prism analysis"},
	{Type: "app", ID: "app-1", Title: "Customer 360 Dashboard", Subtitle: "Lattice application"},
	{Type: "agent", ID: "agent-1", Title: "Support Triage Agent", Subtitle: "AI Platform agent"},
}

func GlobalSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.ToLower(r.URL.Query().Get("q"))
	if query == "" {
		writeJSON(w, http.StatusOK, searchIndex)
		return
	}

	results := make([]models.SearchResult, 0)
	for _, item := range searchIndex {
		if strings.Contains(strings.ToLower(item.Title), query) ||
			strings.Contains(strings.ToLower(item.Subtitle), query) ||
			strings.Contains(strings.ToLower(item.ObjectType), query) {
			results = append(results, item)
		}
	}

	// Group by type
	grouped := map[string][]models.SearchResult{}
	for _, r := range results {
		grouped[r.Type] = append(grouped[r.Type], r)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"results": results,
		"grouped": grouped,
		"total":   len(results),
	})
}
