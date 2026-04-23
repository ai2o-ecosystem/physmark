export * from './types';
export * from './web';
export * from './tauri';
export * from './vscode';

import type { IFileSystemAdapter } from './types';
import { WebFileSystemAdapter } from './web';
import { TauriFileSystemAdapter } from './tauri';

export function createFileSystemAdapter(env: 'web' | 'tauri'): IFileSystemAdapter {
  if (env === 'tauri') return new TauriFileSystemAdapter();
  return new WebFileSystemAdapter();
}
