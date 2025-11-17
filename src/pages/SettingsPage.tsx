import React, { useState, useEffect } from 'react';
import { Container, Input, Button } from '@grafana/ui';
import apiClient from '@/api/client';
import './SettingsPage.css';

/**
 * Plugin Settings Page
 * Configure API endpoints and authentication
 */
export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_url') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('api_key') || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedUrl = localStorage.getItem('api_url');
    const savedKey = localStorage.getItem('api_key');
    if (savedUrl) setApiUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save to localStorage
      localStorage.setItem('api_url', apiUrl);
      localStorage.setItem('api_key', apiKey);

      // Update API client
      apiClient.setConfig(apiUrl, apiKey);

      // Test connection
      const testData = await apiClient.get('/api/health');
      console.log('Connection test successful:', testData);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings or test connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="settings-page">
        <div className="settings-page__header">
          <h1>Plugin Settings</h1>
          <p>Configure your API connection</p>
        </div>

        <form className="settings-page__form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="settings-page__group">
            <label className="settings-page__label">API Endpoint URL</label>
            <Input
              className="settings-page__input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.currentTarget.value)}
              placeholder="https://api.example.com"
              type="url"
            />
            <p className="settings-page__hint">The base URL of your API server</p>
          </div>

          <div className="settings-page__group">
            <label className="settings-page__label">API Key</label>
            <Input
              className="settings-page__input"
              value={apiKey}
              onChange={(e) => setApiKey(e.currentTarget.value)}
              placeholder="Your API key"
              type="password"
            />
            <p className="settings-page__hint">Used for authentication with your API</p>
          </div>

          <div className="settings-page__actions">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!apiUrl || loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>

            {saved && (
              <p className="settings-page__success">
                Settings saved successfully!
              </p>
            )}
          </div>
        </form>

        <div className="settings-page__info">
          <h3>After importing your Swagger file:</h3>
          <ul>
            <li>Update the API endpoints in src/api/services.ts</li>
            <li>Ensure your API server URL is configured above</li>
            <li>Test the connection by clicking "Save Settings"</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default SettingsPage;
