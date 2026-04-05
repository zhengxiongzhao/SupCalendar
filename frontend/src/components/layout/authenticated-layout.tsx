import { Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '@/context/layout-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { cn } from '@/lib/utils'

export function AuthenticatedLayout() {
  return (
    <LayoutProvider>
      <SidebarProvider>
        <SkipToMain />
        <AppSidebar />
        <SidebarInset
          className={cn(
            '@container/content',
            'has-data-[layout=fixed]:h-svh',
            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
          )}
        >
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}
