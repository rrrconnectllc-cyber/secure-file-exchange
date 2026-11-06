interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-secondary-600" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy/20 border-t-cerulean" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
