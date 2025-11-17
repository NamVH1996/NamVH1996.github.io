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

### 1. Setup Backend (Go)

```bash
cd backend

# Build the plugin backend
make build

# Or run with hot reload in development
make dev

# Or use Docker
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

For detailed instructions, see [SETUP.md](./SETUP.md) and [backend/README.md](./backend/README.md)

## 📋 Project Structure

```
.
├── src/                      # Frontend (React/TypeScript)
│   ├── api/                  # API client for backend
│   ├── pages/                # Dashboard pages
│   ├── components/           # UI components
│   └── plugin.json           # Plugin manifest
│
├── backend/                  # Backend (Go)
│   ├── cmd/                  # Application entry point
│   ├── pkg/
│   │   ├── api/              # HTTP handlers
│   │   ├── models/           # Data models
│   │   ├── alertmanager/     # AlertManager client
│   │   └── config/           # Configuration
│   ├── Makefile              # Build commands
│   ├── Dockerfile            # Container image
│   └── docker-compose.yml    # Development environment
│
├── package.json              # Frontend dependencies
├── tsconfig.json             # TypeScript config
├── webpack.config.js         # Frontend build config
└── README.md                 # This file
```

## 🔗 Architecture

```
Grafana UI (React)
    ↓ HTTP REST API
Backend Server (Go)
    ↓ AlertManager API
AlertManager
    ↓
Prometheus
```

See [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md) for detailed architecture documentation.

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Frontend setup and deployment guide
- **[backend/README.md](./backend/README.md)** - Backend setup, API endpoints, and development
- **[backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)** - System architecture and data flow

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

See [backend/README.md](./backend/README.md#api-endpoints) for detailed endpoint documentation.

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

1. **Backend:** Add new service clients in `backend/pkg/`
2. **Add Handlers:** Implement HTTP handlers for new endpoints
3. **Frontend:** Update API service calls in `src/api/services.ts`
4. **Configuration:** Add new API endpoints in settings

See respective README files for detailed integration steps.

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
cd backend
make dev           # Hot reload development
make build         # Build binary
make test          # Run tests
make lint          # Lint code
make fmt           # Format code
```

## 🐳 Docker Deployment

Quick start with Docker Compose:

```bash
cd backend
docker-compose up -d
```

This starts:
- AlertManager on port 9093
- Plugin Backend on port 8080
- Prometheus on port 9090

## 🚨 Troubleshooting

See [backend/README.md](./backend/README.md#troubleshooting) for common issues and solutions.

## 📝 Development Workflow

1. **Backend First** - Start the backend: `cd backend && make dev`
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