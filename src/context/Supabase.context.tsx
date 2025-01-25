import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

type SupabaseContextType = SupabaseClient | null

const SupabaseContext = createContext<SupabaseContextType>(null)

interface SupabaseProviderProps {
  children: ReactNode
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
}) => {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), [])

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = (): SupabaseClient => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
