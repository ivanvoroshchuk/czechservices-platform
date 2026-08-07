'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { getAvatarUrl, formatCZK, formatDate } from '@/lib/utils'
import { useToastStore } from '@/store/toast.store'
import { MapPin, Star, Phone, Mail, Clock, Calendar, CheckCircle, MessageSquare, Images } from 'lucide-react'
import { useState } from 'react'

const DAY_NAMES: Record<string, string> = {
  monday: 'Pondělí', tuesday: 'Úterý', wednesday: 'Středa',
  thursday: 'Čtvrtek', friday: 'Pátek', saturday: 'Sobota', sunday: 'Neděle',
}

interface Service {
  id: string
  name: string
  description?: string
  priceFrom: number
  priceTo?: number
  currency: string
  durationMinutes?: number
  isActive: boolean
}

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  client: { firstName: string; lastName: string; profilePicture?: string }
}

export default function ProfileDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNote, setBookingNote] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/profiles/${slug}`)
      return data
    },
    enabled: !!slug,
  })

  const { data: reviews } = useQuery({
    queryKey: ['profile-reviews', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/profiles/${slug}/reviews`)
      return data
    },
    enabled: !!slug,
  })

  const { data: media } = useQuery({
    queryKey: ['profile-media', profile?.id],
    queryFn: async () => {
      const { data } = await api.get(`/api/media/profile/${profile.id}`)
      return data as { id: string; url: string; mediaType: string }[]
    },
    enabled: !!profile?.id,
  })

  const handleBook = async () => {
    if (!user) { router.push('/login'); return }
    if (!selectedService || !bookingDate) return
    setBookingLoading(true)
    try {
      await api.post('/api/bookings', {
        profileId: profile.id,
        serviceId: selectedService.id,
        scheduledAt: new Date(bookingDate).toISOString(),
        clientNote: bookingNote || undefined,
      })
      setBookingSuccess(true)
      setSelectedService(null)
      setBookingDate('')
      setBookingNote('')
      toast.success('Rezervace odeslána!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Chyba při rezervaci')
    } finally {
      setBookingLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-gray-500 text-lg">Profil nenalezen</p>
      </div>
    )
  }

  const activeServices: Service[] = (profile.services || []).filter((s: Service) => s.isActive)
  const schedule = profile.schedule || {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6">
        <div className="shrink-0">
          {profile.profilePicture ? (
            <img
              src={getAvatarUrl(profile.profilePicture) ?? undefined}
              alt={profile.displayName}
              className="w-32 h-32 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-400">{profile.displayName?.[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
              {profile.city && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city.name}, {profile.city.region.name}
                </p>
              )}
            </div>
            {profile.averageRating ? (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-semibold text-amber-700">{profile.averageRating.toFixed(1)}</span>
                <span className="text-amber-500 text-sm">({profile._count?.reviews})</span>
              </div>
            ) : null}
          </div>
          {profile.bio && <p className="text-gray-600 mt-3 text-sm leading-relaxed">{profile.bio}</p>}
          <div className="flex flex-wrap gap-3 mt-4">
            {profile.user?.email && (
              <a href={`mailto:${profile.user.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Mail className="w-4 h-4" /> {profile.user.email}
              </a>
            )}
            {profile.contacts?.[0]?.value && (
              <a href={`tel:${profile.contacts[0].value}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600">
                <Phone className="w-4 h-4" /> {profile.contacts[0].value}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nabízené služby</h2>
            {activeServices.length === 0 ? (
              <p className="text-gray-400 text-sm">Zatím žádné služby</p>
            ) : (
              <div className="space-y-3">
                {activeServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(selectedService?.id === s.id ? null : s)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedService?.id === s.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                        {s.durationMinutes && (
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3" /> {s.durationMinutes} min
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-semibold text-blue-600">
                          {formatCZK(s.priceFrom)}
                          {s.priceTo && s.priceTo !== s.priceFrom && ` – ${formatCZK(s.priceTo)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          {Object.keys(schedule).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Dostupnost</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {Object.entries(DAY_NAMES).map(([day, label]) => {
                  const slot = schedule[day]
                  return (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{label}</span>
                      {slot?.available ? (
                        <span className="text-sm font-medium text-green-600">{slot.from} – {slot.to}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Nedostupné</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Gallery */}
          {media && media.filter(m => m.mediaType === 'photo').length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Images className="w-5 h-5 text-blue-600" /> Fotogalerie
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {media.filter(m => m.mediaType === 'photo').map(img => {
                  const src = img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL}${img.url}`
                  return (
                    <button key={img.id} onClick={() => setLightboxImg(src)}
                      className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lightbox */}
          {lightboxImg && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setLightboxImg(null)}>
              <img src={lightboxImg} alt="" className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" />
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recenze</h2>
            {!reviews?.data?.length ? (
              <p className="text-gray-400 text-sm">Zatím žádné recenze</p>
            ) : (
              <div className="space-y-4">
                {reviews.data.map((r: Review) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                        {r.client.firstName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{r.client.firstName} {r.client.lastName}</span>
                      <div className="flex ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 ml-9">{r.comment}</p>}
                    <p className="text-xs text-gray-400 ml-9 mt-1">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Rezervovat
            </h2>

            {bookingSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Rezervace odeslána!</p>
                <p className="text-xs text-gray-500 mt-1">Poskytovatel vás brzy kontaktuje.</p>
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Nová rezervace
                </button>
              </div>
            ) : (
              <>
                {selectedService ? (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-700">Vybraná služba:</p>
                    <p className="text-sm text-blue-900">{selectedService.name}</p>
                    <p className="text-sm font-semibold text-blue-700 mt-0.5">{formatCZK(selectedService.priceFrom)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">Vyberte službu vlevo</p>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Datum a čas</label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Poznámka (nepovinné)</label>
                    <textarea
                      value={bookingNote}
                      onChange={(e) => setBookingNote(e.target.value)}
                      rows={2}
                      placeholder="Vaše poznámka…"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={!selectedService || !bookingDate || bookingLoading}
                    className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {bookingLoading ? 'Odesílání…' : user ? 'Rezervovat' : 'Přihlásit se a rezervovat'}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => router.push(`/chat?profileId=${profile.id}`)}
              className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Napsat zprávu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
