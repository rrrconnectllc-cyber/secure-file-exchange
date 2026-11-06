import Link from 'next/link';

interface LogoProps {
  href?: string;
  inverted?: boolean;
  wordmark?: string;
}

export function Logo({ href = '/', inverted = false, wordmark = 'SFX' }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 text-inherit hover:text-inherit">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-cerulean text-sm font-bold text-white">
        SF
      </span>
      <span className={`text-xl font-bold tracking-tight ${inverted ? 'text-white' : 'text-navy'}`}>
        {wordmark}
      </span>
    </Link>
  );
}
