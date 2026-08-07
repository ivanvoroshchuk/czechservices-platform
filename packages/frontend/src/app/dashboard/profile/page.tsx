'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { formatCZK } from '@/lib/utils'
import {
  ArrowLeft, Plus, Trash2, Eye, EyeOff, Upload,
  Clock, CheckCircle, Edit2, Save, X
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const SERVICE_TYPES = [
  { value: 'MASSAGE', label: 'Masáže' },
  { value: 'PHOTO_SESSION', label: 'Focení' },
  { value: 'YOGA', label: 'Jóga' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'CONSULTATION', label: 'Konzultace' },
  { value: 'STUDIO_RECORDING', label: 'Nahrávání' },
  { value: 'BEAUTY', label: 'Kosmetika' },
  { value: 'DANCE', label: 'Tanec' },
]

const DAYS = [
  { key: 'monday', label: 'Pondělí' },
  { key: 'tuesday', label: 'Úterý' },
  { key: 'wednesday', label: 'Středa' },
  { key: 'thursday', label: 'Čtvrtek' },
  { key: 'friday', label: 'Pátek' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Neděle' },
]

interface Service {
  id: string
  name: string
  description?: string
  priceFrom: number
  priceTo?: number
  currency: string
  durationMinutes?: number
  serviceType?: string
  isActive: boolean
}

function AddServiceForm({ profileId, onDone }: { profileId: string; onDone: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', description: '', serviceType: 'MASSAGE',
    priceFrom: '', priceTo: '', currency: 'CZK', durationMinutes: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    if (!form.name || !form.priceFrom) { setErr('Vyplňte název a cenu'); return }
    setLoading(true)
    setErr('')
    try {
      await api.post(`/api/profiles/${profileId}/services`, {
        ...form,
        priceFrom: Math.round(parseFloat(form.priceFrom) * 100),
        priceTo: form.priceTo ? Math.round(parseFloat(form.priceTo) * 100) : undefined,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
      })
      qc.invalidateQueries({ queryKey: ['my-profile-full'] })
      onDone()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-blue-800">Nová služba</p>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Název *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Švédská masáž" />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Kategorie</label>
          <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Cena od (CZK) *</label>
          <input type="number" value={form.priceFrom} onChange={e => setForm(p => ({ ...p, priceFrom: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="800" />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Cena do (CZK)</label>
          <input type="number" value={form.priceTo} onChange={e => setForm(p => ({ ...p, priceTo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1200" />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Délka (min)</label>
          <input type="number" value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="60" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-600 mb-1 block">Popis</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Krátký popis služby…" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-3.5 h-3.5" /> {loading ? 'Ukládání…' : 'Uložit'}
        </button>
        <button onClick={onDone} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [addingService, setAddingService] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile-full'],
    queryFn: async () => {
      const { data } = await api.get('/api/profiles/me')
      return data
    },
    enabled: !!user,
  })

  const deleteSvc = useMutation({
    mutationFn: (svcId: string) => api.delete(`/api/profiles/${profile?.id}/services/${svcId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile-full'] }),
  })

  const togglePublish = async () => {
    if (!profile) return
    setPublishing(true)
    try {
      if (profile.status === 'PUBLISHED') {
        await api.patch(`/api/profiles/${profile.id}/unpublish`)
      } else {
        await api.patch(`/api/profiles/${profile.id}/publish`)
      }
      qc.invalidateQueries({ queryKey: ['my-profile-full'] })
      qc.invalidateQueries({ queryKey: ['my-profile'] })
    } finally {
      setPublishing(false)
    }
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post('/api/media/profile-picture', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      qc.invalidateQueries({ queryKey: ['my-profile-full'] })
    } finally {
      setUploadLoading(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-7 bg-gray-200 rounded w-48" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  )

  if (!profile) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <p className="text-gray-500 mb-4">Nemáte poskytovatelský profil</p>
      <Link href="/dashboard/profile/create" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
        Vytvořit profil
      </Link>
    </div>
  )

  const isPublished = profile.status === 'PUBLISHED'
  const activeServices = (profile.services || []).filter((s: Service) => s.isActive)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex gap-2">
          <Link href={`/profiles/${profile.slug || profile.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Náhled
          </Link>
          <button onClick={togglePublish} disabled={publishing}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              isPublished ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'
            }`}>
            {isPublished ? <><EyeOff className="w-3.5 h-3.5" /> Skrýt</> : <><CheckCircle className="w-3.5 h-3.5" /> Publikovat</>}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.displayName}</h1>
      <div className="flex items-center gap-2 mb-8">
        <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-sm text-gray-500">{isPublished ? 'Publikováno — viditelné veřejně' : 'Nepublikováno — skryté'}</span>
      </div>

      {/* Profile photo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profilová fotka</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-500 overflow-hidden">
            {profile.profilePicture ? (
              <img src={`${process.env.NEXT_PUBLIC_API_URL}${profile.profilePicture}`} alt="" className="w-full h-full object-cover" />
            ) : profile.displayName?.[0]}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploadLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Upload className="w-4 h-4" /> {uploadLoading ? 'Nahrávání…' : 'Nahrát fotku'}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Služby</h2>
          <button onClick={() => setAddingService(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Přidat
          </button>
        </div>

        {addingService && (
          <div className="mb-4">
            <AddServiceForm profileId={profile.id} onDone={() => setAddingService(false)} />
          </div>
        )}

        {activeServices.length === 0 && !addingService ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Zatím žádné služby — přidejte první a publikujte profil
          </p>
        ) : (
          <div className="space-y-2">
            {activeServices.map((s: Service) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>{formatCZK(s.priceFrom)}{s.priceTo ? ` – ${formatCZK(s.priceTo)}` : ''}</span>
                    {s.durationMinutes && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{s.durationMinutes} min</span>}
                  </p>
                </div>
                <button onClick={() => deleteSvc.mutate(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Dostupnost</h2>
        <div className="space-y-2">
          {DAYS.map(day => {
            const slot = profile.schedule?.[day.key]
            return (
              <div key={day.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700 w-24">{day.label}</span>
                {slot?.available ? (
                  <span className="text-sm text-green-600 font-medium">{slot.from} – {slot.to}</span>
                ) : (
                  <span className="text-xs text-gray-400">Nedostupné</span>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Dostupnost lze nastavit přes API nebo kontaktujte podporu</p>
      </div>
    </div>
  )
}
