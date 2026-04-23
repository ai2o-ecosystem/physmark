/**
 * @physmark/reader — re-exports core types + reader-specific props
 */

export type {
  PhysMarkPlugin,
  PhysMarkPluginRegistry,
  PhysMarkRenderContext,
  PhysMarkParsedBlock,
  PhysMarkDocumentNode,
  PhysMarkThemeTokens,
} from '@physmark/core';

export type { IFileSystemAdapter, FileEntry } from '@physmark/fs-adapter';

import type { PhysMarkPluginRegistry } from '@physmark/core';
import type { IFileSystemAdapter } from '@physmark/fs-adapter';

export type PhysMarkTheme = 'light' | 'dark';

export interface PhysMarkReaderProps {
  content: string;
  registry: PhysMarkPluginRegistry;
  context: import('@physmark/core').PhysMarkRenderContext;
  className?: string;
}

export interface PhysMarkAppProps {
  fsAdapter?: IFileSystemAdapter;
  registry?: PhysMarkPluginRegistry;
  theme?: PhysMarkTheme;
  showSidebar?: boolean;
  initialFilePath?: string;
  initialDirectory?: string;
}
