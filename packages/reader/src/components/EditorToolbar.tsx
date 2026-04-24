import React from 'react';

export interface InsertCommand {
  label: string;
  title: string;
  prefix: string;
  suffix?: string;
  block?: boolean; // insert on new line
  placeholder?: string;
}

const COMMANDS: InsertCommand[] = [
  { label: 'H1', title: 'Heading 1', prefix: '# ', block: true, placeholder: 'Heading' },
  { label: 'H2', title: 'Heading 2', prefix: '## ', block: true, placeholder: 'Heading' },
  { label: 'H3', title: 'Heading 3', prefix: '### ', block: true, placeholder: 'Heading' },
  { label: '|', title: 'Divider', prefix: '' },
  { label: 'B', title: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic', prefix: '_', suffix: '_', placeholder: 'italic text' },
  { label: '~~', title: 'Strikethrough', prefix: '~~', suffix: '~~', placeholder: 'text' },
  { label: '`', title: 'Inline code', prefix: '`', suffix: '`', placeholder: 'code' },
  { label: '|', title: 'Divider', prefix: '' },
  { label: '≡', title: 'Bullet list', prefix: '- ', block: true, placeholder: 'item' },
  { label: '1.', title: 'Numbered list', prefix: '1. ', block: true, placeholder: 'item' },
  { label: '☐', title: 'Task list', prefix: '- [ ] ', block: true, placeholder: 'task' },
  { label: '❝', title: 'Blockquote', prefix: '> ', block: true, placeholder: 'quote' },
  { label: '|', title: 'Divider', prefix: '' },
  { label: '```', title: 'Code block', prefix: '```\n', suffix: '\n```', block: true, placeholder: 'code' },
  { label: '$$', title: 'Math block', prefix: '$$\n', suffix: '\n$$', block: true, placeholder: 'LaTeX' },
  { label: '🔗', title: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
  { label: '—', title: 'Horizontal rule', prefix: '\n---\n', block: true, placeholder: '' },
  { label: '|', title: 'Divider', prefix: '' },
  { label: '⚡ physmark', title: 'physmark block', prefix: '```physmark\ntype: physics\n', suffix: '\n```', block: true, placeholder: '' },
];

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  cmd: InsertCommand,
): string {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  const placeholder = cmd.placeholder ?? '';

  let insertion: string;
  let newCursorStart: number;
  let newCursorEnd: number;

  if (cmd.prefix === '' && !cmd.suffix) {
    // divider — no-op
    return value;
  }

  if (cmd.block) {
    // Insert on its own line
    const beforeCursor = value.slice(0, start);
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const prefix = (needsNewlineBefore ? '\n' : '') + cmd.prefix;
    const suffix = cmd.suffix ?? '';
    const inner = selected || placeholder;
    insertion = prefix + inner + suffix;
    const insertAt = start;
    const newValue = value.slice(0, insertAt) + insertion + value.slice(end);
    newCursorStart = insertAt + prefix.length;
    newCursorEnd = newCursorStart + inner.length;
    // Apply
    textarea.focus();
    textarea.setRangeText(insertion, insertAt, end, 'end');
    textarea.setSelectionRange(newCursorStart, newCursorEnd);
    return newValue;
  } else {
    const suffix = cmd.suffix ?? '';
    const inner = selected || placeholder;
    insertion = cmd.prefix + inner + suffix;
    const newValue = value.slice(0, start) + insertion + value.slice(end);
    newCursorStart = start + cmd.prefix.length;
    newCursorEnd = newCursorStart + inner.length;
    textarea.focus();
    textarea.setRangeText(insertion, start, end, 'end');
    textarea.setSelectionRange(newCursorStart, newCursorEnd);
    return newValue;
  }
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ textareaRef, onChange }) => {
  const handleCommand = (cmd: InsertCommand) => {
    const textarea = textareaRef.current;
    if (!textarea || cmd.prefix === '') return;
    const newValue = insertAtCursor(textarea, cmd);
    onChange(newValue);
  };

  return (
    <div className="pm-editor-toolbar">
      {COMMANDS.map((cmd, i) => {
        if (cmd.label === '|') {
          return <div key={i} className="pm-editor-toolbar-divider" />;
        }
        return (
          <button
            key={i}
            title={cmd.title}
            className="pm-editor-toolbar-btn"
            onMouseDown={(e) => {
              // Prevent textarea from losing focus
              e.preventDefault();
              handleCommand(cmd);
            }}
          >
            {cmd.label}
          </button>
        );
      })}
    </div>
  );
};
