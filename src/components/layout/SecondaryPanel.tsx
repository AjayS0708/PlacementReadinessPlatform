import React from 'react';
import { Button, Card } from '../base';
import './SecondaryPanel.css';

export interface SecondaryPanelProps {
  title: string;
  explanation: string;
  prompt?: string;
  onCopy?: () => void;
  onBuildInLovable?: () => void;
  onItWorked?: () => void;
  onError?: () => void;
  onAddScreenshot?: () => void;
}

export const SecondaryPanel: React.FC<SecondaryPanelProps> = ({
  title,
  explanation,
  prompt,
  onCopy,
  onBuildInLovable,
  onItWorked,
  onError,
  onAddScreenshot,
}) => {
  return (
    <div className="secondary-panel">
      <div className="secondary-panel__content">
        <h3 className="secondary-panel__title">{title}</h3>
        <p className="secondary-panel__explanation">{explanation}</p>
        
        {prompt && (
          <Card className="secondary-panel__prompt" padding="sm">
            <code className="secondary-panel__prompt-text">{prompt}</code>
          </Card>
        )}
        
        <div className="secondary-panel__actions">
          {onCopy && (
            <Button variant="secondary" onClick={onCopy}>
              Copy
            </Button>
          )}
          {onBuildInLovable && (
            <Button variant="primary" onClick={onBuildInLovable}>
              Build in Lovable
            </Button>
          )}
          {onItWorked && (
            <Button variant="secondary" onClick={onItWorked}>
              It Worked
            </Button>
          )}
          {onError && (
            <Button variant="secondary" onClick={onError}>
              Error
            </Button>
          )}
          {onAddScreenshot && (
            <Button variant="secondary" onClick={onAddScreenshot}>
              Add Screenshot
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
