package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	FrontendURL string
	JWTSecret   string

	// Upstream app URLs
	DataConnectionURL  string
	PipelineBuilderURL string
	OntologyURL        string
	PrismURL           string
	LatticeURL         string
	AIPlatformURL      string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		Port:               getEnv("API_PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://platform:platform@localhost:5432/platform?sslmode=disable"),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:3000"),
		JWTSecret:          getEnv("JWT_SECRET", "dev-secret"),
		DataConnectionURL:  getEnv("DATA_CONNECTION_URL", "http://localhost:4001"),
		PipelineBuilderURL: getEnv("PIPELINE_BUILDER_URL", "http://localhost:4002"),
		OntologyURL:        getEnv("ONTOLOGY_URL", "http://localhost:4003"),
		PrismURL:           getEnv("PRISM_URL", "http://localhost:4004"),
		LatticeURL:         getEnv("LATTICE_URL", "http://localhost:4005"),
		AIPlatformURL:      getEnv("AI_PLATFORM_URL", "http://localhost:4006"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
