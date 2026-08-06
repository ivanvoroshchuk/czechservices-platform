import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCZK(cents: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(cents / 100)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' }).format(new Date(date))
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function getAvatarUrl(url?: string | null) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`
}
