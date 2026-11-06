import React from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-primary-50 text-primary-800 border border-primary-200',
  success: 'bg-success-50 text-success-800 border border-success-200',
  warning: 'bg-warning-50 text-warning-800 border border-warning-200',
  danger: 'bg-danger-50 text-danger-800 border border-danger-200',
};

const iconColors: Record<AlertVariant, string> = {
  info: 'text-primary-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
};

const icons: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, onClose, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={`alert ${variantClasses[variant]} ${className}`}
        {...props}
      >
        <div className={`text-xl ${iconColors[variant]} flex-shrink-0`}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 flex-shrink-0 ml-3"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
