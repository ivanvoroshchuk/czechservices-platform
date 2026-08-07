'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { getAvatarUrl, formatDate } from '@/lib/utils'
import { Send, MessageSquare } from 'lucide-react'
import { useEffect, useRef, useState, Suspense } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  body: string
  senderId: string
  createdAt: string
  isRead: boolean
  sender?: { firstName: string; lastName: string; profilePicture?: string }
}

interface Conversation {
  id: string
  participants: { id: string; firstName: string; lastName: string; profilePicture?: string }[]
  lastMessage?: { body: string; createdAt: string }
  unreadCount?: number
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  // Auth guard
  useEffect(() => {
    if (!user) { router.push('/login'); return }
  }, [user])

  // Socket connection
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    const s = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://127.0.0.1:3000'}/chat`, {
      path: '/socket.io',
      auth: { token },
    })
    s.on('connect', () => console.log('Socket connected'))
    s.on('message:new', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })
    s.on('typing:start', () => setPartnerTyping(true))
    s.on('typing:stop', () => setPartnerTyping(false))
    setSocket(s)
    return () => { s.disconnect() }
  }, [user])

  // Conversations list
  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/api/chat/conversations')
      return data as Conversation[]
    },
    enabled: !!user,
  })

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConvId) return
    api.get(`/api/chat/conversations/${activeConvId}/messages`).then(({ data }) => {
      setMessages(data.data || [])
    })
  }, [activeConvId])

  // Auto-scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getPartner = (conv: Conversation) =>
    conv.participants.find(p => p.id !== user?.id)

  const sendMessage = () => {
    if (!input.trim() || !activeConvId || !socket) return
    socket.emit('message:send', { conversationId: activeConvId, body: input.trim() })
    setInput('')
    if (typingTimer.current) clearTimeout(typingTimer.current)
    socket.emit('typing:stop', { conversationId: activeConvId })
  }

  const handleInput = (val: string) => {
    setInput(val)
    if (!socket || !activeConvId) return
    if (!typing) {
      socket.emit('typing:start', { conversationId: activeConvId })
      setTyping(true)
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConvId })
      setTyping(false)
    }, 1500)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const activeConv = conversations?.find(c => c.id === activeConvId)
  const partner = activeConv ? getPartner(activeConv) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-blue-600" /> Zprávy
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">

          {/* Sidebar — conversations */}
          <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Konverzace</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="p-3 space-y-2">
                  {[1,2,3].map(i => <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />)}
                </div>
              ) : !conversations?.length ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Zatím žádné zprávy</p>
                  <p className="text-xs text-gray-400 mt-1">Napište poskytovateli z jeho profilu</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const p = getPartner(conv)
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50 ${
                        activeConvId === conv.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-sm font-bold text-blue-600 relative">
                        {p?.profilePicture ? (
                          <img src={getAvatarUrl(p.profilePicture) ?? undefined} className="w-full h-full object-cover rounded-full" alt="" />
                        ) : (
                          p?.firstName?.[0]
                        )}
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p?.firstName} {p?.lastName}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage.body}</p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeConvId ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Vyberte konverzaci</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {partner?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{partner?.firstName} {partner?.lastName}</p>
                    {partnerTyping && <p className="text-xs text-blue-500">píše…</p>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMe = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                          isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          <p>{msg.body}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {partnerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <textarea
                    value={input}
                    onChange={e => handleInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Napište zprávu… (Enter = odeslat)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-32" /></div>}>
      <ChatContent />
    </Suspense>
  )
}
