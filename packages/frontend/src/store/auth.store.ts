'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isAgeVerified: boolean
  profilePicture?: string | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/api/auth/login', { email, password })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
          await get().fetchMe()
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (registerData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/api/auth/register', registerData)
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
          await get().fetchMe()
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, refreshToken: null })
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          set({ user: data })
        } catch {
          set({ user: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
