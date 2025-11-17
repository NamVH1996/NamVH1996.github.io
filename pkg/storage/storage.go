package storage

import (
	"sync"
	"time"

	"github.com/NamVH1996/grafana-alert-plugin/pkg/models"
	"github.com/google/uuid"
)

// Storage interface defines all data access methods
type Storage interface {
	// Alert Management
	SaveAlert(alert *models.AlertLog) error
	GetAlert(id string) (*models.AlertLog, error)
	ListAlerts(limit, offset int, filters map[string]string) ([]*models.AlertLog, int, error)
	GetAlertStats() (*models.AlertStatsResponse, error)

	// Contact Points
	SaveContactPoint(cp *models.ContactPoint) error
	GetContactPoint(id string) (*models.ContactPoint, error)
	GetContactPointByName(name string) (*models.ContactPoint, error)
	ListContactPoints(enabledOnly bool) ([]*models.ContactPoint, error)
	DeleteContactPoint(id string) error
	UpdateContactPoint(id string, cp *models.ContactPoint) error

	// VM Mappings
	SaveVMMapping(vm *models.VMMapping) error
	GetVMMapping(id string) (*models.VMMapping, error)
	ListVMMappings() ([]*models.VMMapping, error)
	DeleteVMMapping(id string) error
	UpdateVMMapping(id string, vm *models.VMMapping) error

	// Escalation Mappings
	SaveEscalationMapping(em *models.EscalationMapping) error
	GetEscalationMapping(id string) (*models.EscalationMapping, error)
	ListEscalationMappings() ([]*models.EscalationMapping, error)
	DeleteEscalationMapping(id string) error
	UpdateEscalationMapping(id string, em *models.EscalationMapping) error

	// Extraction Rules
	SaveExtractionRule(rule *models.ExtractionRule) error
	GetExtractionRule(id string) (*models.ExtractionRule, error)
	ListExtractionRules(enabledOnly bool) ([]*models.ExtractionRule, error)
	DeleteExtractionRule(id string) error
	UpdateExtractionRule(id string, rule *models.ExtractionRule) error
}

// InMemoryStorage implements Storage interface with in-memory maps
type InMemoryStorage struct {
	mu                   sync.RWMutex
	alerts               map[string]*models.AlertLog
	contactPoints        map[string]*models.ContactPoint
	vmMappings           map[string]*models.VMMapping
	escalationMappings   map[string]*models.EscalationMapping
	extractionRules      map[string]*models.ExtractionRule
}

// NewInMemoryStorage creates a new in-memory storage
func NewInMemoryStorage() Storage {
	return &InMemoryStorage{
		alerts:             make(map[string]*models.AlertLog),
		contactPoints:      make(map[string]*models.ContactPoint),
		vmMappings:         make(map[string]*models.VMMapping),
		escalationMappings: make(map[string]*models.EscalationMapping),
		extractionRules:    make(map[string]*models.ExtractionRule),
	}
}

// ========== ALERT MANAGEMENT ==========

func (s *InMemoryStorage) SaveAlert(alert *models.AlertLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if alert.ID == "" {
		alert.ID = uuid.New().String()
	}
	alert.CreatedAt = time.Now()
	alert.UpdatedAt = time.Now()

	s.alerts[alert.ID] = alert
	return nil
}

func (s *InMemoryStorage) GetAlert(id string) (*models.AlertLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	alert, exists := s.alerts[id]
	if !exists {
		return nil, nil
	}
	return alert, nil
}

func (s *InMemoryStorage) ListAlerts(limit, offset int, filters map[string]string) ([]*models.AlertLog, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []*models.AlertLog
	for _, alert := range s.alerts {
		// Apply filters
		if severity, exists := filters["severity"]; exists && alert.Severity != severity {
			continue
		}
		if status, exists := filters["status"]; exists && alert.Status != status {
			continue
		}
		if processingStatus, exists := filters["processing_status"]; exists && alert.ProcessingStatus != processingStatus {
			continue
		}

		results = append(results, alert)
	}

	total := len(results)

	// Apply pagination
	start := offset
	end := offset + limit
	if end > len(results) {
		end = len(results)
	}
	if start > len(results) {
		return []*models.AlertLog{}, total, nil
	}

	return results[start:end], total, nil
}

func (s *InMemoryStorage) GetAlertStats() (*models.AlertStatsResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stats := &models.AlertStatsResponse{
		Status:          "success",
		AlertLogs:       make(map[string]int),
		ProcessingQueue: make(map[string]int),
		Timestamp:       time.Now(),
	}

	stats.AlertLogs["total"] = len(s.alerts)

	for _, alert := range s.alerts {
		if alert.ProcessingStatus == "sent" {
			stats.AlertLogs["sent"]++
		} else if alert.ProcessingStatus == "failed" {
			stats.AlertLogs["failed"]++
		} else if alert.ProcessingStatus == "pending" {
			stats.AlertLogs["pending"]++
		}
	}

	return stats, nil
}

// ========== CONTACT POINTS ==========

func (s *InMemoryStorage) SaveContactPoint(cp *models.ContactPoint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if cp.ID == "" {
		cp.ID = uuid.New().String()
	}
	cp.CreatedAt = time.Now()
	cp.UpdatedAt = time.Now()

	s.contactPoints[cp.ID] = cp
	return nil
}

func (s *InMemoryStorage) GetContactPoint(id string) (*models.ContactPoint, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cp, exists := s.contactPoints[id]
	if !exists {
		return nil, nil
	}
	return cp, nil
}

func (s *InMemoryStorage) GetContactPointByName(name string) (*models.ContactPoint, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, cp := range s.contactPoints {
		if cp.Name == name {
			return cp, nil
		}
	}
	return nil, nil
}

func (s *InMemoryStorage) ListContactPoints(enabledOnly bool) ([]*models.ContactPoint, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []*models.ContactPoint
	for _, cp := range s.contactPoints {
		if enabledOnly && !cp.Enabled {
			continue
		}
		results = append(results, cp)
	}
	return results, nil
}

func (s *InMemoryStorage) DeleteContactPoint(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.contactPoints, id)
	return nil
}

func (s *InMemoryStorage) UpdateContactPoint(id string, cp *models.ContactPoint) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.contactPoints[id]
	if !exists {
		return nil
	}

	cp.ID = existing.ID
	cp.CreatedAt = existing.CreatedAt
	cp.UpdatedAt = time.Now()
	s.contactPoints[id] = cp
	return nil
}

// ========== VM MAPPINGS ==========

func (s *InMemoryStorage) SaveVMMapping(vm *models.VMMapping) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if vm.ID == "" {
		vm.ID = uuid.New().String()
	}
	vm.CreatedAt = time.Now()
	vm.UpdatedAt = time.Now()

	s.vmMappings[vm.ID] = vm
	return nil
}

func (s *InMemoryStorage) GetVMMapping(id string) (*models.VMMapping, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	vm, exists := s.vmMappings[id]
	if !exists {
		return nil, nil
	}
	return vm, nil
}

func (s *InMemoryStorage) ListVMMappings() ([]*models.VMMapping, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []*models.VMMapping
	for _, vm := range s.vmMappings {
		results = append(results, vm)
	}
	return results, nil
}

func (s *InMemoryStorage) DeleteVMMapping(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.vmMappings, id)
	return nil
}

func (s *InMemoryStorage) UpdateVMMapping(id string, vm *models.VMMapping) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.vmMappings[id]
	if !exists {
		return nil
	}

	vm.ID = existing.ID
	vm.CreatedAt = existing.CreatedAt
	vm.UpdatedAt = time.Now()
	s.vmMappings[id] = vm
	return nil
}

// ========== ESCALATION MAPPINGS ==========

func (s *InMemoryStorage) SaveEscalationMapping(em *models.EscalationMapping) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if em.ID == "" {
		em.ID = uuid.New().String()
	}
	em.CreatedAt = time.Now()
	em.UpdatedAt = time.Now()

	s.escalationMappings[em.ID] = em
	return nil
}

func (s *InMemoryStorage) GetEscalationMapping(id string) (*models.EscalationMapping, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	em, exists := s.escalationMappings[id]
	if !exists {
		return nil, nil
	}
	return em, nil
}

func (s *InMemoryStorage) ListEscalationMappings() ([]*models.EscalationMapping, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []*models.EscalationMapping
	for _, em := range s.escalationMappings {
		results = append(results, em)
	}
	return results, nil
}

func (s *InMemoryStorage) DeleteEscalationMapping(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.escalationMappings, id)
	return nil
}

func (s *InMemoryStorage) UpdateEscalationMapping(id string, em *models.EscalationMapping) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.escalationMappings[id]
	if !exists {
		return nil
	}

	em.ID = existing.ID
	em.CreatedAt = existing.CreatedAt
	em.UpdatedAt = time.Now()
	s.escalationMappings[id] = em
	return nil
}

// ========== EXTRACTION RULES ==========

func (s *InMemoryStorage) SaveExtractionRule(rule *models.ExtractionRule) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if rule.ID == "" {
		rule.ID = uuid.New().String()
	}
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()

	s.extractionRules[rule.ID] = rule
	return nil
}

func (s *InMemoryStorage) GetExtractionRule(id string) (*models.ExtractionRule, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rule, exists := s.extractionRules[id]
	if !exists {
		return nil, nil
	}
	return rule, nil
}

func (s *InMemoryStorage) ListExtractionRules(enabledOnly bool) ([]*models.ExtractionRule, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var results []*models.ExtractionRule
	for _, rule := range s.extractionRules {
		if enabledOnly && !rule.Enabled {
			continue
		}
		results = append(results, rule)
	}
	return results, nil
}

func (s *InMemoryStorage) DeleteExtractionRule(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.extractionRules, id)
	return nil
}

func (s *InMemoryStorage) UpdateExtractionRule(id string, rule *models.ExtractionRule) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.extractionRules[id]
	if !exists {
		return nil
	}

	rule.ID = existing.ID
	rule.CreatedAt = existing.CreatedAt
	rule.UpdatedAt = time.Now()
	s.extractionRules[id] = rule
	return nil
}
