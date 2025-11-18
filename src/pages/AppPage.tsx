import React, { useState, useEffect } from 'react';
import { Container, Spinner } from '@grafana/ui';
import { dashboardService, DashboardData } from '@/api/services';
import MetricsPanel from '@/components/MetricsPanel';
import HealthStatusPanel from '@/components/HealthStatusPanel';
import AlertsPanel from '@/components/AlertsPanel';
import './AppPage.css';

/**
 * Main Dashboard Page
 * Displays unified monitoring for all services and metrics
 */
export const AppPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <Container>
        <div className="app-page__loading">
          <Spinner />
          <p>Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="app-page">
        <div className="app-page__header">
          <h1>All-in-One Monitoring Dashboard</h1>
          <button
            className="app-page__refresh-btn"
            onClick={loadDashboardData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="app-page__navigation">
          <a href="/plugins/grafana-all-in-one-app/page/alerts" className="nav-link">
            📊 Alert Management
          </a>
          <a href="/plugins/grafana-all-in-one-app/page/contact-points" className="nav-link">
            📞 Contact Points
          </a>
          <a href="/plugins/grafana-all-in-one-app/page/data-enrichment" className="nav-link">
            🔍 Data Enrichment
          </a>
          <a href="/plugins/grafana-all-in-one-app/page/dashboards" className="nav-link">
            📈 Dashboards
          </a>
          <a href="/plugins/grafana-all-in-one-app/page/settings" className="nav-link">
            ⚙️ Settings
          </a>
        </div>

        {error && (
          <div className="app-page__error">
            <p>Error: {error}</p>
          </div>
        )}

        {dashboardData && (
          <div className="app-page__content">
            <div className="app-page__row">
              <div className="app-page__column">
                <HealthStatusPanel services={dashboardData.services} />
              </div>
              <div className="app-page__column">
                <AlertsPanel alerts={dashboardData.alerts} />
              </div>
            </div>

            <div className="app-page__row">
              <div className="app-page__column app-page__column--full">
                <MetricsPanel metrics={dashboardData.metrics} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AppPage;
