# Grafana App Plugin Setup Guide

This guide explains the proper setup and structure for the All-in-One Grafana App Plugin according to official Grafana standards.

## Plugin Structure

```
all-in-one-app/
├── dist/                          # Compiled frontend (served by Grafana)
│   ├── module.js                  # Main plugin bundle (webpack output)
│   ├── plugin.json               # Plugin manifest (required)
│   └── img/                       # Plugin logo and images
│
├── bin/                           # Compiled backend binary
│   └── grafana-all-in-one-plugin-app   # Backend executable
│
├── src/                           # Frontend source
│   ├── module.ts                  # Entry point (creates AppPlugin)
│   ├── plugin.json               # Plugin manifest source
│   ├── pages/                     # React page components
│   │   ├── AppPage.tsx
│   │   ├── AlertsManagementPage.tsx
│   │   ├── ContactPointsPage.tsx
│   │   ├── DataEnrichmentPage.tsx
│   │   ├── DashboardsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── api/                       # Frontend API client
│   │   └── swagger.ts
│   └── img/                       # Source images
│
└── pkg/                           # Backend Go source
    ├── main.go
    ├── api/
    ├── config/
    ├── storage/
    ├── models/
    └── alertmanager/
```

## Key Files

### 1. plugin.json (Frontend Plugin Manifest)
Located in `src/plugin.json` and copied to `dist/plugin.json` during build.

**Required Fields:**
- `type`: "app" (specifies this is an app plugin)
- `id`: "all-in-one-app" (unique plugin identifier)
- `backend`: true (indicates plugin has a backend)
- `executable`: "grafana-all-in-one-plugin-app" (backend binary name)
- `routes`: Navigation paths and page components
- `navigation`: Left sidebar menu configuration

```json
{
  "type": "app",
  "id": "all-in-one-app",
  "backend": true,
  "executable": "grafana-all-in-one-plugin-app",
  "routes": [...]
}
```

### 2. Backend Binary
Built from `pkg/main.go` and placed in `bin/grafana-all-in-one-plugin-app`.

**Responsibilities:**
- REST API for frontend to consume
- Proxy to AlertManager service
- Data enrichment and caching
- Contact point management
- Data extraction rules

**Environment Variables:**
```
ALERTMANAGER_URL=http://localhost:9093  # AlertManager service URL
PORT=8080                               # Backend API port
HOST=0.0.0.0                            # Listen address
LOG_LEVEL=info                          # Logging level
```

### 3. Frontend Module
Entry point: `src/module.ts`

Creates an AppPlugin instance that:
- Registers page components
- Handles routing
- Manages plugin lifecycle

```typescript
import { AppPlugin } from '@grafana/data';
export const plugin = new AppPlugin<{}>();
```

## Build Process

### Frontend Build
```bash
npm run build
```

**What happens:**
1. Webpack compiles TypeScript/React to `dist/module.js`
2. `npm run copy:plugin` copies `src/plugin.json` → `dist/plugin.json`
3. Images are copied to `dist/img/`

**Result:** Complete frontend plugin ready for Grafana

### Backend Build
```bash
make build
```

**What happens:**
1. Go compiles `pkg/main.go` to binary
2. Binary is placed at `bin/grafana-all-in-one-plugin-app`
3. Binary is statically linked (no external dependencies)

**Result:** Executable backend for the plugin

## Installation & Running

### Local Development

**Terminal 1 - Backend:**
```bash
make run
# Or with hot-reload:
make dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev    # Watch and rebuild
```

**Terminal 3 - Grafana (Docker):**
```bash
docker-compose up -d
```

Access: `http://localhost:3000` (admin/admin)

### Docker Production Build

```bash
# Build everything
make docker-build

# Run
docker-compose up
```

**What docker-compose.yml does:**
1. **Grafana service:**
   - Mounts `./dist` → `/var/lib/grafana/plugins/all-in-one-app`
   - Grafana loads the plugin from dist/
   - Sets `GF_PLUGINS_ALLOW_UNSIGNED_PLUGINS=all-in-one-app` to enable dev plugin

2. **Backend service:**
   - Builds Docker image from Dockerfile
   - Runs binary as separate service
   - Listens on port 8080
   - Grafana calls this for backend operations

## Architecture Flow

```
User Browser
      ↓
   Grafana (port 3000)
   /var/lib/grafana/plugins/all-in-one-app/
      ├── module.js (frontend)
      └── plugin.json (manifest)
      ↓
   Backend API (port 8080)
      ├── /alerts
      ├── /api/contact-points
      ├── /api/vm-mappings
      └── /api/escalation-mappings
      ↓
   External Services
      ├── AlertManager (port 9093)
      └── Other monitoring systems
```

## Configuration

### Grafana Configuration
Edit `docker-compose.yml` environment variables:

```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=admin
  - GF_PLUGINS_ALLOW_UNSIGNED_PLUGINS=all-in-one-app
  - GF_LOG_LEVEL=debug
```

### Backend Configuration
Environment variables:

```bash
# AlertManager URL
export ALERTMANAGER_URL=http://localhost:9093

# Backend API
export PORT=8080
export HOST=0.0.0.0

# Logging
export LOG_LEVEL=debug
```

## Development Workflow

### 1. Modify Frontend
```bash
# Edit TypeScript/React in src/
npm run dev  # Watch mode
```
Webpack will auto-rebuild and Grafana will reload.

### 2. Modify Backend
```bash
# Edit Go code in pkg/
make dev  # Watch mode with air
```
Backend will auto-rebuild on file changes.

### 3. Build for Distribution
```bash
npm run build   # Frontend
make build      # Backend
make docker-build  # Docker image
```

## Important Notes

### Plugin Loading in Grafana
1. Grafana scans `/var/lib/grafana/plugins/` directory
2. Looks for `plugin.json` file
3. Loads `module.js` as AMD module
4. Initializes the AppPlugin

### Unsigned Plugin Warning
During development, Grafana will show warning about unsigned plugins. This is normal for dev builds. Use:
```
GF_PLUGINS_ALLOW_UNSIGNED_PLUGINS=all-in-one-app
```

### Backend Communication
Frontend calls backend API at:
```
http://backend:8080  (in Docker)
http://localhost:8080 (in local dev)
```

The API client should be configured to use the correct backend URL.

## Troubleshooting

### Plugin not appearing in Grafana
1. Check `dist/plugin.json` exists
2. Check `dist/module.js` exists
3. Restart Grafana: `docker-compose restart grafana`
4. Check Grafana logs: `docker-compose logs grafana`

### Backend connection issues
1. Verify backend is running: `curl http://localhost:8080/api/ping`
2. Check `ALERTMANAGER_URL` is correct
3. Check firewall/network policies

### Build errors
- Frontend: `npm install` and check Node version (18.0.0+)
- Backend: `go mod tidy` and check Go version (1.21+)

## References

- [Grafana App Plugin Docs](https://grafana.com/developers/plugin-tools/)
- [Plugin.json Schema](https://github.com/grafana/grafana/blob/main/public/app/plugins/apps/plugin.schema.json)
- [Grafana SDK Documentation](https://grafana.com/developers/plugin-tools/tutorials/build-an-app-plugin)
