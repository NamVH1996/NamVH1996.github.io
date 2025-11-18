package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/NamVH1996/grafana-alert-plugin/pkg/models"
	"github.com/NamVH1996/grafana-alert-plugin/pkg/storage"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

// SwaggerHandler handles all swagger API endpoints
type SwaggerHandler struct {
	storage storage.Storage
}

// NewSwaggerHandler creates a new swagger handler
func NewSwaggerHandler(s storage.Storage) *SwaggerHandler {
	return &SwaggerHandler{
		storage: s,
	}
}

// RegisterSwaggerRoutes registers all swagger endpoints
func (h *SwaggerHandler) RegisterSwaggerRoutes(router *mux.Router) {
	// Webhook
	router.HandleFunc("/webhooks/grafana", h.GrafanaWebhook).Methods("POST")

	// Alert Management
	router.HandleFunc("/alerts", h.ListAlerts).Methods("GET")
	router.HandleFunc("/alerts/{alert_id}", h.GetAlertDetail).Methods("GET")
	router.HandleFunc("/alerts/stats", h.GetAlertStats).Methods("GET")

	// Contact Points
	router.HandleFunc("/api/contact-points", h.CreateContactPoint).Methods("POST")
	router.HandleFunc("/api/contact-points", h.ListContactPoints).Methods("GET")
	router.HandleFunc("/api/contact-points/{contact_point_id}", h.GetContactPoint).Methods("GET")
	router.HandleFunc("/api/contact-points/{contact_point_id}", h.UpdateContactPoint).Methods("PUT")
	router.HandleFunc("/api/contact-points/{contact_point_id}", h.DeleteContactPoint).Methods("DELETE")
	router.HandleFunc("/api/contact-points/name/{name}", h.GetContactPointByName).Methods("GET")
	router.HandleFunc("/api/contact-points/{contact_point_id}/enable", h.EnableContactPoint).Methods("POST")
	router.HandleFunc("/api/contact-points/{contact_point_id}/disable", h.DisableContactPoint).Methods("POST")

	// VM Mappings
	router.HandleFunc("/api/vm-mappings", h.CreateVMMapping).Methods("POST")
	router.HandleFunc("/api/vm-mappings", h.ListVMMappings).Methods("GET")
	router.HandleFunc("/api/vm-mappings/{vm_mapping_id}", h.GetVMMapping).Methods("GET")
	router.HandleFunc("/api/vm-mappings/{vm_mapping_id}", h.UpdateVMMapping).Methods("PUT")
	router.HandleFunc("/api/vm-mappings/{vm_mapping_id}", h.DeleteVMMapping).Methods("DELETE")

	// Escalation Mappings
	router.HandleFunc("/api/escalation-mappings", h.CreateEscalationMapping).Methods("POST")
	router.HandleFunc("/api/escalation-mappings", h.ListEscalationMappings).Methods("GET")
	router.HandleFunc("/api/escalation-mappings/{escalation_id}", h.GetEscalationMapping).Methods("GET")
	router.HandleFunc("/api/escalation-mappings/{escalation_id}", h.UpdateEscalationMapping).Methods("PUT")
	router.HandleFunc("/api/escalation-mappings/{escalation_id}", h.DeleteEscalationMapping).Methods("DELETE")

	// Extraction Rules
	router.HandleFunc("/api/extraction-rules", h.CreateExtractionRule).Methods("POST")
	router.HandleFunc("/api/extraction-rules", h.ListExtractionRules).Methods("GET")
	router.HandleFunc("/api/extraction-rules/{rule_id}", h.GetExtractionRule).Methods("GET")
	router.HandleFunc("/api/extraction-rules/{rule_id}", h.UpdateExtractionRule).Methods("PUT")
	router.HandleFunc("/api/extraction-rules/{rule_id}", h.DeleteExtractionRule).Methods("DELETE")

	log.Info("Swagger routes registered")
}

// ========== ALERT MANAGEMENT ==========

// GrafanaWebhook handles incoming alerts from Grafana
func (h *SwaggerHandler) GrafanaWebhook(w http.ResponseWriter, r *http.Request) {
	var payload models.AlertPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	count := 0
	for _, alert := range payload.Alerts {
		var endsAtPtr *time.Time
		if !alert.EndsAt.IsZero() {
			endsAtPtr = &alert.EndsAt
		}

		alertLog := &models.AlertLog{
			ID:               uuid.New().String(),
			AlertName:        alert.Labels["alertname"],
			Severity:         alert.Labels["severity"],
			Status:           alert.Status,
			ProcessingStatus: "pending",
			Summary:          alert.Annotations["summary"],
			Description:      alert.Annotations["description"],
			StartsAt:         alert.StartsAt,
			EndsAt:           endsAtPtr,
			Fingerprint:      alert.Fingerprint,
			Labels:           alert.Labels,
		}

		if err := h.storage.SaveAlert(alertLog); err != nil {
			log.WithError(err).Error("Failed to save alert")
		} else {
			count++
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status":        "received",
		"alerts_count":  count,
		"timestamp":     time.Now(),
	})
}

// ListAlerts lists all alerts with filtering
func (h *SwaggerHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	limit := getQueryInt(r, "limit", 50)
	offset := getQueryInt(r, "offset", 0)

	filters := make(map[string]string)
	if severity := r.URL.Query().Get("severity"); severity != "" {
		filters["severity"] = severity
	}
	if status := r.URL.Query().Get("status"); status != "" {
		filters["status"] = status
	}
	if processingStatus := r.URL.Query().Get("processing_status"); processingStatus != "" {
		filters["processing_status"] = processingStatus
	}

	alerts, total, err := h.storage.ListAlerts(limit, offset, filters)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"total":  total,
		"limit":  limit,
		"offset": offset,
		"data":   alerts,
	})
}

// GetAlertDetail gets single alert detail
func (h *SwaggerHandler) GetAlertDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	alertID := vars["alert_id"]

	alert, err := h.storage.GetAlert(alertID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if alert == nil {
		writeError(w, http.StatusNotFound, "Alert not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   alert,
	})
}

// GetAlertStats returns alert statistics
func (h *SwaggerHandler) GetAlertStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.storage.GetAlertStats()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, stats)
}

// ========== CONTACT POINTS ==========

// CreateContactPoint creates a new contact point
func (h *SwaggerHandler) CreateContactPoint(w http.ResponseWriter, r *http.Request) {
	var req models.ContactPointCreate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	cp := &models.ContactPoint{
		Name:           req.Name,
		Type:           req.Type,
		Config:         req.Config,
		MatchLogic:     req.MatchLogic,
		LabelMappings:  req.LabelMappings,
		IgnoreMatchers: req.IgnoreMatchers,
		GroupName:      req.GroupName,
		Priority:       req.Priority,
		Enabled:        req.Enabled,
	}

	if err := h.storage.SaveContactPoint(cp); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, http.StatusCreated, cp)
}

// ListContactPoints lists all contact points
func (h *SwaggerHandler) ListContactPoints(w http.ResponseWriter, r *http.Request) {
	enabledOnly := r.URL.Query().Get("enabled_only") == "true"

	contacts, err := h.storage.ListContactPoints(enabledOnly)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, contacts)
}

// GetContactPoint gets single contact point
func (h *SwaggerHandler) GetContactPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["contact_point_id"]

	cp, err := h.storage.GetContactPoint(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if cp == nil {
		writeError(w, http.StatusNotFound, "Contact point not found")
		return
	}

	writeJSON(w, http.StatusOK, cp)
}

// GetContactPointByName gets contact point by name
func (h *SwaggerHandler) GetContactPointByName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]

	cp, err := h.storage.GetContactPointByName(name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if cp == nil {
		writeError(w, http.StatusNotFound, "Contact point not found")
		return
	}

	writeJSON(w, http.StatusOK, cp)
}

// UpdateContactPoint updates a contact point
func (h *SwaggerHandler) UpdateContactPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["contact_point_id"]

	var req models.ContactPoint
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.UpdateContactPoint(id, &req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, _ := h.storage.GetContactPoint(id)
	writeJSON(w, http.StatusOK, updated)
}

// DeleteContactPoint deletes a contact point
func (h *SwaggerHandler) DeleteContactPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["contact_point_id"]

	if err := h.storage.DeleteContactPoint(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// EnableContactPoint enables a contact point
func (h *SwaggerHandler) EnableContactPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["contact_point_id"]

	cp, _ := h.storage.GetContactPoint(id)
	if cp == nil {
		writeError(w, http.StatusNotFound, "Contact point not found")
		return
	}

	cp.Enabled = true
	h.storage.UpdateContactPoint(id, cp)

	writeJSON(w, http.StatusOK, cp)
}

// DisableContactPoint disables a contact point
func (h *SwaggerHandler) DisableContactPoint(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["contact_point_id"]

	cp, _ := h.storage.GetContactPoint(id)
	if cp == nil {
		writeError(w, http.StatusNotFound, "Contact point not found")
		return
	}

	cp.Enabled = false
	h.storage.UpdateContactPoint(id, cp)

	writeJSON(w, http.StatusOK, cp)
}

// ========== VM MAPPINGS ==========

// CreateVMMapping creates a new VM mapping
func (h *SwaggerHandler) CreateVMMapping(w http.ResponseWriter, r *http.Request) {
	var req models.VMMapping
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.SaveVMMapping(&req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, http.StatusCreated, req)
}

// ListVMMappings lists all VM mappings
func (h *SwaggerHandler) ListVMMappings(w http.ResponseWriter, r *http.Request) {
	vms, err := h.storage.ListVMMappings()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, vms)
}

// GetVMMapping gets single VM mapping
func (h *SwaggerHandler) GetVMMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["vm_mapping_id"]

	vm, err := h.storage.GetVMMapping(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if vm == nil {
		writeError(w, http.StatusNotFound, "VM mapping not found")
		return
	}

	writeJSON(w, http.StatusOK, vm)
}

// UpdateVMMapping updates a VM mapping
func (h *SwaggerHandler) UpdateVMMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["vm_mapping_id"]

	var req models.VMMapping
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.UpdateVMMapping(id, &req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, _ := h.storage.GetVMMapping(id)
	writeJSON(w, http.StatusOK, updated)
}

// DeleteVMMapping deletes a VM mapping
func (h *SwaggerHandler) DeleteVMMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["vm_mapping_id"]

	if err := h.storage.DeleteVMMapping(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========== ESCALATION MAPPINGS ==========

// CreateEscalationMapping creates a new escalation mapping
func (h *SwaggerHandler) CreateEscalationMapping(w http.ResponseWriter, r *http.Request) {
	var req models.EscalationMapping
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.SaveEscalationMapping(&req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, http.StatusCreated, req)
}

// ListEscalationMappings lists all escalation mappings
func (h *SwaggerHandler) ListEscalationMappings(w http.ResponseWriter, r *http.Request) {
	mappings, err := h.storage.ListEscalationMappings()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, mappings)
}

// GetEscalationMapping gets single escalation mapping
func (h *SwaggerHandler) GetEscalationMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["escalation_id"]

	mapping, err := h.storage.GetEscalationMapping(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if mapping == nil {
		writeError(w, http.StatusNotFound, "Escalation mapping not found")
		return
	}

	writeJSON(w, http.StatusOK, mapping)
}

// UpdateEscalationMapping updates an escalation mapping
func (h *SwaggerHandler) UpdateEscalationMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["escalation_id"]

	var req models.EscalationMapping
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.UpdateEscalationMapping(id, &req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, _ := h.storage.GetEscalationMapping(id)
	writeJSON(w, http.StatusOK, updated)
}

// DeleteEscalationMapping deletes an escalation mapping
func (h *SwaggerHandler) DeleteEscalationMapping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["escalation_id"]

	if err := h.storage.DeleteEscalationMapping(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========== EXTRACTION RULES ==========

// CreateExtractionRule creates a new extraction rule
func (h *SwaggerHandler) CreateExtractionRule(w http.ResponseWriter, r *http.Request) {
	var req models.ExtractionRule
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.SaveExtractionRule(&req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, http.StatusCreated, req)
}

// ListExtractionRules lists all extraction rules
func (h *SwaggerHandler) ListExtractionRules(w http.ResponseWriter, r *http.Request) {
	enabledOnly := r.URL.Query().Get("enabled_only") == "true"

	rules, err := h.storage.ListExtractionRules(enabledOnly)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, rules)
}

// GetExtractionRule gets single extraction rule
func (h *SwaggerHandler) GetExtractionRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["rule_id"]

	rule, err := h.storage.GetExtractionRule(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if rule == nil {
		writeError(w, http.StatusNotFound, "Extraction rule not found")
		return
	}

	writeJSON(w, http.StatusOK, rule)
}

// UpdateExtractionRule updates an extraction rule
func (h *SwaggerHandler) UpdateExtractionRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["rule_id"]

	var req models.ExtractionRule
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.storage.UpdateExtractionRule(id, &req); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, _ := h.storage.GetExtractionRule(id)
	writeJSON(w, http.StatusOK, updated)
}

// DeleteExtractionRule deletes an extraction rule
func (h *SwaggerHandler) DeleteExtractionRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["rule_id"]

	if err := h.storage.DeleteExtractionRule(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ========== HELPERS ==========

func getQueryInt(r *http.Request, key string, defaultVal int) int {
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

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "error",
		"error":  message,
	})
}
