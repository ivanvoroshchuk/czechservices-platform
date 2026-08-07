import Link from 'next/link'

const LINKS = {
  'Platforma': [
    { href: '/profiles', label: 'Poskytovatelé' },
    { href: '/services', label: 'Katalog služeb' },
    { href: '/pricing',  label: 'Ceník' },
    { href: '/about',    label: 'O nás' },
  ],
  'Uživatelé': [
    { href: '/register',   label: 'Registrace' },
    { href: '/login',      label: 'Přihlášení' },
    { href: '/dashboard',  label: 'Můj účet' },
    { href: '/bookings',   label: 'Moje rezervace' },
  ],
  'Podpora': [
    { href: '/about#contact', label: 'Kontakt' },
    { href: '/about#faq',     label: 'Časté dotazy' },
    { href: '/about#terms',   label: 'Obchodní podmínky' },
    { href: '/about#privacy', label: 'Ochrana soukromí' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-3">
              <span className="text-xl font-bold text-blue-600">Czech</span>
              <span className="text-xl font-bold text-gray-800">Services</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Platforma pro rezervaci profesionálních služeb v České republice.
            </p>
            <p className="text-xs text-gray-400 mt-3">
              📍 Praha, Česká republika
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">{title}</p>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} CzechServices. Všechna práva vyhrazena.
          </p>
          <div className="flex gap-4">
            <Link href="/about#terms"   className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Podmínky</Link>
            <Link href="/about#privacy" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Soukromí</Link>
            <Link href="/about#contact" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
