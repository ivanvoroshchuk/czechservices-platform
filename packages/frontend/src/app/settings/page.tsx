'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Bell, Trash2, CheckCircle } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimálně 2 znaky'),
  lastName: z.string().min(2, 'Minimálně 2 znaky'),
  phone: z.string().min(9, 'Neplatné číslo').optional().or(z.literal('')),
})
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Zadejte aktuální heslo'),
  newPassword: z.string().min(8, 'Minimálně 8 znaků').regex(/[A-Z]/, 'Velké písmeno').regex(/[0-9]/, 'Číslo'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Hesla se neshodují', path: ['confirmPassword'] })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, fetchMe, logout } = useAuthStore()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile')

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '' },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onProfileSave = async (data: ProfileForm) => {
    setProfileError('')
    setProfileSuccess(false)
    try {
      await api.patch('/api/users/me', data)
      await fetchMe()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (e: any) {
      setProfileError(e.response?.data?.message || 'Chyba při ukládání')
    }
  }

  const onPasswordSave = async (data: PasswordForm) => {
    setPasswordError('')
    setPasswordSuccess(false)
    try {
      await api.patch('/api/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setPasswordSuccess(true)
      passwordForm.reset()
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (e: any) {
      setPasswordError(e.response?.data?.message || 'Nesprávné aktuální heslo')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete('/api/users/me')
      logout()
      router.push('/')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Chyba při mazání účtu')
    }
  }

  if (!user) return null

  const TABS = [
    { key: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { key: 'password', label: 'Heslo', icon: <Lock className="w-4 h-4" /> },
    { key: 'notifications', label: 'Oznámení', icon: <Bell className="w-4 h-4" /> },
  ] as const

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nastavení účtu</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {/* Profile tab */}
        {tab === 'profile' && (
          <Section title="Osobní údaje" icon={<User className="w-4 h-4 text-blue-600" />}>
            {profileSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                <CheckCircle className="w-4 h-4" /> Uloženo úspěšně
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{profileError}</div>
            )}
            <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
                  <input {...profileForm.register('firstName')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Příjmení</label>
                  <input {...profileForm.register('lastName')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input value={user.email} disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">E-mail nelze změnit</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input {...profileForm.register('phone')} placeholder="+420 777 123 456"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={profileForm.formState.isSubmitting}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
                {profileForm.formState.isSubmitting ? 'Ukládání…' : 'Uložit změny'}
              </button>
            </form>
          </Section>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <Section title="Změna hesla" icon={<Lock className="w-4 h-4 text-blue-600" />}>
            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                <CheckCircle className="w-4 h-4" /> Heslo změněno úspěšně
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{passwordError}</div>
            )}
            <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4">
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {['Aktuální heslo', 'Nové heslo', 'Potvrdit nové heslo'][i]}
                  </label>
                  <input {...passwordForm.register(field)} type="password" placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {passwordForm.formState.errors[field] && (
                    <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[field]?.message}</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={passwordForm.formState.isSubmitting}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
                {passwordForm.formState.isSubmitting ? 'Měním heslo…' : 'Změnit heslo'}
              </button>
            </form>
          </Section>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <Section title="Nastavení oznámení" icon={<Bell className="w-4 h-4 text-blue-600" />}>
            <div className="space-y-4">
              {[
                { label: 'Nová rezervace', desc: 'E-mail při příchozí rezervaci' },
                { label: 'Zprávy', desc: 'E-mail při nové zprávě v chatu' },
                { label: 'Hodnocení', desc: 'E-mail při nové recenzi' },
                { label: 'Newsletter', desc: 'Novinky a tipy od CzechServices' },
              ].map(({ label, desc }) => (
                <label key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer group">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Uložit nastavení
            </button>
          </Section>
        )}

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-red-800 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Nebezpečná zóna
          </h2>
          <p className="text-sm text-red-600 mb-4">Smazání účtu je nevratné. Všechna data budou odstraněna.</p>
          {deleteConfirm ? (
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors">
                Ano, smazat můj účet
              </button>
              <button onClick={() => setDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Zrušit
              </button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
              Smazat účet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
