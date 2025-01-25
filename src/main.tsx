import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SupabaseProvider } from './context/Supabase.context.tsx'
import { AuthProvider } from './context/Auth.context.tsx'

createRoot(document.getElementById('root')!).render(
  <SupabaseProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SupabaseProvider>
)
