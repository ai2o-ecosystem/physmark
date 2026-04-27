/**
 * PhysMarkApp — top-level component
 * Manages fsAdapter, registry, theme, file state, edit mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import { globalRegistry } from '@physmark/core';
import type { PhysMarkRenderContext } from '@physmark/core';
import { applyTheme, lightTheme, darkTheme } from '@physmark/theme';
import type { FileEntry } from '@physmark/fs-adapter';
import { PhysMarkReader } from './PhysMarkReader';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { MarkdownEditor } from './components/MarkdownEditor';
import type { PhysMarkAppProps, PhysMarkTheme } from './types';
import './style.css';

export const PhysMarkApp: React.FC<PhysMarkAppProps> = ({
  fsAdapter,
  registry = globalRegistry,
  theme: initialTheme = 'light',
  showSidebar: initialShowSidebar = true,
  initialFilePath,
  initialDirectory,
}) => {
  const [theme, setTheme] = useState<PhysMarkTheme>(initialTheme);
  const [sidebarVisible, setSidebarVisible] = useState(initialShowSidebar);
  const [content, setContent] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | undefined>(initialFilePath);
  const [dirEntries, setDirEntries] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    applyTheme(theme === 'dark' ? darkTheme : lightTheme);
  }, [theme]);

  useEffect(() => {
    if (initialFilePath && fsAdapter) loadFile(initialFilePath);
  }, []);

  useEffect(() => {
    if (initialDirectory && fsAdapter) loadDirectory(initialDirectory);
  }, []);

  const loadFile = useCallback(async (path: string) => {
    if (!fsAdapter) return;
    try {
      setError(null);
      const text = await fsAdapter.readTextFile(path);
      setContent(text);
      setActiveFile(path);
      setDirty(false);
    } catch (e) {
      setError(`Failed to read file: ${(e as Error).message}`);
    }
  }, [fsAdapter]);

  const loadDirectory = useCallback(async (path: string) => {
    if (!fsAdapter) return;
    try {
      setError(null);
      const entries = await fsAdapter.readDirRecursive(path);
      setDirEntries(entries);
    } catch (e) {
      setError(`Failed to read directory: ${(e as Error).message}`);
    }
  }, [fsAdapter]);

  const handleOpenFile = useCallback(async () => {
    if (!fsAdapter) return;
    const paths = await fsAdapter.openDialog({
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    if (paths && paths[0]) await loadFile(paths[0]);
  }, [fsAdapter, loadFile]);

  const handleOpenDirectory = useCallback(async () => {
    if (!fsAdapter) return;
    const paths = await fsAdapter.openDialog({ directory: true });
    if (paths && paths[0]) await loadDirectory(paths[0]);
  }, [fsAdapter, loadDirectory]);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!fsAdapter || !activeFile || content === null) return;
    if (!fsAdapter.writeTextFile) {
      setError('Save is not supported in this environment');
      return;
    }
    try {
      await fsAdapter.writeTextFile(activeFile, content);
      setDirty(false);
    } catch (e) {
      setError(`Failed to save: ${(e as Error).message}`);
    }
  }, [fsAdapter, activeFile, content]);

  const renderContext: PhysMarkRenderContext = {
    documentBasePath: activeFile ? activeFile.replace(/[^/\\]+$/, '') : '',
    readFile: async (path: string) => {
      if (!fsAdapter) throw new Error('No file system adapter');
      return fsAdapter.readBinaryFile(path);
    },
    theme: theme === 'dark' ? darkTheme : lightTheme,
    hostEnv: 'web',
  };

  return (
    <div className="physmark-app">
      <div className="physmark-main">
        <Toolbar
          onOpenFile={handleOpenFile}
          onOpenDirectory={handleOpenDirectory}
          theme={theme}
          onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          sidebarVisible={sidebarVisible}
          onSidebarToggle={() => setSidebarVisible((v) => !v)}
          hasAdapter={!!fsAdapter}
          editMode={editMode}
          onEditModeToggle={() => setEditMode((v) => !v)}
          dirty={dirty}
          onSave={handleSave}
          canSave={!!fsAdapter && !!activeFile && !!fsAdapter.writeTextFile}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            visible={sidebarVisible}
            entries={dirEntries}
            activeFile={activeFile}
            onFileClick={loadFile}
          />
          <div className="physmark-content">
            {error && (
              <div className="physmark-error" style={{ margin: 16 }}>
                <div className="error-header">Error</div>
                <div className="error-body">{error}</div>
              </div>
            )}
            {content !== null ? (
              editMode ? (
                <MarkdownEditor
                  content={content}
                  onChange={handleContentChange}
                  onSave={handleSave}
                  readerProps={{ registry, context: renderContext }}
                />
              ) : (
                <PhysMarkReader
                  content={content}
                  registry={registry}
                  context={renderContext}
                />
              )
            ) : (
              <div className="physmark-empty">
                {fsAdapter ? 'Open a file or directory to get started' : 'No content to display'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
