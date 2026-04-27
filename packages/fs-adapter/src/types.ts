/**
 * @physmark/fs-adapter — Unified file system interface
 */

export interface OpenDialogOptions {
  multiple?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
  directory?: boolean;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface WatchEvent {
  type: 'modified' | 'created' | 'deleted';
  path: string;
}

export interface IFileSystemAdapter {
  openDialog(options: OpenDialogOptions): Promise<string[] | null>;
  readTextFile(path: string): Promise<string>;
  readBinaryFile(path: string): Promise<Uint8Array>;
  readDir(path: string): Promise<FileEntry[]>;
  readDirRecursive(path: string): Promise<FileEntry[]>;
  writeTextFile?(path: string, content: string): Promise<void>;
  watchFile?(path: string, cb: (e: WatchEvent) => void): () => void;
}
