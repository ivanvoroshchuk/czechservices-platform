'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Upload, CheckCircle, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

const DOC_TYPES = [
  { value: 'ID_CARD', label: 'Občanský průkaz' },
  { value: 'PASSPORT', label: 'Cestovní pas' },
  { value: 'DRIVERS_LICENSE', label: 'Řidičský průkaz' },
]

export default function VerifyPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)

  const [docType, setDocType] = useState('ID_CARD')
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const handleSubmit = async () => {
    if (!frontFile) { setError('Nahrajte přední stranu dokladu'); return }
    setLoading(true)
    setError('')
    try {
      // Upload front document
      const frontForm = new FormData()
      frontForm.append('file', frontFile)
      const { data: frontData } = await api.post('/api/media/document', frontForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      let backUrl: string | undefined
      if (backFile) {
        const backForm = new FormData()
        backForm.append('file', backFile)
        const { data: backData } = await api.post('/api/media/document', backForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        backUrl = backData.url
      }

      await api.post('/api/verification/submit', {
        documentType: docType,
        frontImageUrl: frontData.url,
        backImageUrl: backUrl,
        notes: notes || undefined,
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Chyba při odesílání')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Žádost odeslána!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Vaše doklady jsou v procesu ověření. Výsledek vám pošleme e-mailem do 1–3 pracovních dnů.
        </p>
        <Link href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Zpět na dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Ověření totožnosti</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Ověřte svou totožnost pro získání ověřeného odznaku a vyšší důvěryhodnosti u klientů.
      </p>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
        <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Proces ověření</p>
          <p className="text-xs text-blue-600 mt-0.5">Nahrajte platný doklad totožnosti. Ověření trvá 1–3 pracovní dny. Vaše údaje jsou šifrovány a chráněny.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Doc type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Typ dokladu</label>
          <div className="flex gap-2 flex-wrap">
            {DOC_TYPES.map(d => (
              <button
                key={d.value}
                onClick={() => setDocType(d.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  docType === d.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Front */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Přední strana *</label>
          <input ref={frontRef} type="file" accept="image/*,.pdf" onChange={e => setFrontFile(e.target.files?.[0] || null)} className="hidden" />
          <button
            onClick={() => frontRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              frontFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {frontFile ? (
              <div>
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">{frontFile.name}</p>
                <p className="text-xs text-green-500 mt-0.5">Klikněte pro změnu</p>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Klikněte pro nahrání</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF — max 10 MB</p>
              </div>
            )}
          </button>
        </div>

        {/* Back */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zadní strana <span className="text-gray-400 font-normal">(nepovinné)</span></label>
          <input ref={backRef} type="file" accept="image/*,.pdf" onChange={e => setBackFile(e.target.files?.[0] || null)} className="hidden" />
          <button
            onClick={() => backRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              backFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {backFile ? (
              <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> {backFile.name}
              </p>
            ) : (
              <p className="text-sm text-gray-400">+ Přidat zadní stranu</p>
            )}
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka <span className="text-gray-400 font-normal">(nepovinné)</span></label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Případné poznámky k žádosti…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !frontFile}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Shield className="w-4 h-4" />
          {loading ? 'Odesílání…' : 'Odeslat k ověření'}
        </button>
      </div>
    </div>
  )
}
