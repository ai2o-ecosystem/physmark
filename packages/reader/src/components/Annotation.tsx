import React, { useState } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';

interface AnnotationProps {
  text: string;
  annotation: string;
}

function createMarked() {
  const marked = new Marked();

  marked.use(markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }));

  marked.use(markedKatex({ throwOnError: false }));
  marked.use({ gfm: true, breaks: false });

  return marked;
}

const markedInstance = createMarked();

export const Annotation: React.FC<AnnotationProps> = ({ text, annotation }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasAnnotation, setHasAnnotation] = useState(annotation.trim().length > 0);

  const toggleExpanded = () => {
    if (hasAnnotation) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <span className="physmark-annotation-wrapper">
      <span className="physmark-annotation-text" onClick={toggleExpanded}>
        {text}
        {hasAnnotation && (
          <span className="physmark-annotation-badge">
            <span className="physmark-annotation-icon">💬</span>
          </span>
        )}
      </span>
      {hasAnnotation && expanded && (
        <div className="physmark-annotation-content">
          <div
            className="physmark-annotation-markdown"
            dangerouslySetInnerHTML={{
              __html: markedInstance.parse(annotation) as string,
            }}
          />
        </div>
      )}
    </span>
  );
};
