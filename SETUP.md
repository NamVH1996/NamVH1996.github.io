# All-in-One Grafana Plugin - Setup Guide

## 📋 Architecture

```
┌─────────────────────────────────────────┐
│  Grafana (Port 3000)                    │
│  ├─ All-in-One Plugin Frontend (React)  │
│  └─ Load from ./dist folder             │
└─────────────────────────────────────────┘
         ↓ HTTP REST API (localhost:8080)
┌─────────────────────────────────────────┐
│  Backend Plugin (Port 8080) - Golang    │
│  REST API for Alert Management          │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for building frontend)

### Option 1: Full Docker Setup (Easiest)

```bash
# 1. Build frontend
npm install --legacy-peer-deps
npm run build

# 2. Run with Docker Compose
docker-compose up -d
```

Access Grafana at: **http://localhost:3000**
- Default credentials: `admin / admin`

Backend runs on: `http://localhost:8080` (automatically)

### Option 2: Manual Local Setup (For Development)

#### Step 1: Build Frontend

```bash
npm install --legacy-peer-deps
npm run build
```

#### Step 2: Start Backend

```bash
go build -o plugin ./pkg
./plugin
```

Backend will run on: `http://localhost:8080`

#### Step 3: Install Plugin in Grafana

**For Docker Grafana:**
```bash
# Copy plugin folder to Grafana plugins
docker cp dist grafana:/var/lib/grafana/plugins/all-in-one-app

# Restart Grafana
docker restart grafana
```

**For Local Grafana:**
```bash
# Copy to local Grafana plugins folder
cp -r dist /var/lib/grafana/plugins/all-in-one-app

# Restart Grafana
sudo systemctl restart grafana-server
```

#### Step 4: Enable Plugin

1. Open Grafana: http://localhost:3000
2. Go to: **Administration → Plugins**
3. Search for "All-in-One"
4. Click **Enable**
5. Go to plugin: **Administration → All-in-One Monitoring App**

#### Step 5: Configure Backend URL

In plugin **Settings** tab, set:
```
API Backend URL: http://localhost:8080
```

## 📁 Project Structure

```
.
├── src/                          # Frontend (React/TypeScript)
│   ├── pages/                    # UI Pages
│   │   ├── AppPage.tsx           # Dashboard home
│   │   ├── AlertsManagementPage.tsx
│   │   ├── ContactPointsPage.tsx
│   │   ├── DataEnrichmentPage.tsx
│   │   └── ...
│   ├── api/                      # API clients
│   │   ├── client.ts             # HTTP client
│   │   └── swagger.ts            # API services
│   ├── module.ts                 # Plugin entry
│   └── plugin.json               # Plugin manifest
│
├── pkg/                          # Backend (Go)
│   ├── main.go                   # Entry point
│   ├── api/                      # HTTP handlers
│   ├── models/                   # Data models
│   ├── storage/                  # Data storage (in-memory)
│   └── alertmanager/             # AlertManager client
│
├── dist/                         # Built plugin (after npm run build)
│
├── package.json                  # Frontend dependencies
├── go.mod / go.sum               # Go dependencies
├── webpack.config.js             # Frontend bundler
├── tsconfig.json                 # TypeScript config
├── Dockerfile                    # Backend Docker image
├── docker-compose.yml            # Multi-container setup
└── README.md                     # Project overview
```

## 🛠️ Development Workflow

### Development Mode (Auto-rebuild)

```bash
# Terminal 1: Frontend watch mode
npm run dev

# Terminal 2: Backend dev with hot reload
go run ./pkg

# Terminal 3: Grafana (Docker or local)
docker-compose up grafana
```

### Building for Production

```bash
# Frontend
npm run build

# Backend (optional - Docker builds it)
go build -o plugin ./pkg

# Start with Docker
docker-compose up -d
```

## 🔌 API Endpoints

Backend provides REST API at `http://localhost:8080`:

```
GET  /api/health               # Health check
GET  /api/alerts               # List alerts
POST /api/alerts               # Create alert
GET  /api/contact-points       # List contact points
POST /api/contact-points       # Create contact point
GET  /api/vm-mappings          # VM mappings
POST /api/escalation-mappings  # Escalation rules
...
```

See [BACKEND.md](./BACKEND.md) for complete API documentation.

## 📦 Dependencies

### Frontend
- React 18.3.1
- TypeScript 5.6.2
- Grafana UI 11.0.0
- Webpack 5.95.0

### Backend
- Go 1.21
- gorilla/mux (HTTP router)
- google/uuid (ID generation)
- sirupsen/logrus (logging)

### Runtime
- Grafana 11.0.0
- Docker 20.10+ (for Docker setup)
- Node.js 18+ (for building)

## 🐛 Troubleshooting

### Plugin not showing in Grafana

1. Check if `dist/` folder exists:
   ```bash
   ls -la dist/
   ```

2. Rebuild plugin:
   ```bash
   npm run build
   ```

3. Copy to Grafana:
   ```bash
   docker cp dist grafana:/var/lib/grafana/plugins/all-in-one-app
   docker restart grafana
   ```

4. Check Grafana logs:
   ```bash
   docker logs grafana
   ```

### Backend connection fails

1. Check if backend is running:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Check plugin Settings - API URL must be correct

3. If using Docker, ensure both services are on same network:
   ```bash
   docker network ls
   docker inspect app-network
   ```

### Build errors

1. Clean and rebuild:
   ```bash
   rm -rf node_modules dist
   npm install --legacy-peer-deps
   npm run build
   ```

2. Check Node version:
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

## 📚 Additional Resources

- [Grafana Plugin Docs](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Backend API Reference](./BACKEND.md)
- [Grafana Docker Image](https://hub.docker.com/r/grafana/grafana)

## ✅ Verification Checklist

- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend compiles: `go build ./pkg`
- [ ] Docker images build: `docker-compose build`
- [ ] Grafana starts: `docker-compose up`
- [ ] Plugin loads in Grafana UI
- [ ] API responds: `curl http://localhost:8080/api/health`
- [ ] Plugin pages load without errors

## 🚀 Next Steps

1. **Enable the plugin** in Grafana
2. **Configure API backend URL** in plugin settings
3. **Test the features** in each tab
4. **Integrate with your APIs** - see BACKEND.md for details
