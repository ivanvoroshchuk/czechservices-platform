'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { ArrowLeft, Upload, Trash2, Image, Video, Star } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface MediaItem {
  id: string
  url: string
  mediaType: 'photo' | 'video'
  status: string
  displayOrder: number
  isCover: boolean
}

export default function GalleryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const { data: media, isLoading } = useQuery({
    queryKey: ['my-media'],
    queryFn: async () => {
      const { data } = await api.get('/api/media/my')
      return data as MediaItem[]
    },
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-media'] }),
  })

  const upload = async (file: File, type: 'photo' | 'video') => {
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/api/media/upload/${type}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      qc.invalidateQueries({ queryKey: ['my-media'] })
    } catch (e: any) {
      setUploadError(e.response?.data?.message || 'Chyba při nahrávání souboru')
    } finally {
      setUploading(false)
    }
  }

  const photos = media?.filter(m => m.mediaType === 'photo') || []
  const videos = media?.filter(m => m.mediaType === 'video') || []

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'

  const STATUS_BADGE: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Čeká na schválení',
    APPROVED: 'Schváleno',
    REJECTED: 'Zamítnuto',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Můj profil
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie médií</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fotografie a videa vašeho profilu</p>
        </div>
        <div className="flex gap-2">
          <input ref={photoRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'photo'); e.target.value = '' }} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'video'); e.target.value = '' }} />
          <button onClick={() => photoRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <Image className="w-4 h-4" /> Foto
          </button>
          <button onClick={() => videoRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Video className="w-4 h-4" /> Video
          </button>
        </div>
      </div>

      {uploading && (
        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Nahrávání souboru…
        </div>
      )}
      {uploadError && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{uploadError}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : media?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Image className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Galerie je prázdná</p>
          <p className="text-gray-400 text-sm mt-1">Nahrajte fotografie nebo videa</p>
          <button onClick={() => photoRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" /> Nahrát první fotografii
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" /> Fotografie ({photos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map(item => (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Status badge */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                    {item.isCover && (
                      <span className="absolute top-2 right-2 p-1 bg-amber-400 rounded-lg">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Video className="w-4 h-4" /> Videa ({videos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map(item => (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-gray-900">
                    <video
                      src={item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`}
                      className="w-full aspect-video object-cover"
                      controls
                    />
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
        <p className="font-medium mb-1">Pravidla pro média:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Fotografie: JPG, PNG, WEBP — max 50 MB</li>
          <li>Videa: MP4, MOV — max 50 MB</li>
          <li>Každé médium prochází schválením administrátora (1–24 hodin)</li>
        </ul>
      </div>
    </div>
  )
}
