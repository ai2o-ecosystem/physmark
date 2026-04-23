import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class PhysMarkEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly viewType = 'physmark.editor';

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new PhysMarkEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      PhysMarkEditorProvider.viewType,
      provider,
      { supportsMultipleEditorsPerDocument: false }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
      ],
    };

    webviewPanel.webview.html = this.getHtml(webviewPanel.webview);

    // Send initial content
    const sendContent = () => {
      webviewPanel.webview.postMessage({
        type: 'update',
        content: document.getText(),
        filePath: document.uri.fsPath,
      });
    };

    // Handle messages from webview
    webviewPanel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type !== 'fs-request') return;
      const { id, method, args } = msg;
      try {
        let result: unknown;
        if (method === 'readBinaryFile') {
          const data = await vscode.workspace.fs.readFile(vscode.Uri.file(args.path));
          result = Array.from(data);
        } else if (method === 'readDir') {
          result = await this.readDir(args.path);
        } else if (method === 'readDirRecursive') {
          result = await this.readDirRecursive(args.path);
        } else if (method === 'openDialog') {
          const uris = await vscode.window.showOpenDialog({
            canSelectMany: args.multiple ?? false,
            canSelectFolders: args.directory ?? false,
            filters: args.filters
              ? Object.fromEntries(args.filters.map((f: any) => [f.name, f.extensions]))
              : undefined,
          });
          result = uris ? uris.map((u) => u.fsPath) : null;
        }
        webviewPanel.webview.postMessage({ type: 'fs-response', id, result });
      } catch (e: any) {
        webviewPanel.webview.postMessage({ type: 'fs-response', id, error: e.message });
      }
    });

    // Watch for document changes
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        sendContent();
      }
    });

    webviewPanel.onDidDispose(() => changeSubscription.dispose());

    sendContent();
  }

  private async readDir(dirPath: string): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
    const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
    return entries.map(([name, type]) => ({
      name,
      path: path.join(dirPath, name),
      isDirectory: type === vscode.FileType.Directory,
    }));
  }

  private async readDirRecursive(dirPath: string): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
    const entries = await this.readDir(dirPath);
    const result = [...entries];
    for (const entry of entries) {
      if (entry.isDirectory) {
        const children = await this.readDirRecursive(entry.path);
        result.push(...children);
      }
    }
    return result;
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'style.css')
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:; worker-src blob:;" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>PhysMark</title>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body, #root { height: 100%; }</style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
