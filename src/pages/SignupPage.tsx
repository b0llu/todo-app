import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/Auth.context'

const SignupPage: React.FC = () => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await signUp(email, password, displayName)
    setLoading(false)

    if (error) {
      setError(error)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-xl font-semibold text-gray-700 mb-6">Sign Up</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border rounded-md p-2 mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md p-2 mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md p-2 mb-6"
        />
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
