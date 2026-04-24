import React, { useState } from 'react';
import { generatePhysMarkCode, loadAPIKey, saveAPIKey } from '../services/AIService';

interface AIGenerateDialogProps {
  onGenerate: (code: string) => void;
  onClose: () => void;
}

export const AIGenerateDialog: React.FC<AIGenerateDialogProps> = ({ onGenerate, onClose }) => {
  const [description, setDescription] = useState('');
  const [apiKey, setApiKey] = useState(loadAPIKey() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a scene description');
      return;
    }
    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCode('');

    try {
      // Save API key for future use
      saveAPIKey(apiKey);

      const code = await generatePhysMarkCode({
        apiKey,
        description,
        onProgress: (chunk) => {
          setGeneratedCode((prev) => prev + chunk);
        },
      });

      setGeneratedCode(code);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedCode) {
      onGenerate(`\`\`\`physmark\n${generatedCode}\n\`\`\``);
      onClose();
    }
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog-header">
          <h3>🤖 AI Generate PhysMark</h3>
          <button className="pm-dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="pm-dialog-body">
          <div className="pm-form-group">
            <label>Scene Description</label>
            <textarea
              className="pm-textarea"
              placeholder="Describe the animation or physics scene you want to create...&#10;&#10;Examples:&#10;- A red ball bouncing on the ground&#10;- Three boxes stacked on top of each other falling&#10;- A smooth animation of a circle moving left to right"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="pm-form-group">
            <label>
              Anthropic API Key
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="pm-link-small"
              >
                (Get one here)
              </a>
            </label>
            <input
              type="password"
              className="pm-input"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
            <small className="pm-help-text">
              Your API key is stored locally and never sent to our servers
            </small>
          </div>

          {error && (
            <div className="pm-error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          {generatedCode && (
            <div className="pm-form-group">
              <label>Generated Code</label>
              <pre className="pm-code-preview">{generatedCode}</pre>
            </div>
          )}
        </div>

        <div className="pm-dialog-footer">
          <button className="pm-btn pm-btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {generatedCode ? (
            <button className="pm-btn pm-btn-primary" onClick={handleInsert}>
              Insert Code
            </button>
          ) : (
            <button
              className="pm-btn pm-btn-primary"
              onClick={handleGenerate}
              disabled={loading || !description.trim() || !apiKey.trim()}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
