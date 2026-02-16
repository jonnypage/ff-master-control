import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/lib/auth-context'
import { ThemeProvider } from './components/ThemeProvider'
import {
  isUnauthenticatedError,
  triggerUnauthorized,
} from './lib/auth-error-handler'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        if (isUnauthenticatedError(error)) {
          triggerUnauthorized()
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (isUnauthenticatedError(error)) {
          triggerUnauthorized()
        }
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ff-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
