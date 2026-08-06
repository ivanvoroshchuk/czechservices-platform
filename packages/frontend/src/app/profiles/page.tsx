'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { getAvatarUrl } from '@/lib/utils'
import { MapPin, Star, Search, SlidersHorizontal } from 'lucide-react'
import { useState, Suspense } from 'react'

const SERVICE_TYPES = [
  { value: '', label: 'Všechny kategorie' },
  { value: 'MASSAGE', label: 'Masáže' },
  { value: 'PHOTO_SESSION', label: 'Focení' },
  { value: 'YOGA', label: 'Jóga' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'CONSULTATION', label: 'Konzultace' },
  { value: 'STUDIO_RECORDING', label: 'Nahrávání' },
  { value: 'BEAUTY', label: 'Kosmetika' },
  { value: 'DANCE', label: 'Tanec' },
]

interface Profile {
  id: string
  slug: string
  displayName: string
  bio?: string
  profilePicture?: string
  city?: { name: string; region: { name: string } }
  services: { id: string; name: string; priceFrom: number; priceTo?: number; currency: string }[]
  _count?: { reviews: number }
  averageRating?: number
}

function ProfileCard({ profile }: { profile: Profile }) {
  const firstService = profile.services[0]

  return (
    <Link
      href={`/profiles/${profile.slug || profile.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden group"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {profile.profilePicture ? (
          <img
            src={getAvatarUrl(profile.profilePicture) ?? undefined}
            alt={profile.displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-4xl font-bold text-blue-400">{profile.displayName[0]}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
          {profile.displayName}
        </h3>
        {profile.city && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3 h-3" />
            {profile.city.name}, {profile.city.region.name}
          </p>
        )}
        {profile.averageRating ? (
          <p className="flex items-center gap-1 text-xs text-amber-500 mb-2">
            <Star className="w-3 h-3 fill-current" />
            {profile.averageRating.toFixed(1)}
            <span className="text-gray-400">({profile._count?.reviews})</span>
          </p>
        ) : null}
        {firstService && (
          <p className="text-sm font-medium text-blue-600">
            od {Math.round(firstService.priceFrom / 100)} {firstService.currency}
          </p>
        )}
        {profile.bio && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{profile.bio}</p>
        )}
      </div>
    </Link>
  )
}

function ProfilesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)

  const service = searchParams.get('service') || ''
  const city = searchParams.get('city') || ''
  const page = Number(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['profiles', { service, city, search: searchParams.get('q'), page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (service) params.set('serviceType', service)
      if (city) params.set('city', city)
      if (searchParams.get('q')) params.set('search', searchParams.get('q')!)
      params.set('page', String(page))
      params.set('limit', '12')
      const { data } = await api.get(`/api/profiles?${params}`)
      return data
    },
  })

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/profiles?${params}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('q', search)
  }

  const profiles: Profile[] = data?.data || []
  const total: number = data?.total || 0
  const totalPages: number = data?.totalPages || 1

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Poskytovatelé služeb</h1>
        <p className="text-gray-500">Najděte profesionální poskytovatele ve vašem okolí</p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat poskytovatele…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Hledat
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtry
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SERVICE_TYPES.map((s) => (
          <button
            key={s.value}
            onClick={() => updateFilter('service', s.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              service === s.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500 mb-4">
          {total === 0 ? 'Žádní poskytovatelé nenalezeni' : `Nalezeno ${total} poskytovatelů`}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 text-lg">Žádní poskytovatelé nenalezeni</p>
          <p className="text-gray-400 text-sm mt-1">Zkuste změnit filtry nebo hledaný výraz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateFilter('page', String(p))}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-8" /></div>}>
      <ProfilesContent />
    </Suspense>
  )
}
