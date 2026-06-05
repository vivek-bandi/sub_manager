import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import { getStoredToken } from './lib/session.js'
import './App.css'

function ProtectedRoute({ children }) {
  const token = getStoredToken()

  if (!token) {
    return <Navigate to="/signin" replace />
  }

  return children
}

function GuestRoute({ children }) {
  const token = getStoredToken()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getStoredToken() ? '/dashboard' : '/signin'} replace />} />
      <Route
        path="/signin"
        element={
          <GuestRoute>
            <SignInPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignUpPage />
          </GuestRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}

export default App
