import React from 'react';
import { createRoot } from 'react-dom/client';
import { globalRegistry } from '@physmark/core';
import { RapierPlugin } from '@physmark/plugin-rapier';
import { PhysMarkApp } from '@physmark/reader';
import { createFileSystemAdapter } from '@physmark/fs-adapter';
import { applyTheme, lightTheme } from '@physmark/theme';

applyTheme(lightTheme);
globalRegistry.register(RapierPlugin);

const fsAdapter = createFileSystemAdapter('web');

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <PhysMarkApp
      fsAdapter={fsAdapter}
      registry={globalRegistry}
      theme="light"
      showSidebar={true}
    />
  </React.StrictMode>
);
