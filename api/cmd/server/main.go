package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/sidryenireddy/platform/api/internal/config"
	"github.com/sidryenireddy/platform/api/internal/routes"
)

func main() {
	cfg := config.Load()
	r := routes.Setup(cfg)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Platform API starting on %s", addr)
	log.Printf("Frontend URL: %s", cfg.FrontendURL)
	log.Printf("Upstream apps: DataConnection=%s PipelineBuilder=%s Ontology=%s Prism=%s Lattice=%s AIPlatform=%s",
		cfg.DataConnectionURL, cfg.PipelineBuilderURL, cfg.OntologyURL, cfg.PrismURL, cfg.LatticeURL, cfg.AIPlatformURL)

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
