/**
 * Web File System Adapter
 * Uses File System Access API: showOpenFilePicker / showDirectoryPicker
 */

import type { IFileSystemAdapter, OpenDialogOptions, FileEntry, WatchEvent } from './types';

export class WebFileSystemAdapter implements IFileSystemAdapter {
  private handles = new Map<string, FileSystemFileHandle | FileSystemDirectoryHandle>();

  async openDialog(options: OpenDialogOptions): Promise<string[] | null> {
    try {
      if (options.directory) {
        // Request readwrite so we can save files later
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        const path = handle.name;
        this.handles.set(path, handle);
        return [path];
      } else {
        const types = options.filters?.map((f) => ({
          description: f.name,
          accept: { 'text/plain': f.extensions.map((e) => `.${e}`) },
        }));
        const handles: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
          multiple: options.multiple ?? false,
          types,
        });
        const paths = handles.map((h) => h.name);
        handles.forEach((h, i) => this.handles.set(paths[i], h));
        return paths;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return null;
      throw e;
    }
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    const handle = this.handles.get(path);
    if (!handle || handle.kind !== 'file') {
      throw new Error(`File not found in handle map: ${path}`);
    }
    const writable = await (handle as FileSystemFileHandle).createWritable();
    await writable.write(content);
    await writable.close();
  }

  async readTextFile(path: string): Promise<string> {
    const bytes = await this.readBinaryFile(path);
    return new TextDecoder().decode(bytes);
  }

  async readBinaryFile(path: string): Promise<Uint8Array> {
    const handle = this.handles.get(path);
    if (!handle || handle.kind !== 'file') {
      throw new Error(`File not found in handle map: ${path}`);
    }
    const file = await (handle as FileSystemFileHandle).getFile();
    return new Uint8Array(await file.arrayBuffer());
  }

  async readDir(path: string): Promise<FileEntry[]> {
    const handle = this.handles.get(path);
    if (!handle || handle.kind !== 'directory') {
      throw new Error(`Directory not found in handle map: ${path}`);
    }
    const entries: FileEntry[] = [];
    const dirHandle = handle as FileSystemDirectoryHandle;
    // @ts-ignore - entries() exists at runtime but may not be in all TS versions
    for await (const [name, child] of dirHandle.entries()) {
      const childPath = `${path}/${name}`;
      this.handles.set(childPath, child);
      entries.push({ name, path: childPath, isDirectory: child.kind === 'directory' });
    }
    return entries;
  }

  async readDirRecursive(path: string): Promise<FileEntry[]> {
    const entries = await this.readDir(path);
    const result: FileEntry[] = [];
    for (const entry of entries) {
      result.push(entry);
      if (entry.isDirectory) {
        const children = await this.readDirRecursive(entry.path);
        result.push(...children);
      }
    }
    return result;
  }
}
