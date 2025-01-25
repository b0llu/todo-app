import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './Supabase.context'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the current session when the app starts
    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error.message)
      }
      setSession(data.session)
      setUser(data.session?.user || null)
      setLoading(false)
    }
    initializeAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    // Sign up the user with email and password
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      return { error: error.message }
    }

    const { error: profileError } = await supabase.from('profile').insert({
      email,
      full_name: displayName,
      user_id: data?.user?.id,
    })

    if (profileError) {
      return { error: profileError.message }
    }

    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error?.message || null }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error: error?.message || null }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
