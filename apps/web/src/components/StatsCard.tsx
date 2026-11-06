interface StatsCardProps {
  label: string;
  value: string | number;
  detail: string;
}

export function StatsCard({ label, value, detail }: StatsCardProps) {
  return (
    <article className="sfx-panel p-5">
      <p className="sfx-muted text-sm">{label}</p>
      <p className="sfx-title mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</p>
      <p className="sfx-muted mt-1 text-sm">{detail}</p>
    </article>
  );
}
