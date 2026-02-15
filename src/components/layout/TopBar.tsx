import React from 'react';
import { Badge } from '../base';
import './TopBar.css';

export interface TopBarProps {
  projectName: string;
  currentStep?: number;
  totalSteps?: number;
  status?: 'Not Started' | 'In Progress' | 'Shipped';
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  currentStep,
  totalSteps,
  status = 'Not Started',
}) => {
  const getStatusVariant = () => {
    switch (status) {
      case 'Shipped':
        return 'success';
      case 'In Progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar__left">
        <span className="top-bar__project-name">{projectName}</span>
      </div>
      
      {currentStep && totalSteps && (
        <div className="top-bar__center">
          <span className="top-bar__progress">
            Step {currentStep} / {totalSteps}
          </span>
        </div>
      )}
      
      <div className="top-bar__right">
        <Badge variant={getStatusVariant()}>{status}</Badge>
      </div>
    </div>
  );
};
