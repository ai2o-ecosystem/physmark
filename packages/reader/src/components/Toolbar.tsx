import React, { useState } from 'react';
import type { PhysMarkTheme } from '../types';
import { SettingsDialog } from './SettingsDialog';

interface ToolbarProps {
  onOpenFile?: () => void;
  onOpenDirectory?: () => void;
  theme: PhysMarkTheme;
  onThemeToggle: () => void;
  sidebarVisible: boolean;
  onSidebarToggle: () => void;
  hasAdapter: boolean;
  editMode?: boolean;
  onEditModeToggle?: () => void;
  dirty?: boolean;
  onSave?: () => void;
  canSave?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenFile,
  onOpenDirectory,
  theme,
  onThemeToggle,
  sidebarVisible,
  onSidebarToggle,
  hasAdapter,
  editMode,
  onEditModeToggle,
  dirty,
  onSave,
  canSave,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="physmark-toolbar">
        <button onClick={onSidebarToggle} title="Toggle sidebar">
          {sidebarVisible ? '◀ Hide' : '▶ Show'}
        </button>
        {hasAdapter && (
          <>
            <button onClick={onOpenFile} title="Open file">Open File</button>
            <button onClick={onOpenDirectory} title="Open directory">Open Directory</button>
          </>
        )}
        <div className="physmark-toolbar-sep" />
        <button
          onClick={onEditModeToggle}
          className={editMode ? 'pm-toolbar-btn-active' : ''}
          title={editMode ? 'Switch to preview' : 'Switch to edit mode'}
        >
          {editMode ? '👁 Preview' : '✏ Edit'}
        </button>
        {editMode && canSave && (
          <button
            onClick={onSave}
            className={dirty ? 'pm-toolbar-btn-dirty' : ''}
            disabled={!dirty}
            title="Save file (Ctrl+S)"
          >
            {dirty ? '● Save' : 'Saved'}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
        <button onClick={() => setShowSettings(true)} title="Settings">
          ⚙
        </button>
      </div>
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </>
  );
};
