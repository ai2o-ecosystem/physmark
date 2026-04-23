/**
 * VSCode File System Adapter
 * Bridges to the extension host via postMessage
 */

import type { IFileSystemAdapter, OpenDialogOptions, FileEntry } from './types';

type PendingRequest = { resolve: (v: any) => void; reject: (e: any) => void };

export class VSCodeFileSystemAdapter implements IFileSystemAdapter {
  private pending = new Map<string, PendingRequest>();
  private vscode: any;

  constructor() {
    this.vscode = (window as any).acquireVsCodeApi?.();
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg?.type === 'fs-response' && msg.id) {
        const p = this.pending.get(msg.id);
        if (p) {
          this.pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error));
          else p.resolve(msg.result);
        }
      }
    });
  }

  private request<T>(method: string, args: object): Promise<T> {
    const id = `${method}-${Date.now()}-${Math.random()}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.vscode?.postMessage({ type: 'fs-request', id, method, args });
    });
  }

  openDialog(options: OpenDialogOptions): Promise<string[] | null> {
    return this.request('openDialog', options);
  }

  async readTextFile(path: string): Promise<string> {
    const bytes = await this.readBinaryFile(path);
    return new TextDecoder().decode(bytes);
  }

  async readBinaryFile(path: string): Promise<Uint8Array> {
    const data = await this.request<number[]>('readBinaryFile', { path });
    return new Uint8Array(data);
  }

  readDir(path: string): Promise<FileEntry[]> {
    return this.request('readDir', { path });
  }

  readDirRecursive(path: string): Promise<FileEntry[]> {
    return this.request('readDirRecursive', { path });
  }
}
