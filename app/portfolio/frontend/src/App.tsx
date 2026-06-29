import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { GuideChatLauncher } from '@/features/guide-chat/components/guide-chat-launcher'
import { router } from '@/router'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <GuideChatLauncher />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
