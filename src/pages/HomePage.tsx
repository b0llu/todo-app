import React from 'react'
import { useAuth } from '../context/Auth.context'

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-700">
          Welcome, {user?.email}!
        </h1>
        <button
          onClick={() => signOut()}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default HomePage
