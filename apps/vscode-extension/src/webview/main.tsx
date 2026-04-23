import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { globalRegistry } from '@physmark/core';
import type { PhysMarkRenderContext } from '@physmark/core';
import { RapierPlugin } from '@physmark/plugin-rapier';
import { PhysMarkReader } from '@physmark/reader';
import { VSCodeFileSystemAdapter } from '@physmark/fs-adapter';
import { applyTheme, lightTheme } from '@physmark/theme';
import '@physmark/reader/style.css';

globalRegistry.register(RapierPlugin);
applyTheme(lightTheme);

const fsAdapter = new VSCodeFileSystemAdapter();

const App: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string>('');

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'update') {
        setContent(msg.content);
        setFilePath(msg.filePath ?? '');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (content === null) {
    return <div style={{ padding: 24, color: 'var(--pm-color-text-muted)' }}>Loading...</div>;
  }

  const context: PhysMarkRenderContext = {
    documentBasePath: filePath.replace(/[^/\\]+$/, ''),
    readFile: (path) => fsAdapter.readBinaryFile(path),
    theme: lightTheme,
    hostEnv: 'vscode',
  };

  return (
    <PhysMarkReader
      content={content}
      registry={globalRegistry}
      context={context}
    />
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
