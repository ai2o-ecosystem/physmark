import React from 'react';
import type { FileEntry } from '@physmark/fs-adapter';
import { FileTree } from './FileTree';

interface SidebarProps {
  visible: boolean;
  entries: FileEntry[];
  activeFile?: string;
  onFileClick: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visible,
  entries,
  activeFile,
  onFileClick,
}) => (
  <div className={`physmark-sidebar${visible ? '' : ' collapsed'}`}>
    {visible && (
      <>
        <div className="physmark-sidebar-header">Files</div>
        <div className="physmark-file-tree">
          {entries.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--pm-color-text-muted)' }}>
              Open a directory to browse files
            </div>
          ) : (
            <FileTree entries={entries} activeFile={activeFile} onFileClick={onFileClick} />
          )}
        </div>
      </>
    )}
  </div>
);
