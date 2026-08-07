'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { cn, getInitials } from '@/lib/utils'
import { Menu, X, User, LogOut, Calendar, MessageSquare, ChevronDown, Shield, BadgeCheck, Settings, Image, Phone, Search, Users } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQ.trim()) {
      router.push(`/profiles?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const links = [
    { href: '/profiles', label: 'Poskytovatelé' },
    { href: '/services', label: 'Služby' },
    { href: '/pricing', label: 'Ceník' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">Czech</span>
            <span className="text-xl font-bold text-gray-800">Services</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname.startsWith(l.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop) */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 w-80">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Hledat poskytovatele…"
                  onBlur={() => { if (!searchQ) setSearchOpen(false) }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Hledat"
            >
              <Search className="w-4 h-4" />
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Můj profil
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Calendar className="w-4 h-4" /> Rezervace
                    </Link>
                    <Link
                      href="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4" /> Zprávy
                    </Link>
                    <Link
                      href="/dashboard/provider-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Users className="w-4 h-4" /> Příchozí rezervace
                    </Link>
                    <Link
                      href="/dashboard/gallery"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Image className="w-4 h-4" /> Galerie médií
                    </Link>
                    <Link
                      href="/dashboard/contacts"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Phone className="w-4 h-4" /> Kontakty
                    </Link>
                    <Link
                      href="/dashboard/verify"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <BadgeCheck className="w-4 h-4" /> Ověření totožnosti
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" /> Nastavení
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Shield className="w-4 h-4" /> Admin panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Odhlásit se
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  Přihlásit se
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrace
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <hr className="border-gray-100 my-1" />
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{user.firstName} {user.lastName}</p>
                <Link href="/dashboard"                   onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-400" />Můj profil</Link>
                <Link href="/bookings"                    onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Calendar className="w-4 h-4 text-gray-400" />Moje rezervace</Link>
                <Link href="/dashboard/provider-bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Users className="w-4 h-4 text-gray-400" />Příchozí rezervace</Link>
                <Link href="/chat"               onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><MessageSquare className="w-4 h-4 text-gray-400" />Zprávy</Link>
                <Link href="/dashboard/gallery"  onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Image className="w-4 h-4 text-gray-400" />Galerie</Link>
                <Link href="/dashboard/verify"   onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><BadgeCheck className="w-4 h-4 text-gray-400" />Ověření</Link>
                <Link href="/settings"           onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Settings className="w-4 h-4 text-gray-400" />Nastavení</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin"            onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><Shield className="w-4 h-4" />Admin panel</Link>
                )}
                <hr className="border-gray-100 my-1" />
                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="w-4 h-4" />Odhlásit se</button>
              </>
            ) : (
              <>
                <hr className="border-gray-100 my-1" />
                <Link href="/login"    onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Přihlásit se</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Registrace</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
