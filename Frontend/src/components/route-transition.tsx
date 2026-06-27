'use client';
import { usePathname } from 'next/navigation';

/** Re-mounts (via key) on every route change so page content animates in. */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}
