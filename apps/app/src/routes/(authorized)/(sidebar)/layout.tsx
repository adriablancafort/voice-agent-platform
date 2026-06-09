import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

export const Route = createFileRoute("/(authorized)/(sidebar)")({
  component: Layout,
})

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
