import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="sfx-panel border-dashed px-6 py-16 text-center">
      <h2 className="sfx-title text-lg">{title}</h2>
      <p className="sfx-muted mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
