import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  href?: string;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-cerulean focus-visible:ring-cerulean disabled:bg-navy/40',
  secondary: 'bg-secondary-100 text-navy hover:bg-secondary-200 focus-visible:ring-secondary-500 disabled:bg-secondary-50',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 disabled:bg-danger-400',
  outline: 'border-2 border-navy text-navy hover:border-cerulean hover:text-cerulean focus-visible:ring-cerulean disabled:opacity-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      href,
      className = '',
      children,
      type,
      ...props
    },
    ref
  ) => {
    const classes = `
      inline-flex items-center justify-center rounded-lg font-medium
      transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-50
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    const content = (
      <>
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </>
    );

    if (href && !isLoading && !props.disabled) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props} type={type ?? 'button'} disabled={isLoading || props.disabled}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
