import React from 'react';
import './ContextHeader.css';

export interface ContextHeaderProps {
  headline: string;
  subtext?: string;
}

export const ContextHeader: React.FC<ContextHeaderProps> = ({
  headline,
  subtext,
}) => {
  return (
    <div className="context-header">
      <h1 className="context-header__headline">{headline}</h1>
      {subtext && <p className="context-header__subtext">{subtext}</p>}
    </div>
  );
};
