import React from 'react';
import { ServiceHealth } from '@/api/services';
import './HealthStatusPanel.css';

interface Props {
  services: Record<string, ServiceHealth>;
}

/**
 * Health Status Panel Component
 * Display health status of all services
 */
const HealthStatusPanel: React.FC<Props> = ({ services }) => {
  const healthStatuses = Object.entries(services);

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'warning':
        return '⚠';
      case 'critical':
        return '✕';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'health-status__badge--success';
      case 'warning':
        return 'health-status__badge--warning';
      case 'critical':
        return 'health-status__badge--danger';
      default:
        return 'health-status__badge--unknown';
    }
  };

  return (
    <div className="health-status">
      <div className="health-status__header">
        <h2>Services Health</h2>
        <p className="health-status__count">{healthStatuses.length} services</p>
      </div>

      {healthStatuses.length === 0 ? (
        <div className="health-status__empty">
          <p>No services configured</p>
        </div>
      ) : (
        <div className="health-status__content">
          {healthStatuses.map(([serviceName, health]) => (
            <div key={serviceName} className="health-status__item">
              <div className="health-status__service-name">{serviceName}</div>
              <span className={`health-status__badge ${getStatusColor(health.status)}`}>
                {getStatusIcon(health.status)} {health.status}
              </span>
              <p className="health-status__message">{health.message}</p>
              <small className="health-status__time">
                Last check: {new Date(health.lastCheck).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthStatusPanel;
