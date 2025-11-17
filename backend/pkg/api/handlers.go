package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/NamVH1996/grafana-alert-plugin/pkg/alertmanager"
	"github.com/NamVH1996/grafana-alert-plugin/pkg/models"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

// Handler contains API handlers and dependencies
type Handler struct {
	amClient *alertmanager.Client
}

// NewHandler creates a new API handler
func NewHandler(amClient *alertmanager.Client) *Handler {
	return &Handler{
		amClient: amClient,
	}
}

// RegisterRoutes registers all API routes
func (h *Handler) RegisterRoutes(router *mux.Router) {
	// Alert endpoints
	router.HandleFunc("/api/alerts", h.ListAlerts).Methods("GET")
	router.HandleFunc("/api/alerts/stats", h.GetAlertStats).Methods("GET")
	router.HandleFunc("/api/alerts/groups", h.GetAlertGroups).Methods("GET")
	router.HandleFunc("/api/alerts/{id}/acknowledge", h.AcknowledgeAlert).Methods("POST")

	// Health check
	router.HandleFunc("/api/health", h.Health).Methods("GET")

	// Utility endpoints
	router.HandleFunc("/api/ping", h.Ping).Methods("GET")

	log.Info("Routes registered successfully")
}

// ListAlerts handles GET /api/alerts
// Returns a list of alerts with optional filtering
// Query parameters:
//   - status: "firing", "resolved", "all" (default: "all")
//   - severity: "critical", "warning", "info"
//   - group: filter by group label value
//   - search: search in summary/description
//   - limit: max results (default: 100)
//   - offset: pagination offset (default: 0)
func (h *Handler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	log.Info("ListAlerts called")

	filter := &models.AlertFilter{
		Status:     r.URL.Query().Get("status"),
		Severity:   r.URL.Query().Get("severity"),
		Group:      r.URL.Query().Get("group"),
		SearchTerm: r.URL.Query().Get("search"),
		Limit:      parseIntQuery(r, "limit", 100),
		Offset:     parseIntQuery(r, "offset", 0),
	}

	alerts, err := h.amClient.GetAlerts(filter)
	if err != nil {
		log.WithError(err).Error("Failed to get alerts")
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, alerts)
}

// GetAlertStats handles GET /api/alerts/stats
// Returns alert statistics (total, firing, resolved, by severity)
func (h *Handler) GetAlertStats(w http.ResponseWriter, r *http.Request) {
	log.Info("GetAlertStats called")

	stats, err := h.amClient.GetAlertStats()
	if err != nil {
		log.WithError(err).Error("Failed to get alert stats")
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, stats)
}

// GetAlertGroups handles GET /api/alerts/groups
// Query parameters:
//   - groupBy: label to group by (default: "group")
func (h *Handler) GetAlertGroups(w http.ResponseWriter, r *http.Request) {
	log.Info("GetAlertGroups called")

	groupLabel := r.URL.Query().Get("groupBy")
	if groupLabel == "" {
		groupLabel = "group"
	}

	groups, err := h.amClient.GetAlertsByGroup(groupLabel)
	if err != nil {
		log.WithError(err).Error("Failed to get alert groups")
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, groups)
}

// AcknowledgeAlert handles POST /api/alerts/{id}/acknowledge
// This is a placeholder - actual acknowledgement depends on your setup
// Currently just logs the acknowledge request
func (h *Handler) AcknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	alertID := vars["id"]

	log.WithField("alertID", alertID).Info("AcknowledgeAlert called")

	var req models.AcknowledgeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// TODO: Implement actual alert acknowledgement logic
	// This could involve:
	// - Sending to AlertManager
	// - Updating a database
	// - Publishing to a notification system

	response := models.AcknowledgeResponse{
		Success: true,
		Message: "Alert acknowledged successfully",
		AlertID: alertID,
	}

	writeJSON(w, http.StatusOK, response)
}

// Health handles GET /api/health
// Returns AlertManager health status and plugin health
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	log.Info("Health check called")

	health, err := h.amClient.Health()
	if err != nil {
		log.WithError(err).Error("Failed to check health")
		health = &models.HealthResponse{
			Status:    "error",
			Message:   err.Error(),
		}
	}

	writeJSON(w, http.StatusOK, health)
}

// Ping handles GET /api/ping
// Simple health check endpoint
func (h *Handler) Ping(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"message": "pong",
		"status":  "ok",
	})
}

// Helper functions

// parseIntQuery parses integer query parameter with default value
func parseIntQuery(r *http.Request, key string, defaultVal int) int {
	val := r.URL.Query().Get(key)
	if val == "" {
		return defaultVal
	}

	intVal, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}

	return intVal
}

// writeJSON writes a JSON response with the given status code
func writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.WithError(err).Error("Failed to write JSON response")
	}
}
