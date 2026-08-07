'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Search } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const CATEGORIES = [
  { emoji: '💆', label: 'Masáže',      value: 'MASSAGE' },
  { emoji: '📸', label: 'Focení',      value: 'PHOTO_SESSION' },
  { emoji: '🧘', label: 'Jóga',        value: 'YOGA' },
  { emoji: '💪', label: 'Fitness',     value: 'FITNESS' },
  { emoji: '💬', label: 'Konzultace',  value: 'CONSULTATION' },
  { emoji: '🎙️', label: 'Nahrávání',  value: 'STUDIO_RECORDING' },
  { emoji: '💄', label: 'Kosmetika',   value: 'BEAUTY' },
  { emoji: '💃', label: 'Tanec',       value: 'DANCE' },
]

interface ServiceType {
  id: string
  name: string
  slug: string
  description?: string
  _count?: { services: number }
}

function ServicesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const active = searchParams.get('type') || ''

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data } = await api.get('/api/services/types')
      return data as ServiceType[]
    },
  })

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles-by-service', active, searchParams.get('q')],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (active) params.set('serviceType', active)
      if (searchParams.get('q')) params.set('search', searchParams.get('q')!)
      params.set('limit', '20')
      const { data } = await api.get(`/api/profiles?${params}`)
      return data
    },
  })

  const setFilter = (type: string) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (search) params.set('q', search)
    router.push(`/services?${params}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (active) params.set('type', active)
    if (search) params.set('q', search)
    router.push(`/services?${params}`)
  }

  const profileList = profiles?.data || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Katalog služeb</h1>
        <p className="text-gray-500">Vyberte kategorii nebo vyhledejte konkrétní službu</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat službu…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Hledat
        </button>
      </form>

      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <button
          onClick={() => setFilter('')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            !active ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <span className="text-2xl">🔍</span>
          <p className="font-medium text-gray-800 mt-2 text-sm">Vše</p>
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              active === cat.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <p className="font-medium text-gray-800 mt-2 text-sm">{cat.label}</p>
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {active ? `${CATEGORIES.find(c => c.value === active)?.label || 'Výsledky'}` : 'Všichni poskytovatelé'}
          {!isLoading && <span className="text-gray-400 font-normal text-sm ml-2">({profiles?.total || 0})</span>}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : profileList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">😔</p>
            <p className="text-gray-500">Žádní poskytovatelé nenalezeni</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileList.map((p: any) => (
              <Link
                key={p.id}
                href={`/profiles/${p.slug || p.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-xl font-bold text-blue-500">
                  {p.displayName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{p.displayName}</p>
                  {p.city && <p className="text-xs text-gray-500 mt-0.5">{p.city.name}</p>}
                  {p.services?.[0] && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      od {Math.round(p.services[0].priceFrom / 100)} {p.services[0].currency}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-48" /></div>}>
      <ServicesContent />
    </Suspense>
  )
}
