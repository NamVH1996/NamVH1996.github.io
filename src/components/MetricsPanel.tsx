import React from 'react';
import { MetricData } from '@/api/services';
import './MetricsPanel.css';

interface Props {
  metrics: MetricData[];
}

/**
 * Metrics Panel Component
 * Display metrics data in a table/chart format
 */
const MetricsPanel: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="metrics-panel">
      <div className="metrics-panel__header">
        <h2>Metrics</h2>
        <p className="metrics-panel__count">{metrics.length} metrics</p>
      </div>

      {metrics.length === 0 ? (
        <div className="metrics-panel__empty">
          <p>No metrics available</p>
        </div>
      ) : (
        <div className="metrics-panel__content">
          <table className="metrics-panel__table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Value</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.label || 'Unnamed'}</td>
                  <td className="metrics-panel__value">
                    {typeof metric.value === 'number'
                      ? metric.value.toFixed(2)
                      : metric.value}
                  </td>
                  <td className="metrics-panel__time">
                    {new Date(metric.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;
