import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { AppSidebar } from "@/components/crm/AppSidebar";
import { MobileNav } from "@/components/crm/MobileNav";
import { MobileTopbar } from "@/components/crm/MobileTopbar";
import { meQueryOptions } from "@/hooks/use-me";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/app")({
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions);
    if (!me.orgId) throw redirect({ to: "/auth" });
    return null;
  },
  component: AppShell,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Not found.</div>
  ),
});

function AppShell() {
  return (
    <div className="min-h-screen flex bg-background">
      <Suspense fallback={<div className="w-64 border-r" />}>
        <AppSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 md:py-3 md:pr-3">
        <Suspense fallback={null}>
          <MobileTopbar />
        </Suspense>
        <main className="flex-1 px-4 md:px-10 py-6 md:py-10 pb-24 md:pb-10 overflow-x-hidden md:rounded-2xl md:border md:bg-surface md:shadow-sm">
          <Suspense
            fallback={
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>
            }
          >
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
    </div>
  );
}