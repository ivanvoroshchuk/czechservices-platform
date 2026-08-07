'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  displayName: z.string().min(2, 'Minimálně 2 znaky'),
  bio: z.string().max(1000).optional(),
  cityId: z.string().min(1, 'Vyberte město'),
})
type FormData = z.infer<typeof schema>

export default function CreateProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await api.get('/api/locations/regions')
      return data
    },
  })

  const { data: cities } = useQuery({
    queryKey: ['cities', selectedRegion],
    queryFn: async () => {
      const url = selectedRegion
        ? `/api/locations/cities?regionId=${selectedRegion}`
        : '/api/locations/cities'
      const { data } = await api.get(url)
      return data
    },
    enabled: true,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/profiles', data)
      router.push('/dashboard/profile')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Chyba při vytváření profilu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zpět na dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Vytvořit poskytovatelský profil</h1>
      <p className="text-gray-500 text-sm mb-8">Základní informace — služby přidáte po vytvoření profilu</p>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zobrazované jméno *</label>
          <input
            {...register('displayName')}
            placeholder="Kateřina Nováková — Masérka"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O mně</label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="Krátký popis vaší praxe, zkušeností a specializace…"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kraj</label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Všechny kraje</option>
              {regions?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Město *</label>
            <select
              {...register('cityId')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Vyberte město</option>
              {cities?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard" className="flex-1 text-center py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Zrušit
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Vytváření…' : <>Vytvořit profil <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
    </div>
  )
}
