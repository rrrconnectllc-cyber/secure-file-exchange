import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="sfx-panel overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="sfx-table-head bg-cream text-secondary-600">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="border-t border-navy/10">{children}</tr>;
}

interface TableHeaderCellProps {
  children: ReactNode;
  onSort?: () => void;
  align?: 'left' | 'right';
}

export function TableHeaderCell({ children, onSort, align = 'left' }: TableHeaderCellProps) {
  const className = `px-4 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`;
  if (!onSort) {
    return (
      <th scope="col" className={className}>
        {children}
      </th>
    );
  }
  return (
    <th scope="col" className={className}>
      <button type="button" onClick={onSort} className="inline-flex items-center gap-1 text-secondary-700 hover:text-navy">
        {children}
      </button>
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-ink ${className}`}>{children}</td>;
}
