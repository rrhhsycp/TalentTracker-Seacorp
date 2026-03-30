"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:hidden">
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-10 p-0"
          aria-label="Abrir menú"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <span className="sr-only">Abrir menú</span>
          <div className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded bg-slate-900" />
            <span className="block h-0.5 w-5 rounded bg-slate-900" />
            <span className="block h-0.5 w-5 rounded bg-slate-900" />
          </div>
        </Button>
        <div className="ml-3 text-sm font-semibold text-slate-900">
          TalentTrack
        </div>
      </div>

      {mobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="pt-16 md:pl-60 md:pt-0">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
