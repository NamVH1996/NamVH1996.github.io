# All-in-One Grafana Monitoring Plugin

> **Unified monitoring dashboard** - Consolidate all your services, metrics, and alerts into a single Grafana plugin with Golang backend

## 🎯 What This Project Does

This is a complete **Grafana App Plugin** with two-tier architecture:

### Frontend (React/TypeScript)
- **Unified Dashboard** - Monitor all services in one place
- **Real-time Alert Display** - See alerts with filtering
- **Statistics & Insights** - Alert summaries and grouping
- **Customizable Dashboards** - Create multiple dashboard views
- **Settings Panel** - Configure API endpoints

### Backend (Go)
- **Alert Management API** - REST endpoints for alert operations
- **AlertManager Integration** - Connect to Prometheus AlertManager
- **Data Filtering & Aggregation** - Server-side filtering and statistics
- **CORS Support** - Seamless integration with Grafana frontend
- **Production Ready** - Error handling, logging, health checks

## ✨ Why Use This Instead of Multiple Systems?

Instead of managing multiple monitoring tools (Prometheus, Datadog, New Relic, etc.), this plugin provides an **all-in-one solution** directly in Grafana, eliminating context switching and system complexity.

## 🚀 Quick Start

### 1. Setup & Run Backend (Go)

```bash
# Build the plugin backend
make build

# Or run with hot reload in development
make dev

# Or use Docker Compose (starts AlertManager + Backend)
docker-compose up -d
```

Backend will run on `http://localhost:8080`

### 2. Setup Frontend (React)

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Copy to Grafana plugins directory
cp -r dist /var/lib/grafana/plugins/all-in-one-app

# Restart Grafana
sudo systemctl restart grafana-server
```

### 3. Configure Settings in Grafana

1. Open Grafana and navigate to the plugin
2. Go to Settings tab
3. Set API Backend URL to `http://localhost:8080`
4. Save configuration

For detailed instructions, see [SETUP.md](./SETUP.md) and [BACKEND.md](./BACKEND.md)

## 📋 Project Structure (Grafana Template)

```
.
├── src/                           # Frontend (React/TypeScript)
│   ├── api/                       # API client for backend
│   ├── pages/                     # Dashboard pages
│   ├── components/                # UI components
│   ├── module.ts                  # Plugin entry
│   └── plugin.json                # Plugin manifest
│
├── pkg/                           # Backend (Go) - Integrated at root
│   ├── main.go                    # Application entry point
│   ├── api/                       # HTTP handlers
│   │   ├── handlers.go
│   │   └── middleware.go
│   ├── models/                    # Data models
│   │   └── alert.go
│   ├── alertmanager/              # AlertManager client
│   │   └── client.go
│   └── config/                    # Configuration
│       └── config.go
│
├── go.mod / go.sum                # Go dependencies
├── Makefile                       # Build commands
├── Dockerfile                     # Container image
├── docker-compose.yml             # Development environment
├── alertmanager.yml               # AlertManager config
│
├── package.json                   # Frontend dependencies
├── tsconfig.json                  # TypeScript config
├── webpack.config.js              # Frontend build config
├── SETUP.md                       # Frontend setup guide
├── BACKEND.md                     # Backend setup guide
└── README.md                      # This file
```

## 🔗 Architecture

```
Grafana UI (React)
    ↓ HTTP REST API
Backend Server (Go)
    ↓ AlertManager API
AlertManager (Separate Service)
```

See [BACKEND.md](./BACKEND.md) for detailed architecture documentation.

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Frontend setup and deployment guide
- **[BACKEND.md](./BACKEND.md)** - Backend setup, API endpoints, and architecture

## 🔌 API Endpoints

Backend provides REST API for alert management:

```
GET  /api/alerts                    # List alerts with filtering
GET  /api/alerts/stats              # Alert statistics
GET  /api/alerts/groups             # Group alerts by label
POST /api/alerts/{id}/acknowledge   # Acknowledge alert
GET  /api/health                    # Health status
GET  /api/ping                      # Ping check
```

See [BACKEND.md](./BACKEND.md#api-endpoints) for detailed endpoint documentation.

## 🔐 Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 8080)
- `ALERTMANAGER_URL` - AlertManager API URL (default: http://localhost:9093)
- `GRAFANA_URL` - Grafana instance URL (default: http://localhost:3000)
- `LOG_LEVEL` - Logging level (default: info)

**Frontend:**
- Configure API endpoint in plugin settings page

## 📦 Ready for Swagger Integration

When you're ready to integrate your APIs from Swagger:

1. **Backend:** Add new service clients in `pkg/` directory
2. **Add Handlers:** Implement HTTP handlers for new endpoints in `pkg/api/handlers.go`
3. **Frontend:** Update API service calls in `src/api/services.ts`
4. **Configuration:** Add new API endpoints in settings

See [BACKEND.md](./BACKEND.md) for detailed integration steps.

## 🛠️ Development

### Frontend Development
```bash
npm run dev        # Watch and rebuild
npm run build      # Production build
npm run lint       # Check code style
npm run format     # Format code
```

### Backend Development
```bash
make dev           # Hot reload development
make build         # Build binary
make test          # Run tests
make lint          # Lint code
make fmt           # Format code
```

## 🐳 Docker Deployment

Quick start with Docker Compose:

```bash
docker-compose up -d
```

This starts:
- **AlertManager** on port 9093 (for alert management)
- **Plugin Backend** on port 8080 (REST API server)

## 🚨 Troubleshooting

See [BACKEND.md](./BACKEND.md#troubleshooting) for common issues and solutions.

## 📝 Development Workflow

1. **Backend First** - Start the backend: `make dev`
2. **Frontend Next** - Build frontend: `npm run build`
3. **Install in Grafana** - Copy `dist/` to plugins directory
4. **Configure** - Set API endpoint in plugin settings
5. **Test** - Access plugin through Grafana UI

## 🎓 Learning Resources

- [Grafana Plugin Development](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Prometheus AlertManager](https://prometheus.io/docs/alerting/latest/overview/)
- [Go Web Development](https://golang.org/doc/effective_go)

## 📄 License

Apache 2.0

---

**Status:** ✅ Ready for feature development!

Next step: Provide Swagger API definitions for additional integration.