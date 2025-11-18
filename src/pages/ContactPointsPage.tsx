import React, { useState, useEffect } from 'react';
import { Container, Button, Input, Select } from '@grafana/ui';
import { contactPointsService, ContactPoint, ContactPointCreate } from '@/api/swagger';
import './ContactPointsPage.css';

export const ContactPointsPage: React.FC = () => {
  const [contactPoints, setContactPoints] = useState<ContactPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactPointCreate>({
    name: '',
    type: 'telegram',
    config: {},
    match_logic: 'ALL',
    label_mappings: [],
    enabled: true,
  });

  useEffect(() => {
    loadContactPoints();
  }, []);

  const loadContactPoints = async () => {
    try {
      setLoading(true);
      const response = await contactPointsService.list();
      if (response) {
        setContactPoints(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact points');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingId) {
        await contactPointsService.update(editingId, formData);
      } else {
        await contactPointsService.create(formData);
      }
      resetForm();
      loadContactPoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact point');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact point?')) {
      try {
        await contactPointsService.delete(id);
        loadContactPoints();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete contact point');
      }
    }
  };

  const handleEdit = (cp: ContactPoint) => {
    setFormData({
      name: cp.name,
      type: cp.type,
      config: cp.config,
      match_logic: cp.match_logic,
      label_mappings: cp.label_mappings,
      group_name: cp.group_name,
      priority: cp.priority,
      enabled: cp.enabled,
    });
    setEditingId(cp.id);
    setShowForm(true);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      if (enabled) {
        await contactPointsService.disable(id);
      } else {
        await contactPointsService.enable(id);
      }
      loadContactPoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle contact point');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'telegram',
      config: {},
      match_logic: 'ALL',
      label_mappings: [],
      enabled: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      telegram: '📱',
      slack: '💬',
      webhook: '🔗',
      email: '📧',
    };
    return icons[type] || '📌';
  };

  return (
    <Container>
      <div className="contact-points-page">
        <div className="page-header">
          <h1>Contact Points</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Contact Point'}
          </Button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="form-section">
            <h2>{editingId ? 'Edit Contact Point' : 'Create New Contact Point'}</h2>

            <div className="form-group">
              <label>Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                placeholder="e.g., Critical Alerts Telegram"
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <Select
                options={[
                  { label: '📱 Telegram', value: 'telegram' },
                  { label: '💬 Slack', value: 'slack' },
                  { label: '🔗 Webhook', value: 'webhook' },
                  { label: '📧 Email', value: 'email' },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.value || 'telegram' })}
              />
            </div>

            <div className="form-group">
              <label>Match Logic</label>
              <Select
                options={[
                  { label: 'ALL (AND) - All labels must match', value: 'ALL' },
                  { label: 'ANY (OR) - At least one label must match', value: 'ANY' },
                ]}
                value={formData.match_logic}
                onChange={(e) => setFormData({ ...formData, match_logic: e.value || 'ALL' })}
              />
            </div>

            <div className="form-group">
              <label>Group Name (Optional)</label>
              <Input
                value={formData.group_name || ''}
                onChange={(e) => setFormData({ ...formData, group_name: e.currentTarget.value })}
                placeholder="For priority-based routing"
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <Input
                type="number"
                value={formData.priority || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.currentTarget.value) || 0 })
                }
              />
            </div>

            <div className="form-actions">
              <Button variant="primary" onClick={handleSave} disabled={!formData.name || loading}>
                {loading ? 'Saving...' : 'Save Contact Point'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="list-section">
          <h2>Contact Points ({contactPoints.length})</h2>

          {contactPoints.length === 0 ? (
            <div className="empty-state">
              No contact points configured. Create one to route alerts.
            </div>
          ) : (
            <div className="contact-points-grid">
              {contactPoints.map((cp) => (
                <div key={cp.id} className="contact-point-card">
                  <div className="card-header">
                    <span className="type-icon">{getTypeIcon(cp.type)}</span>
                    <h3>{cp.name}</h3>
                    <span className={`enabled-badge ${cp.enabled ? 'active' : 'inactive'}`}>
                      {cp.enabled ? '✓ Enabled' : '✕ Disabled'}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="value">{cp.type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Match Logic:</span>
                      <span className="value">{cp.match_logic}</span>
                    </div>
                    {cp.group_name && (
                      <div className="detail-row">
                        <span className="label">Group:</span>
                        <span className="value">{cp.group_name}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Priority:</span>
                      <span className="value">{cp.priority}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Routes To:</span>
                      <span className="value">
                        {cp.label_mappings.length === 0 ? 'All Alerts' : `${cp.label_mappings.length} label(s)`}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(cp)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={cp.enabled ? 'destructive' : 'secondary'}
                      onClick={() => handleToggle(cp.id, cp.enabled)}
                    >
                      {cp.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cp.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ContactPointsPage;
