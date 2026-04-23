import React from 'react';
import type { PhysMarkTheme } from '../types';

interface ToolbarProps {
  onOpenFile?: () => void;
  onOpenDirectory?: () => void;
  theme: PhysMarkTheme;
  onThemeToggle: () => void;
  sidebarVisible: boolean;
  onSidebarToggle: () => void;
  hasAdapter: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenFile,
  onOpenDirectory,
  theme,
  onThemeToggle,
  sidebarVisible,
  onSidebarToggle,
  hasAdapter,
}) => (
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
    <div style={{ flex: 1 }} />
    <button onClick={onThemeToggle} title="Toggle theme">
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  </div>
);
