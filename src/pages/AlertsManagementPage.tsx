import React, { useState, useEffect } from 'react';
import { Container, Button, Input, Select, Pagination, Table } from '@grafana/ui';
import { alertsService, Alert } from '@/api/swagger';
import './AlertsManagementPage.css';

export const AlertsManagementPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filters
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Stats
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: Record<string, string> = {};
      if (severity) filters.severity = severity;
      if (status) filters.status = status;
      if (processingStatus) filters.processing_status = processingStatus;

      const response = await alertsService.listAlerts(limit, offset, filters);
      if (response.data) {
        setAlerts(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await alertsService.getStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleFilterChange = () => {
    setOffset(0);
    loadAlerts();
  };

  const handleViewDetail = async (alert: Alert) => {
    try {
      const response = await alertsService.getAlert(alert.id);
      if (response.data) {
        setSelectedAlert(response.data);
        setShowDetail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alert details');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#f84840';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#999';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'firing' ? '🔴 Firing' : '✅ Resolved';
  };

  return (
    <Container>
      <div className="alerts-page">
        <h1>Alert Management</h1>

        {/* Statistics */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Alerts</div>
              <div className="stat-value">{stats.alert_logs?.total || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sent</div>
              <div className="stat-value" style={{ color: '#4caf50' }}>
                {stats.alert_logs?.sent || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Failed</div>
              <div className="stat-value" style={{ color: '#f84840' }}>
                {stats.alert_logs?.failed || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: '#ff9800' }}>
                {stats.alert_logs?.pending || 0}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label>Severity</label>
              <Select
                options={[
                  { label: 'All', value: '' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'Warning', value: 'warning' },
                  { label: 'Info', value: 'info' },
                ]}
                value={severity}
                onChange={(e) => setSeverity(e.value || '')}
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <Select
                options={[
                  { label: 'All', value: '' },
                  { label: 'Firing', value: 'firing' },
                  { label: 'Resolved', value: 'resolved' },
                ]}
                value={status}
                onChange={(e) => setStatus(e.value || '')}
              />
            </div>

            <div className="filter-group">
              <label>Processing Status</label>
              <Select
                options={[
                  { label: 'All', value: '' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Sent', value: 'sent' },
                  { label: 'Failed', value: 'failed' },
                ]}
                value={processingStatus}
                onChange={(e) => setProcessingStatus(e.value || '')}
              />
            </div>

            <Button variant="primary" onClick={handleFilterChange} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Alerts List */}
        <div className="alerts-list-section">
          <h3>Alerts ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <div className="empty-state">No alerts found</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="alerts-table">
                  <thead>
                    <tr>
                      <th>Alert Name</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Processing Status</th>
                      <th>Started At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="alert-name">{alert.alert_name}</td>
                        <td>
                          <span
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td>{getStatusBadge(alert.status)}</td>
                        <td>
                          <span className={`status-${alert.processing_status}`}>
                            {alert.processing_status}
                          </span>
                        </td>
                        <td className="timestamp">
                          {new Date(alert.starts_at).toLocaleString()}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDetail(alert)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={Math.floor(offset / limit) + 1}
                numberOfPages={Math.ceil(alerts.length / limit) + 1}
                onNavigate={(page) => setOffset((page - 1) * limit)}
              />
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetail && selectedAlert && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedAlert.alert_name}</h2>
                <button className="close-btn" onClick={() => setShowDetail(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedAlert.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{getStatusBadge(selectedAlert.status)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Severity:</span>
                    <span className="detail-value">{selectedAlert.severity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Summary:</span>
                    <span className="detail-value">{selectedAlert.summary}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedAlert.description}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Started:</span>
                    <span className="detail-value">
                      {new Date(selectedAlert.starts_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="labels-section">
                  <h4>Labels</h4>
                  <div className="labels-grid">
                    {Object.entries(selectedAlert.labels).map(([key, value]) => (
                      <div key={key} className="label-item">
                        <span className="label-key">{key}:</span>
                        <span className="label-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowDetail(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AlertsManagementPage;
