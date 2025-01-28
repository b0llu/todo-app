import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/Auth.context'
import { Snackbar } from '@mui/material'

const SignupPage: React.FC = () => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await signUp(email, password, displayName)
    setLoading(false)

    if (error) {
      setError(error)
    } else {
      setSnackbarOpen(true) // Show snackbar on success
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
    navigate('/login') // Redirect to login after snackbar closes
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign Up
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSignup()
          }}
        >
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-600"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg border-gray-400 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg border-gray-400 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg border-gray-400 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white font-semibold rounded-lg ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring focus:ring-blue-300'
            }`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        autoHideDuration={4000}
        message="Signup successful! Please check your email to verify your account."
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </div>
  )
}

export default SignupPage
