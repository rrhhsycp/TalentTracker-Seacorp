import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="pl-60">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
