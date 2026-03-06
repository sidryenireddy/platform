# Platform — platform.rebelinc.ai

Unified platform combining Builder Mode (like Palantir Foundry) and Workspace Mode (like Palantir Carbon).

## Architecture

- **`/api`** — Go backend (REST API, PostgreSQL)
- **`/frontend`** — Next.js + TypeScript frontend (Builder Mode & Workspace Mode)

## Tech Stack

- **Backend:** Go, PostgreSQL, Chi router
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Design System:** Shared across both modes

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd api
cp .env.example .env
go mod download
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Modes

### Builder Mode
Full platform interface with collapsible sidebar, tabbed applications, global search (Cmd+K), notification center, favorites, and file browser.

### Workspace Mode
Operational interface with admin-configurable workspaces, role-scoped views, navigation framework with object passing between modules, and embedded AIP Assist.
