/**
 * PhysMarkReader — pure rendering component
 */

import React, { useMemo, useState } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import { parseDocument } from '@physmark/core';
import type { PhysMarkReaderProps } from './types';
import { Annotation } from './components/Annotation';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import './style.css';

function createMarked() {
  const marked = new Marked();

  // Annotation renderer for parsing ==text==[annotation]
  const annotationRenderer = {
    paragraph(text: string) {
      // Parse annotations: ==text==[annotation]
      let processedText = text;
      let hasAnnotations = false;

      // Create a span for annotation content replacement
      processedText = processedText.replace(
        /==([^=]+?)==\[([^\]]+?)\]/g,
        (match, text, annotation) => {
          hasAnnotations = true;
          return `<physmark-annotation data-text="${encodeURIComponent(text)}" data-annotation="${encodeURIComponent(annotation)}"></physmark-annotation>`;
        }
      );

      return `<p>${processedText}</p>`;
    }
  };

  marked.use(annotationRenderer);

  marked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }));

  marked.use(markedKatex({ throwOnError: false }));

  // GFM: tables, task lists, strikethrough are on by default in marked v13+
  marked.use({ gfm: true, breaks: false });

  return marked;
}

const markedInstance = createMarked();

export const PhysMarkReader: React.FC<PhysMarkReaderProps> = ({
  content,
  registry,
  context,
  className = '',
}) => {
  const languages = registry.getRegisteredLanguages();
  const nodes = useMemo(
    () => parseDocument(content, languages),
    [content, languages.join(',')]
  );

  return (
    <div className={`physmark-reader ${className}`}>
      {nodes.map((node, index) => {
        if (node.type === 'markdown') {
          return (
            <div
              key={index}
              className="physmark-text"
              dangerouslySetInnerHTML={{
                __html: markedInstance.parse(node.content) as string,
              }}
            />
          );
        }

        const { block } = node;
        const plugin = registry.getByLanguage(block.language);

        if (!plugin) {
          return (
            <div key={index} className="physmark-error">
              <div className="error-header">Plugin Not Found</div>
              <div className="error-body">
                No plugin registered for language "{block.language}".
              </div>
              <pre className="error-code">{block.rawContent}</pre>
            </div>
          );
        }

        try {
          return (
            <div key={index} className="physmark-plugin">
              {plugin.render(block, context)}
            </div>
          );
        } catch (error) {
          return (
            <div key={index} className="physmark-error">
              <div className="error-header">Plugin Render Error</div>
              <div className="error-body">{(error as Error).message}</div>
            </div>
          );
        }
      })}
    </div>
  );
};
