'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { getAvatarUrl, formatCZK, formatDate } from '@/lib/utils'
import {
  User, Calendar, MessageSquare, Star, TrendingUp,
  Clock, CheckCircle, XCircle, Plus, Edit, Eye,
  Image, Phone, Settings, BadgeCheck
} from 'lucide-react'
import { useEffect } from 'react'

const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Čeká na potvrzení', color: 'text-amber-600 bg-amber-50 border-amber-200',   icon: <Clock className="w-3.5 h-3.5" /> },
  CONFIRMED: { label: 'Potvrzeno',          color: 'text-green-600 bg-green-50 border-green-200',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  COMPLETED: { label: 'Dokončeno',          color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: <CheckCircle className="w-3.5 h-3.5" /> },
  CANCELLED: { label: 'Zrušeno',            color: 'text-red-600 bg-red-50 border-red-200',        icon: <XCircle className="w-3.5 h-3.5" /> },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, fetchMe } = useAuthStore()

  useEffect(() => {
    if (!user) fetchMe().then(() => {
      if (!useAuthStore.getState().user) router.push('/login')
    })
  }, [])

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/api/bookings?limit=5')
      return data
    },
    enabled: !!user,
  })

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/profiles/me')
        return data
      } catch {
        return null
      }
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-5 bg-gray-200 rounded w-40 mx-auto" />
        </div>
      </div>
    )
  }

  const recentBookings = bookings?.data?.slice(0, 5) || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {user.profilePicture ? (
            <img src={getAvatarUrl(user.profilePicture) ?? undefined} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            `${user.firstName[0]}${user.lastName[0]}`
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dobrý den, {user.firstName}!</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Moje rezervace', value: bookings?.total ?? '—', icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Čeká na potvrzení', value: recentBookings.filter((b: any) => b.status === 'PENDING').length, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Zprávy', value: '—', icon: <MessageSquare className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Hodnocení', value: myProfile?.averageRating ? myProfile.averageRating.toFixed(1) : '—', icon: <Star className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50' },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Poslední rezervace
            </h2>
            <Link href="/bookings" className="text-sm text-blue-600 hover:underline">Zobrazit vše</Link>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Zatím žádné rezervace</p>
              <Link href="/profiles" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Procházet poskytovatele
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b: any) => {
                const st = STATUS_LABEL[b.status] || STATUS_LABEL.PENDING
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-600">
                        {(b.profile?.displayName || 'P')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.profile?.displayName || 'Poskytovatel'}</p>
                      <p className="text-xs text-gray-500">{b.service?.name} · {formatDate(b.scheduledAt)}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Můj poskytovatelský profil
            </h2>
            {myProfile ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${myProfile.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-500">{myProfile.status === 'PUBLISHED' ? 'Publikováno' : 'Nepublikováno'}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{myProfile.displayName}</p>
                <p className="text-xs text-gray-500 mb-3">{myProfile.services?.length || 0} aktivních služeb</p>
                <div className="flex gap-2">
                  <Link
                    href={`/profiles/${myProfile.slug || myProfile.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Náhled
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Upravit
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">Nabízíte služby? Vytvořte svůj profil.</p>
                <Link
                  href="/dashboard/profile/create"
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Vytvořit profil
                </Link>
              </>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Rychlé akce</h2>
            <div className="space-y-1">
              {[
                { href: '/bookings',            icon: <Calendar className="w-4 h-4" />,    label: 'Moje rezervace' },
                { href: '/chat',                icon: <MessageSquare className="w-4 h-4" />, label: 'Zprávy' },
                { href: '/dashboard/gallery',   icon: <Image className="w-4 h-4" />,       label: 'Galerie médií' },
                { href: '/dashboard/contacts',  icon: <Phone className="w-4 h-4" />,       label: 'Kontakty' },
                { href: '/dashboard/verify',    icon: <BadgeCheck className="w-4 h-4" />,  label: 'Ověření totožnosti' },
                { href: '/settings',            icon: <Settings className="w-4 h-4" />,    label: 'Nastavení účtu' },
                { href: '/profiles',            icon: <TrendingUp className="w-4 h-4" />,  label: 'Hledat služby' },
              ].map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
