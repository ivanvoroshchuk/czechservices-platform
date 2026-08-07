'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { ArrowLeft, Plus, Trash2, Globe, Phone, Mail, AtSign, Play, Link2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CONTACT_TYPES = [
  { value: 'PHONE',     label: 'Telefon',    icon: Phone,     placeholder: '+420 777 123 456' },
  { value: 'EMAIL',     label: 'E-mail',     icon: Mail,      placeholder: 'kontakt@example.cz' },
  { value: 'WEBSITE',   label: 'Web',        icon: Globe,     placeholder: 'https://mojestranka.cz' },
  { value: 'INSTAGRAM', label: 'Instagram',  icon: AtSign, placeholder: '@username' },
  { value: 'YOUTUBE',   label: 'YouTube',    icon: Play,   placeholder: 'https://youtube.com/...' },
  { value: 'OTHER',     label: 'Jiné',       icon: Link2,     placeholder: 'Odkaz nebo kontakt' },
]

interface Contact {
  id: string
  type: string
  value: string
  label?: string
  isPublic: boolean
}

export default function ContactsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: 'PHONE', value: '', label: '', isPublic: true })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['my-contacts'],
    queryFn: async () => {
      const { data } = await api.get('/api/contacts')
      return data as Contact[]
    },
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/api/contacts', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-contacts'] })
      setAdding(false)
      setForm({ type: 'PHONE', value: '', label: '', isPublic: true })
      setFormError('')
    },
    onError: (e: any) => setFormError(e.response?.data?.message || 'Chyba'),
  })

  const togglePublic = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      api.patch(`/api/contacts/${id}`, { isPublic }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-contacts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-contacts'] }),
  })

  const getIcon = (type: string) => {
    const ct = CONTACT_TYPES.find(c => c.value === type)
    const Icon = ct?.icon || Link2
    return <Icon className="w-4 h-4" />
  }

  const getPlaceholder = () =>
    CONTACT_TYPES.find(c => c.value === form.type)?.placeholder || ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Můj profil
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontaktní informace</h1>
          <p className="text-gray-500 text-sm mt-0.5">Veřejné kontakty se zobrazují na vašem profilu</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Přidat
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
          <p className="text-sm font-semibold text-blue-800 mb-4">Nový kontakt</p>
          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Typ</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONTACT_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Popisek (nepovinné)</label>
                <input
                  value={form.label}
                  onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="Pracovní, Osobní…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Hodnota *</label>
              <input
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                placeholder={getPlaceholder()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Zobrazit veřejně na profilu</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.value || createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Ukládání…' : 'Uložit'}
              </button>
              <button
                onClick={() => { setAdding(false); setFormError('') }}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-16 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : !contacts?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Zatím žádné kontakty</p>
          <p className="text-xs text-gray-400 mt-1">Přidejte telefon, e-mail nebo sociální sítě</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => {
            const ctDef = CONTACT_TYPES.find(x => x.value === c.type)
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  {getIcon(c.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.value}</p>
                  <p className="text-xs text-gray-400">{ctDef?.label || c.type}{c.label ? ` · ${c.label}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Public/Private toggle */}
                  <button
                    onClick={() => togglePublic.mutate({ id: c.id, isPublic: !c.isPublic })}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      c.isPublic
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {c.isPublic ? 'Veřejné' : 'Soukromé'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
