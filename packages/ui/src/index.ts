// Design system exports
// Component library for Secure File Exchange

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Colors = {
  primary: '#0066cc',
  secondary: '#6c757d',
  danger: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  light: '#f8f9fa',
  dark: '#212529',
} as const;

export const Spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const;

export const Typography = {
  h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
  h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  small: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
} as const;
