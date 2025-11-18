import React, { useState, useEffect } from 'react';
import { Container, Button, Input, Select } from '@grafana/ui';
import {
  vmMappingsService,
  escalationMappingsService,
  extractionRulesService,
  VMMapping,
  VMMappingCreate,
  EscalationMapping,
  EscalationMappingCreate,
  ExtractionRule,
  ExtractionRuleCreate,
} from '@/api/swagger';
import './DataEnrichmentPage.css';

type Tab = 'vm' | 'escalation' | 'extraction';

export const DataEnrichmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('vm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VM Mappings State
  const [vmMappings, setVMmappings] = useState<VMMapping[]>([]);
  const [showVMForm, setShowVMForm] = useState(false);
  const [editingVMId, setEditingVMId] = useState<string | null>(null);
  const [vmFormData, setVMFormData] = useState({
    vm_id: '',
    vm_name: '',
    vm_private_ip: '',
    owner: '',
  });

  // Escalation Mappings State
  const [escalationMappings, setEscalationMappings] = useState<EscalationMapping[]>([]);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [editingEscalationId, setEditingEscalationId] = useState<string | null>(null);
  const [escalationFormData, setEscalationFormData] = useState({
    business_line: '',
    l1: '',
    l2: '',
  });

  // Extraction Rules State
  const [extractionRules, setExtractionRules] = useState<ExtractionRule[]>([]);
  const [showExtractionForm, setShowExtractionForm] = useState(false);
  const [editingExtractionId, setEditingExtractionId] = useState<string | null>(null);
  const [extractionFormData, setExtractionFormData] = useState({
    name: '',
    label_key: '',
    regex_pattern: '',
    output_key: '',
    description: '',
    enabled: true,
    priority: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadVMMappings(), loadEscalationMappings(), loadExtractionRules()]);
    } finally {
      setLoading(false);
    }
  };

  // VM Mappings Functions
  const loadVMMappings = async () => {
    try {
      const response = await vmMappingsService.list();
      if (response) {
        setVMmappings(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load VM mappings');
    }
  };

  const handleSaveVM = async () => {
    try {
      setLoading(true);
      const payload: VMMappingCreate = {
        vm_id: vmFormData.vm_id || undefined,
        vm_name: vmFormData.vm_name || undefined,
        vm_private_ip: vmFormData.vm_private_ip || undefined,
        owner: vmFormData.owner || undefined,
      };
      if (editingVMId) {
        await vmMappingsService.update(editingVMId, payload);
      } else {
        await vmMappingsService.create(payload);
      }
      resetVMForm();
      loadVMMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save VM mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVM = async (id: string) => {
    if (!window.confirm('Delete VM mapping?')) return;
    try {
      setLoading(true);
      await vmMappingsService.delete(id);
      loadVMMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete VM mapping');
    } finally {
      setLoading(false);
    }
  };

  const resetVMForm = () => {
    setShowVMForm(false);
    setEditingVMId(null);
    setVMFormData({
      vm_id: '',
      vm_name: '',
      vm_private_ip: '',
      owner: '',
    });
  };

  // Escalation Mappings Functions
  const loadEscalationMappings = async () => {
    try {
      const response = await escalationMappingsService.list();
      if (response) {
        setEscalationMappings(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load escalation mappings');
    }
  };

  const handleSaveEscalation = async () => {
    try {
      setLoading(true);
      const payload: EscalationMappingCreate = {
        business_line: escalationFormData.business_line,
        l1: escalationFormData.l1 || undefined,
        l2: escalationFormData.l2 || undefined,
      };
      if (editingEscalationId) {
        await escalationMappingsService.update(editingEscalationId, payload);
      } else {
        await escalationMappingsService.create(payload);
      }
      resetEscalationForm();
      loadEscalationMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save escalation mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEscalation = async (id: string) => {
    if (!window.confirm('Delete escalation mapping?')) return;
    try {
      setLoading(true);
      await escalationMappingsService.delete(id);
      loadEscalationMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete escalation mapping');
    } finally {
      setLoading(false);
    }
  };

  const resetEscalationForm = () => {
    setShowEscalationForm(false);
    setEditingEscalationId(null);
    setEscalationFormData({
      business_line: '',
      l1: '',
      l2: '',
    });
  };

  // Extraction Rules Functions
  const loadExtractionRules = async () => {
    try {
      const response = await extractionRulesService.list();
      if (response) {
        setExtractionRules(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load extraction rules');
    }
  };

  const handleSaveExtraction = async () => {
    try {
      setLoading(true);
      const payload: ExtractionRuleCreate = {
        name: extractionFormData.name,
        label_key: extractionFormData.label_key,
        regex_pattern: extractionFormData.regex_pattern,
        output_key: extractionFormData.output_key,
        description: extractionFormData.description || undefined,
        enabled: extractionFormData.enabled,
        priority: extractionFormData.priority,
      };
      if (editingExtractionId) {
        await extractionRulesService.update(editingExtractionId, payload);
      } else {
        await extractionRulesService.create(payload);
      }
      resetExtractionForm();
      loadExtractionRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save extraction rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExtraction = async (id: string) => {
    if (!window.confirm('Delete extraction rule?')) return;
    try {
      setLoading(true);
      await extractionRulesService.delete(id);
      loadExtractionRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete extraction rule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExtraction = async (id: string, currentEnabled: boolean) => {
    try {
      setLoading(true);
      const rule = extractionRules.find(r => r.id === id);
      if (rule) {
        await extractionRulesService.update(id, {
          ...rule,
          enabled: !currentEnabled,
        });
        loadExtractionRules();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update extraction rule');
    } finally {
      setLoading(false);
    }
  };

  const resetExtractionForm = () => {
    setShowExtractionForm(false);
    setEditingExtractionId(null);
    setExtractionFormData({
      name: '',
      label_key: '',
      regex_pattern: '',
      output_key: '',
      description: '',
      enabled: true,
      priority: 0,
    });
  };

  return (
    <Container>
      <div className="data-enrichment-page">
        <div className="page-header">
          <h1>Data Enrichment</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'vm' ? 'active' : ''}`}
            onClick={() => setActiveTab('vm')}
          >
            VM Mappings
          </button>
          <button
            className={`tab-button ${activeTab === 'escalation' ? 'active' : ''}`}
            onClick={() => setActiveTab('escalation')}
          >
            Escalation Mappings
          </button>
          <button
            className={`tab-button ${activeTab === 'extraction' ? 'active' : ''}`}
            onClick={() => setActiveTab('extraction')}
          >
            Extraction Rules
          </button>
        </div>

        {/* VM Mappings Tab */}
        {activeTab === 'vm' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>VM Mappings</h2>
              <Button onClick={() => setShowVMForm(true)} disabled={loading}>
                + Add VM Mapping
              </Button>
            </div>

            {showVMForm && (
              <div className="form-section">
                <h3>{editingVMId ? 'Edit VM Mapping' : 'Create VM Mapping'}</h3>
                <div className="form-group">
                  <label>VM ID</label>
                  <Input
                    type="text"
                    placeholder="e.g., vm-12345"
                    value={vmFormData.vm_id}
                    onChange={(e) => setVMFormData({ ...vmFormData, vm_id: e.currentTarget.value })}
                  />
                </div>
                <div className="form-group">
                  <label>VM Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Production Web Server"
                    value={vmFormData.vm_name}
                    onChange={(e) => setVMFormData({ ...vmFormData, vm_name: e.currentTarget.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Private IP</label>
                  <Input
                    type="text"
                    placeholder="e.g., 192.168.1.10"
                    value={vmFormData.vm_private_ip}
                    onChange={(e) =>
                      setVMFormData({ ...vmFormData, vm_private_ip: e.currentTarget.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Owner</label>
                  <Input
                    type="text"
                    placeholder="e.g., DevOps Team"
                    value={vmFormData.owner}
                    onChange={(e) => setVMFormData({ ...vmFormData, owner: e.currentTarget.value })}
                  />
                </div>
                <div className="form-actions">
                  <Button onClick={handleSaveVM} disabled={loading}>
                    {editingVMId ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={resetVMForm} variant="secondary" disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {vmMappings.length === 0 ? (
              <div className="empty-state">No VM mappings yet. Create one to get started.</div>
            ) : (
              <div className="mappings-list">
                {vmMappings.map((vm) => (
                  <div key={vm.id} className="mapping-card">
                    <div className="card-content">
                      <h4>{vm.vm_name || 'Unnamed VM'}</h4>
                      <div className="mapping-detail">
                        <span className="label">VM ID:</span>
                        <span className="value">{vm.vm_id || '-'}</span>
                      </div>
                      <div className="mapping-detail">
                        <span className="label">Private IP:</span>
                        <span className="value">{vm.vm_private_ip || '-'}</span>
                      </div>
                      <div className="mapping-detail">
                        <span className="label">Owner:</span>
                        <span className="value">{vm.owner || '-'}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <Button
                        onClick={() => {
                          setEditingVMId(vm.id);
                          setVMFormData({
                            vm_id: vm.vm_id || '',
                            vm_name: vm.vm_name || '',
                            vm_private_ip: vm.vm_private_ip || '',
                            owner: vm.owner || '',
                          });
                          setShowVMForm(true);
                        }}
                        size="sm"
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteVM(vm.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Escalation Mappings Tab */}
        {activeTab === 'escalation' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Escalation Mappings</h2>
              <Button onClick={() => setShowEscalationForm(true)} disabled={loading}>
                + Add Escalation
              </Button>
            </div>

            {showEscalationForm && (
              <div className="form-section">
                <h3>{editingEscalationId ? 'Edit Escalation Mapping' : 'Create Escalation Mapping'}</h3>
                <div className="form-group">
                  <label>Business Line</label>
                  <Input
                    type="text"
                    placeholder="e.g., Finance, HR, IT"
                    value={escalationFormData.business_line}
                    onChange={(e) =>
                      setEscalationFormData({
                        ...escalationFormData,
                        business_line: e.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>L1 Support</label>
                  <Input
                    type="text"
                    placeholder="e.g., on-call-l1@company.com"
                    value={escalationFormData.l1}
                    onChange={(e) =>
                      setEscalationFormData({ ...escalationFormData, l1: e.currentTarget.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>L2 Support</label>
                  <Input
                    type="text"
                    placeholder="e.g., on-call-l2@company.com"
                    value={escalationFormData.l2}
                    onChange={(e) =>
                      setEscalationFormData({ ...escalationFormData, l2: e.currentTarget.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <Button onClick={handleSaveEscalation} disabled={loading}>
                    {editingEscalationId ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={resetEscalationForm} variant="secondary" disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {escalationMappings.length === 0 ? (
              <div className="empty-state">No escalation mappings yet. Create one to get started.</div>
            ) : (
              <div className="mappings-list">
                {escalationMappings.map((esc) => (
                  <div key={esc.id} className="mapping-card">
                    <div className="card-content">
                      <h4>{esc.business_line}</h4>
                      <div className="mapping-detail">
                        <span className="label">L1:</span>
                        <span className="value">{esc.l1 || '-'}</span>
                      </div>
                      <div className="mapping-detail">
                        <span className="label">L2:</span>
                        <span className="value">{esc.l2 || '-'}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <Button
                        onClick={() => {
                          setEditingEscalationId(esc.id);
                          setEscalationFormData({
                            business_line: esc.business_line,
                            l1: esc.l1 || '',
                            l2: esc.l2 || '',
                          });
                          setShowEscalationForm(true);
                        }}
                        size="sm"
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteEscalation(esc.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Extraction Rules Tab */}
        {activeTab === 'extraction' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Extraction Rules</h2>
              <Button onClick={() => setShowExtractionForm(true)} disabled={loading}>
                + Add Rule
              </Button>
            </div>

            {showExtractionForm && (
              <div className="form-section">
                <h3>{editingExtractionId ? 'Edit Extraction Rule' : 'Create Extraction Rule'}</h3>
                <div className="form-group">
                  <label>Rule Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Extract Service from Alert"
                    value={extractionFormData.name}
                    onChange={(e) =>
                      setExtractionFormData({ ...extractionFormData, name: e.currentTarget.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Source Label Key</label>
                  <Input
                    type="text"
                    placeholder="e.g., alert_name"
                    value={extractionFormData.label_key}
                    onChange={(e) =>
                      setExtractionFormData({
                        ...extractionFormData,
                        label_key: e.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Regex Pattern</label>
                  <Input
                    type="text"
                    placeholder="e.g., ^(.*?)_alert$"
                    value={extractionFormData.regex_pattern}
                    onChange={(e) =>
                      setExtractionFormData({
                        ...extractionFormData,
                        regex_pattern: e.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Output Key</label>
                  <Input
                    type="text"
                    placeholder="e.g., service"
                    value={extractionFormData.output_key}
                    onChange={(e) =>
                      setExtractionFormData({
                        ...extractionFormData,
                        output_key: e.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <Input
                    type="text"
                    placeholder="e.g., Extracts service name from alert"
                    value={extractionFormData.description}
                    onChange={(e) =>
                      setExtractionFormData({
                        ...extractionFormData,
                        description: e.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={extractionFormData.priority}
                    onChange={(e) =>
                      setExtractionFormData({
                        ...extractionFormData,
                        priority: parseInt(e.currentTarget.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={extractionFormData.enabled}
                      onChange={(e) =>
                        setExtractionFormData({
                          ...extractionFormData,
                          enabled: e.currentTarget.checked,
                        })
                      }
                    />
                    Enabled
                  </label>
                </div>
                <div className="form-actions">
                  <Button onClick={handleSaveExtraction} disabled={loading}>
                    {editingExtractionId ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={resetExtractionForm} variant="secondary" disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {extractionRules.length === 0 ? (
              <div className="empty-state">No extraction rules yet. Create one to get started.</div>
            ) : (
              <div className="rules-list">
                {extractionRules.map((rule) => (
                  <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="card-header">
                      <h4>{rule.name}</h4>
                      <span className={`status-badge ${rule.enabled ? 'active' : 'inactive'}`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="card-content">
                      <div className="rule-detail">
                        <span className="label">Source Label:</span>
                        <span className="value">{rule.label_key}</span>
                      </div>
                      <div className="rule-detail">
                        <span className="label">Regex:</span>
                        <span className="value monospace">{rule.regex_pattern}</span>
                      </div>
                      <div className="rule-detail">
                        <span className="label">Output:</span>
                        <span className="value">{rule.output_key}</span>
                      </div>
                      {rule.description && (
                        <div className="rule-detail">
                          <span className="label">Description:</span>
                          <span className="value">{rule.description}</span>
                        </div>
                      )}
                      <div className="rule-detail">
                        <span className="label">Priority:</span>
                        <span className="value">{rule.priority}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <Button
                        onClick={() => handleToggleExtraction(rule.id, rule.enabled)}
                        variant={rule.enabled ? 'destructive' : 'secondary'}
                        size="sm"
                        disabled={loading}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingExtractionId(rule.id);
                          setExtractionFormData({
                            name: rule.name,
                            label_key: rule.label_key,
                            regex_pattern: rule.regex_pattern,
                            output_key: rule.output_key,
                            description: rule.description || '',
                            enabled: rule.enabled,
                            priority: rule.priority,
                          });
                          setShowExtractionForm(true);
                        }}
                        size="sm"
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteExtraction(rule.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};
