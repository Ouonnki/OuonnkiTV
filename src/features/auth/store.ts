import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  sessionToken: string | null
  salt: string | null
  isInitialized: boolean
}

interface AuthActions {
  login: (password: string) => Promise<boolean>
  logout: () => void
  validateSession: () => Promise<boolean>
}

type AuthStore = AuthState & AuthActions

// Helper to generate a random salt
const generateSalt = () => {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Helper to compute SHA-256 hash
const computeHash = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      salt: null,
      isInitialized: false,

      login: async (password: string) => {
        const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD
        // If no password configured, always allow
        if (!correctPassword) {
          return true
        }

        if (password === correctPassword) {
          const salt = generateSalt()
          const token = await computeHash(correctPassword + salt)
          set({ sessionToken: token, salt, isInitialized: true })
          return true
        }
        return false
      },

      logout: () => set({ sessionToken: null, salt: null, isInitialized: true }),

      validateSession: async () => {
        const { sessionToken, salt } = get()
        const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD

        // If no password configured, always valid
        if (!correctPassword) {
          return true
        }

        // If no token or salt, invalid
        if (!sessionToken || !salt) {
          return false
        }

        // Re-compute hash to verify
        const expectedToken = await computeHash(correctPassword + salt)
        if (sessionToken === expectedToken) {
          return true
        } else {
          // Invalid token (tampered or changed password), clear it
          set({ sessionToken: null, salt: null })
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({ sessionToken: state.sessionToken, salt: state.salt }),
    },
  ),
)
