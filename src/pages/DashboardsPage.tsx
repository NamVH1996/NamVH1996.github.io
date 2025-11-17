import React, { useState, useEffect } from 'react';
import { Container } from '@grafana/ui';
import './DashboardsPage.css';

/**
 * Dashboards Management Page
 * Create, edit, and manage custom dashboards
 */
export const DashboardsPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Load dashboards from API
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await dashboardsService.getDashboards();
      // setDashboards(data);
    } catch (error) {
      console.error('Error loading dashboards:', error);
    }
  };

  return (
    <Container>
      <div className="dashboards-page">
        <div className="dashboards-page__header">
          <h1>Custom Dashboards</h1>
          <button className="dashboards-page__btn-new">
            + Create Dashboard
          </button>
        </div>

        {dashboards.length === 0 ? (
          <div className="dashboards-page__empty">
            <p>No dashboards yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="dashboards-page__grid">
            {dashboards.map((dashboard) => (
              <div key={dashboard.id} className="dashboards-page__item">
                <h3>{dashboard.name}</h3>
                <p>{dashboard.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default DashboardsPage;
