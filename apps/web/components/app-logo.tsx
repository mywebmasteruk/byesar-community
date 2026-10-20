import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({ className }: { className?: string }) {
  return (
    <span className={cn('text-foreground inline-flex items-center gap-2', className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
        <rect x="1.5" y="1.5" width="25" height="25" rx="6" className="fill-primary" />
        <path
          d="M8 20V12.5C8 9.5 10.2 7.5 14 7.5C17.8 7.5 20 9.5 20 12.5V20"
          fill="none"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight">Community</span>
    </span>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link
      aria-label={label ?? 'Community'}
      href={href ?? '/'}
      className="focus-visible:ring-ring rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <LogoImage className={className} />
    </Link>
  );
}
