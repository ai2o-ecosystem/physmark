import React from 'react';
import type { FileEntry } from '@physmark/fs-adapter';

interface FileTreeProps {
  entries: FileEntry[];
  activeFile?: string;
  onFileClick: (path: string) => void;
  indent?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  entries,
  activeFile,
  onFileClick,
  indent = 0,
}) => {
  const dirs = entries.filter((e) => e.isDirectory);
  const files = entries.filter((e) => !e.isDirectory && e.name.endsWith('.md'));

  return (
    <>
      {dirs.map((dir) => (
        <div key={dir.path}>
          <div
            className="physmark-file-tree-item directory"
            style={{ paddingLeft: `${14 + indent * 12}px` }}
          >
            📁 {dir.name}
          </div>
          <FileTree
            entries={entries.filter((e) => e.path.startsWith(dir.path + '/') && e.path.split('/').length === dir.path.split('/').length + 1)}
            activeFile={activeFile}
            onFileClick={onFileClick}
            indent={indent + 1}
          />
        </div>
      ))}
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
