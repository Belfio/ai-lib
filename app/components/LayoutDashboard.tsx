import { Outlet } from "@remix-run/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User } from "@/lib/types";

export default function LayoutDashboard({ user }: { user: User | null }) {
  const isLoggedIn = user !== null;
  if (isLoggedIn) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "20rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    );
  } else {
    return <Outlet />;
  }
}
