import './ErrorState.css';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description: string;
  suggestion: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description,
  suggestion,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__description">{description}</p>
      <p className="error-state__suggestion">{suggestion}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
