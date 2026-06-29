import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { RouteTransition } from '@/components/route-transition';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!store.get('sb-refresh-token')?.value) {
    redirect('/login');
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-9">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
