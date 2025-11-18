# Grafana All-in-One Plugin - Architecture Guide

## Current Architecture ✅

This is now a **unified Grafana app plugin** where the backend is bundled with the frontend into a single plugin package.

```
┌─────────────────────────────────────────────────────────┐
│                   Grafana Server (3000)                 │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Plugin Bundle (/var/lib/grafana/plugins/)      │  │
│  │   all-in-one-app/                                 │  │
│  │   ├── module.js (Frontend)                        │  │
│  │   ├── plugin.json (Manifest)                      │  │
│  │   ├── img/ (Assets)                               │  │
│  │   └── grafana-all-in-one-plugin-app (Binary)      │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────┐             │  │
│  │  │ Frontend (React)                 │             │  │
│  │  │                                  │             │  │
│  │  │ API Call:                        │             │  │
│  │  │ /api/plugins/all-in-one-app/    │             │  │
│  │  │ resources/alerts                 │             │  │
│  │  └──────────────┬───────────────────┘             │  │
│  │                │ (Proxied by Grafana)             │  │
│  │  ┌─────────────▼────────────────────┐             │  │
│  │  │ Backend Process                  │             │  │
│  │  │ (Subprocess managed by Grafana)  │             │  │
│  │  │                                  │             │  │
│  │  │ Listens on bridge port           │             │  │
│  │  │ (Secured by Grafana)             │             │  │
│  │  │                                  │             │  │
│  │  │ Endpoints:                       │             │  │
│  │  │ - /alerts                        │             │  │
│  │  │ - /api/contact-points           │             │  │
│  │  │ - /api/vm-mappings              │             │  │
│  │  └──────────────┬───────────────────┘             │  │
│  │                │                                  │  │
│  └────────────────┼──────────────────────────────────┘  │
│                   │                                     │
└───────────────────┼─────────────────────────────────────┘
                    │
        ┌───────────┴──────────────┐
        │                          │
   ┌────▼────┐            ┌───────▼─────┐
   │AlertMgr │            │ External    │
   │(9093)   │            │Services     │
   └─────────┘            └─────────────┘
```

## Key Changes from Previous Architecture

| Aspect | Before | Now |
|--------|--------|-----|
| Backend | Separate service (docker-compose) | Part of plugin bundle |
| Communication | Direct HTTP to localhost:8080 | Grafana-proxied requests |
| Frontend URL | http://localhost:8080 | /api/plugins/all-in-one-app/resources |
| Lifecycle | Manual start/stop | Grafana manages |
| Deployment | docker-compose with 2 services | Single plugin bundle |
| Security | Direct network exposure | Grafana handles auth/proxy |

## Plugin Structure

```
dist/                                          ← Plugin directory (mounted to Grafana)
├── module.js                                 ← Compiled frontend (React)
├── module.js.map                             ← Source map
├── plugin.json                               ← Plugin manifest
├── img/                                      ← Logo and images
│   └── plugin.svg
└── grafana-all-in-one-plugin-app            ← Backend binary (executable)
```

### plugin.json Configuration

```json
{
  "type": "app",                              // App plugin type
  "id": "all-in-one-app",                     // Unique identifier
  "backend": true,                            // Declares backend presence
  "executable": "grafana-all-in-one-plugin-app",  // Binary name
  "routes": [...],                            // Frontend routes
  "navigation": {...}                         // Sidebar menu
}
```

**Critical Fields:**
- `"backend": true` - Tells Grafana to look for and run a backend binary
- `"executable": "grafana-all-in-one-plugin-app"` - Binary name Grafana will execute
- Binary must be in the same directory as plugin.json (dist/)

## How Grafana Loads the Plugin

1. **Detection** - Grafana scans `/var/lib/grafana/plugins/` directories
2. **Manifest** - Reads `plugin.json` and sees `"backend": true`
3. **Binary Discovery** - Looks for executable matching `"executable"` field
4. **Startup** - Launches binary as a subprocess when plugin loads
5. **Proxying** - Routes `/api/plugins/<plugin-id>/resources/*` requests to backend
6. **Security** - Grafana manages auth and communication channel

## Frontend → Backend Communication

### Request Flow

```
Frontend (React Component)
    ↓
fetch('/api/plugins/all-in-one-app/resources/alerts')
    ↓
Grafana Plugin Bridge (Middleware)
    ↓
Backend Process (HTTP Server)
    ↓
Response
```

### API Client Configuration

The frontend API client automatically detects the environment:

```typescript
// In Grafana plugin environment:
baseURL = '/api/plugins/all-in-one-app/resources'

// In development (Node.js):
baseURL = 'http://localhost:8080'
```

### Example API Call

```typescript
// Frontend code
const alerts = await fetch('/api/plugins/all-in-one-app/resources/alerts');

// Grafana translates this to:
// Calls the backend subprocess listening on the bridge port
// Backend handles: router.HandleFunc("/alerts", handler)
```

## Build Process

### Complete Plugin Build

```bash
npm run plugin:build
```

This executes:
1. `npm run build` - Webpack compiles TypeScript/React → module.js
2. `npm run copy:plugin` - Copies plugin.json and assets to dist/
3. `make build` - Go builds backend binary → dist/grafana-all-in-one-plugin-app

### Result

```
dist/
├── module.js                                 ✓ Frontend
├── plugin.json                               ✓ Manifest
├── img/                                      ✓ Assets
└── grafana-all-in-one-plugin-app            ✓ Backend binary
```

Ready to deploy to Grafana!

## Deployment

### Development

```bash
# 1. Build plugin bundle
npm run plugin:build

# 2. Start Grafana with plugin mounted
docker-compose up -d

# 3. Access Grafana
# Open http://localhost:3000 (admin/admin)
# Go to Configuration → Plugins → All-in-One
# Plugin should be listed and activated
```

### Production

```bash
# 1. Build complete plugin
npm run plugin:build

# 2. Copy to Grafana plugins directory
cp -r dist /path/to/grafana/plugins/all-in-one-app

# 3. Restart Grafana
systemctl restart grafana-server
# or
docker restart grafana
```

## Local Development with Separate Backend

For easier debugging, you can run the backend separately:

```bash
# Terminal 1: Run backend directly
make dev

# Terminal 2: Frontend watcher
npm run dev

# Terminal 3: Grafana with plugin
docker-compose up

# Frontend will still use Grafana's plugin bridge:
# /api/plugins/all-in-one-app/resources/...
# Which Grafana redirects to your running backend
```

## Environment Variables

### Backend Configuration

When Grafana runs the backend as a subprocess, it can pass environment variables:

```bash
ALERTMANAGER_URL=http://localhost:9093   # AlertManager service
PORT=<auto-assigned>                     # Grafana manages port
HOST=127.0.0.1                           # Grafana manages host
LOG_LEVEL=info                           # Logging level
```

Grafana doesn't directly expose these as command-line args, but you can:
1. Set them in Grafana's `grafana.ini`
2. Use plugin configuration page (if implemented)
3. Set system environment variables

## Advantages of Unified Plugin

✅ **Single Package** - Everything in one directory
✅ **Automatic Lifecycle** - Grafana manages backend process
✅ **Security** - Grafana handles auth and proxying
✅ **Easier Deployment** - Copy one directory to Grafana
✅ **Version Control** - Frontend and backend versions match
✅ **Simplified Architecture** - No separate services to manage
✅ **Dynamic Configuration** - Grafana can reload plugin

## Backend API Endpoints

All endpoints are accessible through the plugin bridge:

```
/api/plugins/all-in-one-app/resources/alerts
/api/plugins/all-in-one-app/resources/alerts/{id}
/api/plugins/all-in-one-app/resources/alerts/stats
/api/plugins/all-in-one-app/resources/api/contact-points
/api/plugins/all-in-one-app/resources/api/vm-mappings
/api/plugins/all-in-one-app/resources/api/escalation-mappings
```

The backend receives these as:
```
/alerts
/alerts/{id}
/alerts/stats
/api/contact-points
/api/vm-mappings
/api/escalation-mappings
```

Grafana automatically strips the `/api/plugins/all-in-one-app/resources` prefix.

## Troubleshooting

### Backend not starting
1. Check Grafana logs: `docker-compose logs grafana`
2. Verify binary is executable: `ls -l dist/grafana-all-in-one-plugin-app`
3. Check plugin.json has correct executable name

### Frontend can't reach backend
1. Verify frontend uses `/api/plugins/all-in-one-app/resources` prefix
2. Check Grafana debug logs: `GF_LOG_LEVEL=debug`
3. Verify AlertManager is reachable from backend

### Plugin not appearing
1. Ensure dist/ is mounted: `docker-compose.yml`
2. Check plugin.json exists: `ls dist/plugin.json`
3. Restart Grafana: `docker-compose restart grafana`

## References

- [Grafana App Plugin Documentation](https://grafana.com/developers/plugin-tools/)
- [Backend Plugin Guide](https://grafana.com/developers/plugin-tools/tutorials/build-a-data-source-plugin)
- [Plugin API Bridge Documentation](https://grafana.com/docs/grafana/latest/plugins/developing/plugin-backend/)
