/**
 * @physmark/core — Document parser
 * Dynamically builds regex from registered languages, no hardcoded "physmark"
 */

import type { PhysMarkDocumentNode, PhysMarkParsedBlock } from './types';

export function parseDocument(
  markdown: string,
  registeredLanguages: string[]
): PhysMarkDocumentNode[] {
  if (registeredLanguages.length === 0) {
    return [{ type: 'markdown', content: markdown }];
  }

  const langPattern = registeredLanguages.map(escapeRegex).join('|');
  const regex = new RegExp(
    '```(' + langPattern + ')\\n([\\s\\S]*?)```',
    'g'
  );

  const nodes: PhysMarkDocumentNode[] = [];
  let lastIndex = 0;
  let lineOffset = 0;

  for (const match of markdown.matchAll(regex)) {
    const matchIndex = match.index!;

    if (matchIndex > lastIndex) {
      const textContent = markdown.slice(lastIndex, matchIndex);
      if (textContent.trim()) {
        nodes.push({ type: 'markdown', content: textContent });
      }
    }

    const language = match[1];
    const rawContent = match[2].trim();
    const linesBefore = markdown.slice(0, matchIndex).split('\n').length;

    let parsedConfig: unknown;
    try {
      parsedConfig = JSON.parse(rawContent);
    } catch {
      parsedConfig = undefined;
    }

    const block: PhysMarkParsedBlock = {
      language,
      rawContent,
      parsedConfig,
      position: { line: linesBefore },
    };

    nodes.push({ type: 'plugin-block', block });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < markdown.length) {
    const textContent = markdown.slice(lastIndex);
    if (textContent.trim()) {
      nodes.push({ type: 'markdown', content: textContent });
    }
  }

  return nodes;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
