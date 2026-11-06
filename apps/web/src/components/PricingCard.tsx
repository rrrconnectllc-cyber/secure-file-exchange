import { Button } from './Button';

interface PricingCardProps {
  name: string;
  price: string;
  cadence?: string;
  description: string;
  features: string[];
  href: string;
  cta: string;
  highlighted?: boolean;
}

export function PricingCard({
  name,
  price,
  cadence,
  description,
  features,
  href,
  cta,
  highlighted = false,
}: PricingCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl p-6 ${
        highlighted ? 'bg-navy text-white ring-2 ring-cerulean' : 'border border-navy/10 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className={`text-lg font-bold ${highlighted ? 'text-white' : 'text-navy'}`}>{name}</h3>
        {highlighted && (
          <span className="rounded-full bg-cerulean px-2.5 py-1 text-xs font-medium text-white">Most teams</span>
        )}
      </div>
      <p className={`mt-4 font-mono text-4xl font-semibold ${highlighted ? 'text-white' : 'text-navy'}`}>
        {price}
        {cadence && <span className={`ml-1 text-base font-sans font-medium ${highlighted ? 'text-white/70' : 'text-secondary-600'}`}>{cadence}</span>}
      </p>
      <p className={`mt-3 text-sm leading-6 ${highlighted ? 'text-white/80' : 'text-ink'}`}>{description}</p>
      <ul className={`mt-6 flex-1 space-y-2 text-sm ${highlighted ? 'text-white/90' : 'text-ink'}`}>
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="text-cerulean">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button href={href} variant={highlighted ? 'secondary' : 'outline'} className="mt-8 w-full">
        {cta}
      </Button>
    </article>
  );
}
