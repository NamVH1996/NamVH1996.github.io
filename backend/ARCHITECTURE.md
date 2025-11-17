# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GRAFANA INSTANCE                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Plugin Frontend (React/TypeScript)          │  │
│  │  - Dashboard UI                                          │  │
│  │  - Alert Display                                         │  │
│  │  - Filtering & Search                                    │  │
│  │  - Settings Panel                                        │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │ HTTP REST API                            │
│  ┌──────────────────▼───────────────────────────────────────┐  │
│  │          Plugin Backend (Go/HTTP Server)                 │  │
│  │  - /api/alerts (LIST, FILTER)                            │  │
│  │  - /api/alerts/stats (STATISTICS)                        │  │
│  │  - /api/alerts/groups (GROUPING)                         │  │
│  │  - /api/alerts/{id}/acknowledge                          │  │
│  │  - /api/health (HEALTHCHECK)                             │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────┘
                      │ HTTP/REST
      ┌───────────────▼──────────────────────┐
      │      ALERTMANAGER                    │
      │  (Separate Service)                  │
      │  http://alertmanager:9093            │
      │  - Fetch active alerts               │
      │  - Alert lifecycle events            │
      │  - Notification routing              │
      │                                      │
      │  Connected to:                       │
      │  - Prometheus (for metrics)          │
      │  - Notification channels             │
      │    (Slack, Email, etc.)              │
      └──────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React/TypeScript)

**Location:** `src/` (at project root)

**Components:**
- `pages/AppPage.tsx` - Main dashboard with real-time alerts
- `pages/SettingsPage.tsx` - API configuration
- `pages/DashboardsPage.tsx` - Custom dashboard management
- `components/AlertsPanel.tsx` - Alert display and filtering
- `components/MetricsPanel.tsx` - Metrics visualization
- `components/HealthStatusPanel.tsx` - Service health status

**Responsibilities:**
- Render UI components
- Handle user interactions
- Call backend APIs
- Display alert data
- Manage plugin settings

**Technology Stack:**
- React 18.2
- TypeScript 5.0
- Grafana UI Components
- Axios for HTTP

### 2. Backend (Go)

**Location:** `backend/` directory

**Main Components:**

#### Entry Point: `cmd/main.go`
- Initializes application
- Sets up HTTP server
- Registers middleware and routes
- Handles graceful shutdown

#### API Handlers: `pkg/api/handlers.go`
```
Handler Interface:
├── ListAlerts(w, r)          # GET /api/alerts
├── GetAlertStats(w, r)       # GET /api/alerts/stats
├── GetAlertGroups(w, r)      # GET /api/alerts/groups
├── AcknowledgeAlert(w, r)    # POST /api/alerts/{id}/acknowledge
├── Health(w, r)              # GET /api/health
└── Ping(w, r)                # GET /api/ping
```

#### AlertManager Client: `pkg/alertmanager/client.go`
```
Client Interface:
├── GetAlerts(filter)         # Fetch and filter alerts
├── GetAlertStats()           # Get statistics
├── GetAlertsByGroup(label)   # Group alerts
└── Health()                  # Check connectivity
```

#### Data Models: `pkg/models/alert.go`
```
Key Models:
├── Alert                     # Raw AlertManager alert
├── AlertSummary             # Simplified alert for UI
├── AlertFilter              # Query filters
├── AlertListResponse        # API response
├── AlertStatsResponse       # Statistics response
└── HealthResponse           # Health status
```

#### Middleware: `pkg/api/middleware.go`
- **LoggingMiddleware** - Request/response logging
- **CORSMiddleware** - CORS headers for frontend
- **RecoveryMiddleware** - Panic recovery

#### Configuration: `pkg/config/config.go`
- Load environment variables
- Provide config structure
- Validate settings
- Log configuration

**Responsibilities:**
- Receive HTTP requests from frontend
- Query AlertManager API
- Process and filter alert data
- Return JSON responses
- Handle errors gracefully
- Maintain health/status checks

**Technology Stack:**
- Go 1.21
- Gorilla/Mux (HTTP routing)
- Prometheus AlertManager SDK
- Sirupsen Logrus (logging)

### 3. AlertManager

**Role:** Central alert management system

**Endpoints Used:**
- `GET /api/v2/alerts` - Fetch active alerts
- `GET /api/v2/alerts/groups` - Get alert groups
- `POST /api/v1/alerts` - Create/update alerts

**Key Features:**
- Alert deduplication
- Alert grouping
- Notification routing
- Alert persistence
- Silence management

**Integration Points:**
- Receives alerts from Prometheus rules
- Sends notifications to configured channels
- Provides REST API for external systems

### 4. Prometheus (Optional)

**Role:** Metrics collection and alert evaluation

**Integration:**
- Monitors system/application metrics
- Evaluates alert rules
- Sends alerts to AlertManager
- Stores time-series data

## Data Flow

### Alert Fetching Flow

```
1. Frontend User
   ↓
2. GET /api/alerts?status=firing
   ↓
3. Backend Handler (ListAlerts)
   ├─ Parse query parameters
   ├─ Create AlertFilter
   └─ Call AlertManager Client
   ↓
4. AlertManager Client
   ├─ Build HTTP request to AlertManager
   ├─ Execute request
   ├─ Parse response
   ├─ Apply filtering
   └─ Return AlertSummary[]
   ↓
5. Backend Handler
   ├─ Marshal to JSON
   ├─ Write response
   └─ Log request
   ↓
6. Frontend
   ├─ Parse JSON
   ├─ Update state
   ├─ Render components
   └─ Display alerts to user
```

### Alert Filtering Pipeline

```
Raw AlertManager Response
        ↓
1. Status Filter (firing/resolved)
        ↓
2. Severity Filter (critical/warning/info)
        ↓
3. Group Filter (label matching)
        ↓
4. Search Filter (summary/description)
        ↓
5. Limit & Offset (pagination)
        ↓
Filtered Results
```

## API Contract

### Request/Response Cycle

```
Frontend Request:
GET /api/alerts?status=firing&severity=critical&limit=50

    ↓

Backend Processing:
1. Parse URL parameters
2. Create filter object
3. Query AlertManager
4. Filter results
5. Serialize to JSON

    ↓

Frontend Response:
{
  "total": 5,
  "count": 5,
  "alerts": [...]
}
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Cases

| Scenario | Status Code | Message |
|----------|-------------|---------|
| Invalid query param | 400 | "Invalid request body" |
| AlertManager unreachable | 503 | "AlertManager connection error" |
| Internal server error | 500 | "Internal server error" |
| Request timeout | 504 | "Request timeout" |

## Security Considerations

### Current Implementation
- CORS enabled for Grafana frontend
- No authentication layer (relies on Grafana auth)
- Input validation on query parameters
- Error messages don't leak sensitive info

### Future Enhancements
- Request signing/validation
- Rate limiting
- Request logging for audit
- Encryption for sensitive data
- API key authentication

## Deployment Architecture

### Development
```
Local Machine:
├── Frontend: http://localhost:3000
├── Backend: http://localhost:8080
├── AlertManager: http://localhost:9093
└── Prometheus: http://localhost:9090
```

### Production
```
Server Infrastructure:
├── Grafana + Frontend Plugin (Port 3000)
├── Backend Service (Port 8080, behind reverse proxy)
├── AlertManager (Port 9093, internal)
└── Prometheus (Port 9090, internal)
```

### Docker Deployment
```
docker-compose.yml:
├── alertmanager service
├── plugin-backend service
├── prometheus service (optional)
└── Shared network
```

## Configuration Flow

```
Environment Variables
        ↓
config.Load()
        ↓
config.Validate()
        ↓
Initialize Components
├── Logger
├── AlertManager Client
├── HTTP Server
└── Routes
        ↓
Server Running
```

## Monitoring & Logging

### Logging Levels

| Level | Use Case |
|-------|----------|
| Debug | Detailed request/response info |
| Info | Server start, requests, config |
| Warn | Non-critical issues |
| Error | Failed requests, timeouts |

### Log Format

```
{
  "time": "2024-01-17T10:30:00Z",
  "level": "info",
  "msg": "HTTP request",
  "method": "GET",
  "path": "/api/alerts",
  "status": 200,
  "duration": "125ms"
}
```

## Future Extensibility

### Adding New Endpoints

1. **Define Models** - Add to `pkg/models/`
2. **Create Service** - Add to `pkg/` or new package
3. **Add Handler** - Add to `pkg/api/handlers.go`
4. **Register Route** - Add to `RegisterRoutes()`
5. **Test & Document** - Add tests and update README

### Adding Swagger/OpenAPI Support

When Swagger definitions are provided:

1. Import Swagger spec
2. Generate Go models
3. Implement handlers for each endpoint
4. Update `pkg/alertmanager/client.go` with new operations
5. Add new route handlers
6. Update frontend API calls

---

**Architecture is ready for Swagger integration!** When you provide the Swagger file, we'll extend this with additional services and endpoints.
