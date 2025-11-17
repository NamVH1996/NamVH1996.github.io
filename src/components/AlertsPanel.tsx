import React, { useState } from 'react';
import { Alert, alertsService } from '@/api/services';
import './AlertsPanel.css';

interface Props {
  alerts: Alert[];
}

/**
 * Alerts Panel Component
 * Display and manage active alerts
 */
const AlertsPanel: React.FC<Props> = ({ alerts }) => {
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      case 'critical':
        return '🔴';
      default:
        return '•';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'info':
        return 'alert__badge--info';
      case 'warning':
        return 'alert__badge--warning';
      case 'critical':
        return 'alert__badge--danger';
      default:
        return 'alert__badge--unknown';
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAcknowledging(alertId);
      await alertsService.acknowledgeAlert(alertId);
      // TODO: Refresh alerts list
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    } finally {
      setAcknowledging(null);
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="alerts-panel">
      <div className="alerts-panel__header">
        <h2>Active Alerts</h2>
        <p className="alerts-panel__count">{activeAlerts.length} alerts</p>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="alerts-panel__empty">
          <p>No active alerts - Everything looks good! ✓</p>
        </div>
      ) : (
        <div className="alerts-panel__content">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="alerts-panel__item">
              <div className="alerts-panel__alert">
                <div className="alerts-panel__top">
                  <span className={`alert__badge ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                  </span>
                  <h4 className="alerts-panel__title">{alert.title}</h4>
                </div>
                <small className="alerts-panel__time">
                  {new Date(alert.timestamp).toLocaleString()}
                </small>
                <button
                  className="alerts-panel__btn-ack"
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={acknowledging === alert.id}
                >
                  {acknowledging === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
