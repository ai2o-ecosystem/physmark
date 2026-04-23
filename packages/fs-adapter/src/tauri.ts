/**
 * Tauri v2 File System Adapter
 * Accesses Tauri APIs via the window.__TAURI__ runtime object,
 * so no static or dynamic import of Tauri packages is needed in web builds.
 */

import type { IFileSystemAdapter, OpenDialogOptions, FileEntry, WatchEvent } from './types';

function dialog(): any {
  return (window as any).__TAURI__?.dialog ?? (window as any).__TAURI_PLUGIN_DIALOG__;
}

function fs(): any {
  return (window as any).__TAURI__?.fs ?? (window as any).__TAURI_PLUGIN_FS__;
}

export class TauriFileSystemAdapter implements IFileSystemAdapter {
  async openDialog(options: OpenDialogOptions): Promise<string[] | null> {
    const result = await dialog().open({
      multiple: options.multiple ?? false,
      directory: options.directory ?? false,
      filters: options.filters,
    });
    if (result === null) return null;
    return Array.isArray(result) ? result : [result];
  }

  async readTextFile(path: string): Promise<string> {
    return fs().readTextFile(path);
  }

  async readBinaryFile(path: string): Promise<Uint8Array> {
    return fs().readFile(path);
  }

  async readDir(path: string): Promise<FileEntry[]> {
    const entries: any[] = await fs().readDir(path);
    return entries.map((e) => ({
      name: e.name ?? '',
      path: e.path ?? `${path}/${e.name}`,
      isDirectory: e.isDirectory ?? false,
    }));
  }

  async readDirRecursive(path: string): Promise<FileEntry[]> {
    const entries = await this.readDir(path);
    const result: FileEntry[] = [];
    for (const entry of entries) {
      result.push(entry);
      if (entry.isDirectory) {
        result.push(...await this.readDirRecursive(entry.path));
      }
    }
    return result;
  }

  watchFile(path: string, cb: (e: WatchEvent) => void): () => void {
    let unwatch: (() => void) | undefined;
    fs().watch(path, () => cb({ type: 'modified', path }))
      .then((u: any) => { unwatch = u; });
    return () => { unwatch?.(); };
  }
}
