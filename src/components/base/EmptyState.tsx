import './EmptyState.css';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 14h32" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="11" r="1" fill="currentColor" />
          <circle cx="13" cy="11" r="1" fill="currentColor" />
          <circle cx="17" cy="11" r="1" fill="currentColor" />
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
};
