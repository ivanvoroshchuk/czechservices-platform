'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { useToastStore } from '@/store/toast.store'
import { api } from '@/lib/api'
import { formatDate, formatCZK } from '@/lib/utils'
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Flag, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Čeká na potvrzení', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Potvrzeno',          color: 'text-green-700 bg-green-50 border-green-200' },
  COMPLETED: { label: 'Dokončeno',          color: 'text-blue-700 bg-blue-50 border-blue-200'  },
  CANCELLED: { label: 'Zrušeno',            color: 'text-red-700 bg-red-50 border-red-200'    },
}

interface Booking {
  id: string
  status: string
  scheduledAt: string
  clientNote?: string
  price?: number
  currency?: string
  client: { id: string; firstName: string; lastName: string; email?: string }
  service: { name: string; durationMinutes?: number }
}

export default function ProviderBookingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data, isLoading } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/api/bookings/my/provider?take=100')
      return data
    },
    enabled: !!user,
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/bookings/${id}/confirm`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-bookings'] })
      toast.success('Rezervace potvrzena!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Chyba'),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/bookings/${id}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-bookings'] })
      toast.success('Rezervace označena jako dokončená')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Chyba'),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/api/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-bookings'] })
      toast.success('Rezervace zrušena')
      setCancelId(null)
      setCancelReason('')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Chyba'),
  })

  const allBookings: Booking[] = data?.data || []
  const bookings = filter === 'ALL' ? allBookings : allBookings.filter(b => b.status === filter)

  const counts = {
    ALL:       allBookings.length,
    PENDING:   allBookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: allBookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: allBookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: allBookings.filter(b => b.status === 'CANCELLED').length,
  }

  const FILTERS = [
    { key: 'ALL',       label: 'Vše' },
    { key: 'PENDING',   label: 'Čekající' },
    { key: 'CONFIRMED', label: 'Potvrzené' },
    { key: 'COMPLETED', label: 'Dokončené' },
    { key: 'CANCELLED', label: 'Zrušené' },
  ] as const

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Příchozí rezervace</h1>
          <p className="text-gray-500 text-sm">Správa rezervací vašich zákazníků</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Čekající',  value: counts.PENDING,   color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Potvrzené', value: counts.CONFIRMED,  color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Dokončené', value: counts.COMPLETED,  color: 'text-blue-600',   bg: 'bg-blue-50'  },
          { label: 'Zrušené',   value: counts.CANCELLED,  color: 'text-red-600',    bg: 'bg-red-50'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg} border border-white`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {f.label} {counts[f.key] > 0 && <span className="ml-1 text-xs text-gray-400">({counts[f.key]})</span>}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-28 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === 'ALL' ? 'Zatím žádné rezervace' : `Žádné ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()} rezervace`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Client avatar */}
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
                    {b.client.firstName[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {b.client.firstName} {b.client.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{b.service.name}
                          {b.service.durationMinutes && ` · ${b.service.durationMinutes} min`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(b.scheduledAt)}
                      </span>
                      {b.price && (
                        <span className="font-medium text-blue-600">{formatCZK(b.price)}</span>
                      )}
                    </div>

                    {b.clientNote && (
                      <p className="text-xs text-gray-400 mt-1.5 italic bg-gray-50 rounded-lg px-3 py-2">
                        💬 "{b.clientNote}"
                      </p>
                    )}

                    {/* Cancel form */}
                    {cancelId === b.id && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <input
                          value={cancelReason}
                          onChange={e => setCancelReason(e.target.value)}
                          placeholder="Důvod zrušení…"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 min-w-32"
                        />
                        <button
                          onClick={() => cancelMutation.mutate({ id: b.id, reason: cancelReason })}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Potvrdit zrušení
                        </button>
                        <button onClick={() => setCancelId(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">
                          Zpět
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {cancelId !== b.id && (
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => confirmMutation.mutate(b.id)}
                            disabled={confirmMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Potvrdit
                          </button>
                          <button
                            onClick={() => setCancelId(b.id)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Odmítnout
                          </button>
                        </>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => completeMutation.mutate(b.id)}
                            disabled={completeMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" /> Dokončit
                          </button>
                          <button
                            onClick={() => setCancelId(b.id)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Zrušit
                          </button>
                        </>
                      )}
                      {b.status === 'COMPLETED' && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" /> Dokončeno
                        </div>
                      )}
                      {b.status === 'CANCELLED' && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <XCircle className="w-4 h-4" /> Zrušeno
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
