'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Čeká na potvrzení', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Potvrzeno',          color: 'text-green-700 bg-green-50 border-green-200' },
  COMPLETED: { label: 'Dokončeno',          color: 'text-blue-700 bg-blue-50 border-blue-200' },
  CANCELLED: { label: 'Zrušeno',            color: 'text-red-700 bg-red-50 border-red-200' },
}

interface Booking {
  id: string
  status: string
  scheduledAt: string
  clientNote?: string
  price?: number
  currency?: string
  profile: { id: string; displayName: string; slug?: string }
  service: { name: string }
  review?: { id: string; rating: number; comment?: string }
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, fetchMe } = useAuthStore()
  const queryClient = useQueryClient()
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!user) fetchMe().then(() => {
      if (!useAuthStore.getState().user) router.push('/login')
    })
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/api/bookings?limit=50')
      return data
    },
    enabled: !!user,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/bookings/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) =>
      api.post('/api/bookings/' + bookingId + '/review', { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setReviewBookingId(null)
      setComment('')
      setRating(5)
    },
  })

  const bookings: Booking[] = data?.data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje rezervace</h1>
          <p className="text-gray-500 text-sm mt-0.5">Přehled všech vašich rezervací</p>
        </div>
        <Link href="/profiles" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + Nová rezervace
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-24 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Zatím žádné rezervace</p>
          <Link href="/profiles" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Procházet poskytovatele
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING
            const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED'
            const canReview = b.status === 'COMPLETED' && !b.review

            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-blue-600">{b.profile.displayName[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <Link
                          href={`/profiles/${b.profile.slug || b.profile.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {b.profile.displayName}
                        </Link>
                        <p className="text-sm text-gray-500">{b.service.name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${st.color}`}>
                        {b.status === 'CONFIRMED' && <CheckCircle className="w-3 h-3" />}
                        {b.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                        {b.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {st.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(b.scheduledAt)}
                      </span>
                      {b.price && <span>{Math.round(b.price / 100)} {b.currency || 'CZK'}</span>}
                    </div>
                    {b.clientNote && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{b.clientNote}"</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {canCancel && (
                      <button
                        onClick={() => cancelMutation.mutate(b.id)}
                        disabled={cancelMutation.isPending}
                        className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Zrušit
                      </button>
                    )}
                    {canReview && (
                      <button
                        onClick={() => setReviewBookingId(b.id)}
                        className="text-xs px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" /> Hodnotit
                      </button>
                    )}
                    {b.review && (
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        {Array.from({ length: b.review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review form */}
                {reviewBookingId === b.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800 mb-3">Napište recenzi</p>
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map((r) => (
                        <button key={r} onClick={() => setRating(r)}>
                          <Star className={`w-6 h-6 transition-colors ${r <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      placeholder="Váš komentář (nepovinné)…"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewMutation.mutate({ bookingId: b.id, rating, comment })}
                        disabled={reviewMutation.isPending}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {reviewMutation.isPending ? 'Odesílání…' : 'Odeslat'}
                      </button>
                      <button
                        onClick={() => setReviewBookingId(null)}
                        className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
