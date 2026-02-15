import React from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`checkbox-wrapper ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className="checkbox-input"
        {...props}
      />
      <label htmlFor={checkboxId} className="checkbox-label">
        {label}
      </label>
    </div>
  );
};
