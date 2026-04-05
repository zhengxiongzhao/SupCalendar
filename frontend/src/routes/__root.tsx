import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />
      </>
    )
  },
  notFoundComponent: () => (
    <div className='flex h-svh items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>404</h1>
        <p className='text-muted-foreground mt-2'>页面未找到</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className='flex h-svh items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>出错了</h1>
        <p className='text-muted-foreground mt-2'>{error.message}</p>
      </div>
    </div>
  ),
})
