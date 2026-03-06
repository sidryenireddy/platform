PG_BIN := /opt/homebrew/Cellar/postgresql@16/16.11_1/bin
PSQL := $(PG_BIN)/psql

.PHONY: dev dev-api dev-frontend db-setup db-migrate db-reset build test-api

# Start all services (Postgres must already be running via brew services)
dev: db-setup
	@echo "Starting API on :8080 and Frontend on :3000..."
	@$(MAKE) dev-api & $(MAKE) dev-frontend & wait

dev-api:
	cd api && go run cmd/server/main.go

dev-frontend:
	cd frontend && npm run dev

# Database
db-setup:
	@$(PSQL) -U sidharthyenireddy -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='platform'" | grep -q 1 || \
		$(PSQL) -U sidharthyenireddy -d postgres -c "CREATE ROLE platform WITH LOGIN PASSWORD 'platform' CREATEDB;"
	@$(PSQL) -U sidharthyenireddy -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='platform'" | grep -q 1 || \
		$(PSQL) -U sidharthyenireddy -d postgres -c "CREATE DATABASE platform OWNER platform;"
	@$(MAKE) db-migrate

db-migrate:
	$(PSQL) -U platform -d platform -f api/migrations/001_init.sql

db-reset:
	$(PSQL) -U sidharthyenireddy -d postgres -c "DROP DATABASE IF EXISTS platform;"
	$(PSQL) -U sidharthyenireddy -d postgres -c "CREATE DATABASE platform OWNER platform;"
	@$(MAKE) db-migrate

# Build
build:
	cd api && go build -o bin/server cmd/server/main.go
	cd frontend && npm run build
