import React, { useState } from 'react';
import type { FileEntry } from '@physmark/fs-adapter';

interface FileTreeProps {
  entries: FileEntry[];
  activeFile?: string;
  onFileClick: (path: string) => void;
  indent?: number;
  parentPath?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  entries,
  activeFile,
  onFileClick,
  indent = 0,
  parentPath = '',
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Get entries that are direct children of parentPath
  const getDirectChildren = (entry: FileEntry): boolean => {
    if (!parentPath) {
      // Root level: entries at depth 1 (e.g., "mydir/file.md" or "mydir/subdir")
      const parts = entry.path.split('/');
      return parts.length === 2;
    }
    // Check if entry is a direct child of parentPath
    const parentDepth = parentPath.split('/').length;
    const entryDepth = entry.path.split('/').length;
    return entry.path.startsWith(parentPath + '/') && entryDepth === parentDepth + 1;
  };

  const currentEntries = entries.filter(getDirectChildren);
  const dirs = currentEntries.filter((e) => e.isDirectory);
  const files = currentEntries.filter((e) => !e.isDirectory && e.name.endsWith('.md'));

  return (
    <>
      {dirs.map((dir) => {
        const isExpanded = expandedDirs.has(dir.path);
        return (
          <div key={dir.path}>
            <div
              className="physmark-file-tree-item directory"
              style={{ paddingLeft: `${14 + indent * 12}px` }}
              onClick={() => toggleDir(dir.path)}
            >
              <span className="physmark-folder-chevron">{isExpanded ? '▼' : '▶'}</span>
              <span className="physmark-folder-icon">{isExpanded ? '📂' : '📁'}</span>
              <span className="physmark-folder-name">{dir.name}</span>
            </div>
            {isExpanded && (
              <FileTree
                entries={entries}
                activeFile={activeFile}
                onFileClick={onFileClick}
                indent={indent + 1}
                parentPath={dir.path}
              />
            )}
          </div>
        );
      })}
      {files.map((file) => (
        <div
          key={file.path}
          className={`physmark-file-tree-item${activeFile === file.path ? ' active' : ''}`}
          style={{ paddingLeft: `${14 + indent * 12}px` }}
          onClick={() => onFileClick(file.path)}
        >
          📄 {file.name}
        </div>
      ))}
    </>
  );
};
