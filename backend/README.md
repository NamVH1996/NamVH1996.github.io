# Grafana Alert Plugin - Backend (Go)

This is the backend server for the Grafana All-in-One Alert Plugin. It provides REST APIs to fetch, filter, and manage alerts from AlertManager.

## Architecture

```
Grafana UI (React) ← HTTP ← Plugin Backend (Go) ← AlertManager API
                                ↓
                          Prometheus/Metrics
```

## Features

- ✅ **Alert Listing** - Fetch alerts from AlertManager with filtering
- ✅ **Alert Filtering** - Filter by status, severity, group, search term
- ✅ **Alert Statistics** - Get alert counts and statistics
- ✅ **Alert Grouping** - Group alerts by labels
- ✅ **Health Checks** - Monitor AlertManager connectivity
- ✅ **CORS Support** - Works seamlessly with Grafana frontend
- ✅ **Logging** - Structured JSON logging for debugging

## Quick Start

### Prerequisites

- Go 1.21+
- Docker & Docker Compose (optional)
- AlertManager running (or use docker-compose)

### Build

```bash
# Build the binary
make build

# Or with development mode (hot reload)
make dev
```

### Run

```bash
# Using environment variables
export ALERTMANAGER_URL=http://localhost:9093
export GRAFANA_URL=http://localhost:3000
./bin/grafana-alert-plugin

# Or with make
make run
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f plugin-backend

# Stop services
docker-compose down
```

## API Endpoints

### List Alerts

```
GET /api/alerts?status=firing&severity=critical&limit=50&offset=0
```

Query Parameters:
- `status`: "firing", "resolved", "all" (default: "all")
- `severity`: "critical", "warning", "info"
- `group`: filter by group label
- `search`: search in summary/description
- `limit`: max results (default: 100)
- `offset`: pagination offset (default: 0)

Response:
```json
{
  "total": 5,
  "count": 5,
  "alerts": [
    {
      "id": "fingerprint123",
      "status": "firing",
      "severity": "critical",
      "group": "api",
      "summary": "High error rate detected",
      "description": "Error rate exceeded 5%",
      "labels": {
        "service": "api-gateway",
        "severity": "critical"
      },
      "startsAt": "2024-01-17T10:30:00Z",
      "updatedAt": "2024-01-17T10:35:00Z"
    }
  ]
}
```

### Get Alert Statistics

```
GET /api/alerts/stats
```

Response:
```json
{
  "total": 12,
  "firing": 5,
  "resolved": 7,
  "critical": 3,
  "warning": 4,
  "info": 5
}
```

### Get Alerts by Group

```
GET /api/alerts/groups?groupBy=service
```

Response:
```json
{
  "groups": {
    "api-gateway": [...],
    "database": [...],
    "cache": [...]
  },
  "total": 12
}
```

### Acknowledge Alert

```
POST /api/alerts/{id}/acknowledge
Content-Type: application/json

{
  "message": "Acknowledged by user"
}
```

### Health Check

```
GET /api/health
```

Response:
```json
{
  "alertManagerUrl": "http://localhost:9093",
  "status": "healthy",
  "message": "AlertManager is healthy",
  "lastCheck": "2024-01-17T10:35:00Z"
}
```

### Ping

```
GET /api/ping
```

Response:
```json
{
  "message": "pong",
  "status": "ok"
}
```

## Configuration

Configuration is done via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `ALERTMANAGER_URL` | http://localhost:9093 | AlertManager API URL |
| `GRAFANA_URL` | http://localhost:3000 | Grafana instance URL |
| `LOG_LEVEL` | info | Log level (debug, info, warn, error) |

## Development

### Setup Development Environment

```bash
# Install dependencies
go mod download

# Install air for hot reload
go install github.com/cosmtrek/air@latest

# Install golangci-lint for linting
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Start development server with hot reload
make dev
```

### Code Formatting and Linting

```bash
# Format code
make fmt

# Run linter
make lint

# Run vet
make vet

# Run all checks
make all
```

### Testing

```bash
# Run tests
make test

# Run tests with coverage
make test-coverage
```

## Project Structure

```
backend/
├── cmd/
│   └── main.go              # Application entry point
├── pkg/
│   ├── api/
│   │   ├── handlers.go      # HTTP request handlers
│   │   └── middleware.go    # HTTP middleware
│   ├── models/
│   │   └── alert.go         # Data models
│   ├── alertmanager/
│   │   └── client.go        # AlertManager API client
│   └── config/
│       └── config.go        # Configuration management
├── go.mod                   # Go module file
├── go.sum                   # Go dependencies checksum
├── Makefile                 # Build commands
├── Dockerfile              # Container image
├── docker-compose.yml      # Development environment
├── alertmanager.yml        # AlertManager configuration
├── prometheus.yml          # Prometheus configuration
└── README.md              # This file
```

## Integration with Frontend

The frontend React plugin communicates with this backend via HTTP. Example:

```typescript
// Frontend code
const response = await fetch(
  'http://localhost:8080/api/alerts?status=firing&limit=50'
);
const alerts = await response.json();
```

## Next Steps

After setting up the backend:

1. **Configure AlertManager** - Update `alertmanager.yml` with your notification settings
2. **Add Custom Rules** - Create `alerts.yml` for your specific alert rules
3. **Connect Frontend** - Update frontend API endpoint configuration
4. **Deploy** - Use Docker or system service for production deployment

## Troubleshooting

### AlertManager Connection Error

```
Error: Failed to fetch alerts from AlertManager
```

**Solution:**
- Verify AlertManager is running: `curl http://localhost:9093/api/v2/alerts`
- Check `ALERTMANAGER_URL` environment variable
- Ensure network connectivity between backend and AlertManager

### Port Already in Use

```
listen tcp 0.0.0.0:8080: bind: address already in use
```

**Solution:**
- Change PORT: `PORT=8081 ./bin/grafana-alert-plugin`
- Kill existing process: `lsof -i :8080 | kill -9 <PID>`

### CORS Errors in Frontend

If frontend can't access backend:

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Backend has CORS middleware enabled by default
- Ensure frontend requests use correct `Content-Type: application/json`
- Check browser console for exact error message

## Contributing

When adding new features:

1. Create new files in appropriate `pkg/` subdirectories
2. Add tests for new functions
3. Update API documentation in this README
4. Run `make lint` and `make fmt` before committing

## Resources

- [Prometheus AlertManager Docs](https://prometheus.io/docs/alerting/latest/overview/)
- [Grafana Plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Go HTTP Handler Documentation](https://golang.org/pkg/net/http/)

---

**Ready to receive Swagger API definitions!** 🚀

When you're ready to add more endpoints based on Swagger definitions:
1. Add new service interfaces in `pkg/`
2. Create corresponding handlers in `pkg/api/`
3. Register routes in `api.RegisterRoutes()`
4. Update this README with new endpoint documentation
