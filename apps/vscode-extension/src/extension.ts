import * as vscode from 'vscode';
import { PhysMarkEditorProvider } from './PhysMarkEditorProvider';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    PhysMarkEditorProvider.register(context)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('physmark.openEditor', (uri: vscode.Uri) => {
      vscode.commands.executeCommand(
        'vscode.openWith',
        uri,
        PhysMarkEditorProvider.viewType
      );
    })
  );
}

export function deactivate(): void {}
