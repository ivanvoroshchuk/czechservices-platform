'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

function AuthHydrator() {
  const { fetchMe, accessToken } = useAuthStore()

  useEffect(() => {
    // If we have a token (from localStorage via Zustand persist),
    // but user object is null — fetch the profile on mount
    const token = accessToken || localStorage.getItem('accessToken')
    if (token) fetchMe()
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      {children}
    </QueryClientProvider>
  )
}
