import React, { useRef, useCallback } from 'react';
import { PhysMarkReader } from '../PhysMarkReader';
import { EditorToolbar } from './EditorToolbar';
import type { PhysMarkReaderProps } from '../types';

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  readerProps: Omit<PhysMarkReaderProps, 'content'>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  onSave,
  readerProps,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }
    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd, value } = ta;
      const newValue = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.setSelectionRange(selectionStart + 2, selectionStart + 2);
      });
    }
  }, [onChange, onSave]);

  return (
    <div className="pm-editor-root">
      <EditorToolbar textareaRef={textareaRef} onChange={onChange} />
      <div className="pm-editor-panes">
        {/* Left: source */}
        <div className="pm-editor-source-pane">
          <textarea
            ref={textareaRef}
            className="pm-editor-textarea"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Divider */}
        <div className="pm-editor-split-divider" />

        {/* Right: preview */}
        <div className="pm-editor-preview-pane">
          <PhysMarkReader content={content} {...readerProps} />
        </div>
      </div>
    </div>
  );
};
