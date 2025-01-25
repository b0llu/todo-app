import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/Auth.context'

const PrivateRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-xl">Loading...</p>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute
