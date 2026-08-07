'use client'

import { useToastStore } from '@/store/toast.store'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const CONFIG = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200',  text: 'text-green-800', icon_cls: 'text-green-500' },
  error:   { icon: XCircle,     bg: 'bg-red-50 border-red-200',      text: 'text-red-800',   icon_cls: 'text-red-500'   },
  info:    { icon: Info,         bg: 'bg-blue-50 border-blue-200',    text: 'text-blue-800',  icon_cls: 'text-blue-500'  },
  warning: { icon: AlertTriangle,bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_cls: 'text-amber-500' },
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const cfg = CONFIG[toast.type]
        const Icon = cfg.icon
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-lg pointer-events-auto animate-in slide-in-from-bottom-2 ${cfg.bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.icon_cls}`} />
            <p className={`flex-1 text-sm font-medium ${cfg.text}`}>{toast.message}</p>
            <button onClick={() => remove(toast.id)} className={`shrink-0 ${cfg.icon_cls} opacity-60 hover:opacity-100 transition-opacity`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
