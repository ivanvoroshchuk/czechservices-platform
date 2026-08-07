import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastState {
  toasts: Toast[]
  add: (type: ToastType, message: string) => void
  remove: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  add: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },

  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  success: (message) => useToastStore.getState().add('success', message),
  error:   (message) => useToastStore.getState().add('error',   message),
  info:    (message) => useToastStore.getState().add('info',    message),
}))
