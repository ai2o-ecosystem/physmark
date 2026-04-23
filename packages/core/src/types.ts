/**
 * @physmark/core — Core type definitions
 */

import type React from 'react';

export interface PhysMarkSyntaxDeclaration {
  language: string;
  description: string;
  schema?: object;
}

export interface PhysMarkThemeTokens {
  colorBackground: string;
  colorSurface: string;
  colorBorder: string;
  colorText: string;
  colorTextMuted: string;
  colorAccent: string;
  colorError: string;
  colorErrorBg: string;
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: string;
  lineHeight: string;
  borderRadius: string;
}

export interface PhysMarkRenderContext {
  documentBasePath: string;
  readFile: (path: string) => Promise<Uint8Array>;
  theme: PhysMarkThemeTokens;
  hostEnv: 'web' | 'tauri' | 'vscode';
}

export interface PhysMarkParsedBlock {
  language: string;
  rawContent: string;
  parsedConfig?: unknown;
  position: { line: number };
}

export interface PhysMarkPlugin {
  id: string;
  name: string;
  version: string;
  syntaxDeclarations: PhysMarkSyntaxDeclaration[];
  initialize?(context: PhysMarkRenderContext): Promise<void>;
  render(block: PhysMarkParsedBlock, context: PhysMarkRenderContext): React.ReactElement;
  dispose?(): void;
}

export type PhysMarkDocumentNode =
  | { type: 'markdown'; content: string }
  | { type: 'plugin-block'; block: PhysMarkParsedBlock };
