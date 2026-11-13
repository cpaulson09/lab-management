import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { SideNav } from "./SideNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SideNav />
      <main className="flex min-w-0 flex-1 flex-col gap-7 px-4 py-10 md:px-12">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
