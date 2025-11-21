import { useAuth } from './features/auth/lib/auth-context'
import { LoginPage } from './features/auth/components/LoginPage'
import { Dashboard } from './features/dashboard/Dashboard'

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard />
}

export default App
