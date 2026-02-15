import React from 'react';
import './WorkspaceLayout.css';

export interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ children }) => {
  return (
    <div className="workspace-layout">
      {children}
    </div>
  );
};
