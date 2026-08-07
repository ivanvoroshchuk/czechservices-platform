'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { CheckCircle, Zap } from 'lucide-react'
import { useState } from 'react'

const PLANS = [
  {
    name: 'FREE',
    label: 'Zdarma',
    price: 0,
    desc: 'Pro začátek',
    color: 'border-gray-200',
    badge: '',
    features: ['1 služba', '3 fotografie', 'Základní profil', 'Rezervační systém'],
  },
  {
    name: 'BASIC',
    label: 'Základní',
    price: 499,
    desc: 'Pro aktivní poskytovatele',
    color: 'border-blue-300',
    badge: '',
    features: ['5 služeb', '10 fotografií', '2 videa', 'Priorita ve vyhledávání', 'Rezervační systém'],
  },
  {
    name: 'PREMIUM',
    label: 'Prémiový',
    price: 999,
    desc: 'Pro profesionály',
    color: 'border-purple-400',
    badge: 'Nejoblíbenější',
    features: ['15 služeb', '30 fotografií', '5 videí', 'Zvýrazněný profil', 'Analytika', 'Rezervační systém'],
  },
  {
    name: 'PRO',
    label: 'Profesionální',
    price: 1999,
    desc: 'Plný výkon',
    color: 'border-amber-400',
    badge: 'Nejlepší hodnota',
    features: ['50 služeb', '100 fotografií', '20 videí', 'Top pozice', 'Prioritní podpora', 'API přístup'],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [successPlan, setSuccessPlan] = useState('')

  const { data: mySub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => {
      const { data } = await api.get('/api/subscriptions/my')
      return data
    },
    enabled: !!user,
  })

  const subscribe = useMutation({
    mutationFn: (plan: string) => api.post('/api/subscriptions/subscribe', { plan }),
    onSuccess: (_, plan) => setSuccessPlan(plan),
  })

  const handleSelect = (plan: string) => {
    if (!user) { router.push('/login'); return }
    subscribe.mutate(plan)
  }

  const currentPlan = mySub?.plan || 'FREE'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Ceník předplatného</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Vyberte plán, který odpovídá vašim potřebám. Kdykoli ho můžete změnit.
        </p>
      </div>

      {successPlan && (
        <div className="mb-8 max-w-md mx-auto p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Předplatné aktivováno!</p>
          <p className="text-sm text-green-600">Plán <strong>{successPlan}</strong> je nyní aktivní.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.name
          const isPremium = plan.name === 'PREMIUM'

          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 shadow-sm flex flex-col ${plan.color} ${isPremium ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white ${isPremium ? 'bg-purple-500' : 'bg-amber-500'}`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex-1">
                <h2 className="text-lg font-bold text-gray-900">{plan.label}</h2>
                <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1 text-sm">CZK/měsíc</span>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                {isCurrent ? (
                  <div className="w-full text-center py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                    Váš aktuální plán
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(plan.name)}
                    disabled={subscribe.isPending}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                      isPremium
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : plan.name === 'PRO'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {subscribe.isPending ? 'Aktivace…' : plan.price === 0 ? 'Začít zdarma' : 'Vybrat plán'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <h3 className="font-semibold text-gray-900 mb-1">Máte otázky?</h3>
        <p className="text-sm text-gray-500">Kontaktujte nás na <a href="mailto:support@czechservices.cz" className="text-blue-600 hover:underline">support@czechservices.cz</a></p>
      </div>
    </div>
  )
}
