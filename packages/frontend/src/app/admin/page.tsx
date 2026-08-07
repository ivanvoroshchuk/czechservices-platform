'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { formatCZK, formatDate } from '@/lib/utils'
import {
  Users, Briefcase, Calendar, TrendingUp,
  CheckCircle, XCircle, Clock, Shield, Flag, AlertTriangle
} from 'lucide-react'
import { useEffect, useState } from 'react'

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'overview' | 'moderation' | 'flagged'>('overview')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/dashboard')
    if (!user) router.push('/login')
  }, [user])

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats')
      return data
    },
    enabled: !!user && user.role === 'ADMIN',
  })

  const { data: modQueue } = useQuery({
    queryKey: ['admin-moderation'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/moderation?take=20')
      return data
    },
    enabled: tab === 'moderation' && !!user,
  })

  const { data: flagged } = useQuery({
    queryKey: ['admin-flagged'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/flagged?take=20')
      return data
    },
    enabled: tab === 'flagged' && !!user,
  })

  const approveMutation = useMutation({
    mutationFn: (profileId: string) => api.post(`/api/admin/moderation/${profileId}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-moderation'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ profileId, reason }: { profileId: string; reason: string }) =>
      api.post(`/api/admin/moderation/${profileId}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-moderation'] })
      setRejectId(null)
      setRejectReason('')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      api.post(`/api/admin/flagged/${id}/resolve`, { resolution, action: 'DISMISS' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flagged'] }),
  })

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Přístup pouze pro administrátory</p>
      </div>
    )
  }

  const TABS = [
    { key: 'overview', label: 'Přehled' },
    { key: 'moderation', label: `Moderace${stats?.pendingProfiles ? ` (${stats.pendingProfiles})` : ''}` },
    { key: 'flagged', label: `Nahlášeno${stats?.pendingFlags ? ` (${stats.pendingFlags})` : ''}` },
  ] as const

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-500">CzechServices — správa platformy</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Celkem uživatelů" value={stats?.totalUsers ?? '—'} icon={<Users className="w-5 h-5 text-blue-600" />} color="bg-blue-50" />
            <StatCard label="Aktivní profily" value={stats?.publishedProfiles ?? '—'} icon={<Briefcase className="w-5 h-5 text-green-600" />} color="bg-green-50" />
            <StatCard label="Rezervace celkem" value={stats?.totalBookings ?? '—'} icon={<Calendar className="w-5 h-5 text-purple-600" />} color="bg-purple-50" />
            <StatCard label="Tržby (CZK)" value={stats?.totalRevenue ? formatCZK(stats.totalRevenue) : '—'} icon={<TrendingUp className="w-5 h-5 text-amber-600" />} color="bg-amber-50" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" />Čeká na moderaci</p>
              <p className="text-3xl font-bold text-amber-600">{stats?.pendingProfiles ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">profilů ke schválení</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" />Nahlášený obsah</p>
              <p className="text-3xl font-bold text-red-600">{stats?.pendingFlags ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">čeká na řešení</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" />Dokončené rezervace</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.completedBookings ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">úspěšných rezervací</p>
            </div>
          </div>
        </div>
      )}

      {/* Moderation tab */}
      {tab === 'moderation' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Profily čekající na schválení</h2>
          </div>
          {!modQueue?.length ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-400">Žádné profily ke schválení</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {modQueue.map((p: any) => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                    {p.displayName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{p.displayName}</p>
                    <p className="text-xs text-gray-500">
                      {p.user?.email} · {p.city?.name} · {p.services?.length || 0} služeb
                    </p>
                    {p.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{p.bio}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {rejectId === p.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Důvod zamítnutí…"
                          className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500 w-40"
                        />
                        <button
                          onClick={() => rejectMutation.mutate({ profileId: p.id, reason: rejectReason })}
                          disabled={!rejectReason || rejectMutation.isPending}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Zamítnout
                        </button>
                        <button onClick={() => setRejectId(null)} className="px-2 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">
                          Zrušit
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" /> Schválit
                        </button>
                        <button
                          onClick={() => setRejectId(p.id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3" /> Zamítnout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flagged tab */}
      {tab === 'flagged' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Nahlášený obsah</h2>
          </div>
          {!flagged?.length ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-400">Žádný nahlášený obsah</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {flagged.map((f: any) => (
                <div key={f.id} className="px-5 py-4 flex items-center gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{f.reason}</p>
                    <p className="text-xs text-gray-500">{f.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(f.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => resolveMutation.mutate({ id: f.id, resolution: 'Zkontrolováno administrátorem' })}
                    disabled={resolveMutation.isPending}
                    className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 shrink-0"
                  >
                    Vyřešit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
