import React, { useState, useEffect } from 'react';
import { saveAPIKey, loadAPIKey, clearAPIKey } from '../services/AIService';

interface SettingsDialogProps {
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadAPIKey();
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      saveAPIKey(trimmed);
    } else {
      clearAPIKey();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleClear = () => {
    clearAPIKey();
    setApiKey('');
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog-header">
          <h3>Settings</h3>
          <button className="pm-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="pm-dialog-body">
          <div className="pm-form-group">
            <label>
              Anthropic API Key
              <a
                className="pm-link-small"
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get key ↗
              </a>
            </label>
            <input
              type="password"
              className="pm-input"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
            />
            <span className="pm-help-text">
              Used for AI physmark generation. Stored locally in your browser.
            </span>
          </div>
        </div>
        <div className="pm-dialog-footer">
          <button className="pm-btn pm-btn-secondary" onClick={handleClear}>
            Clear Key
          </button>
          <button className="pm-btn pm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="pm-btn pm-btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
