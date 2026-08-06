import Link from 'next/link'
import { Shield, Star, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Najděte profesionální služby<br />v České republice
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Masáže, focení, jóga, konzultace a mnoho dalšího — ověření poskytovatelé ve vašem okolí
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profiles" className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Procházet poskytovatele
            </Link>
            <Link href="/register" className="border border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Nabídnout služby
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Proč CzechServices?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Ověření poskytovatelé', desc: 'Všichni poskytovatelé prochází ověřením totožnosti a věku' },
            { icon: Star, title: 'Hodnocení a recenze', desc: 'Čtěte recenze od skutečných zákazníků a rozhodněte se lépe' },
            { icon: Clock, title: 'Rychlá rezervace', desc: 'Rezervujte službu online za pár kliknutí, bez čekání' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Populární kategorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '💆', label: 'Masáže', href: '/profiles?service=MASSAGE' },
              { emoji: '📸', label: 'Focení', href: '/profiles?service=PHOTO_SESSION' },
              { emoji: '🧘', label: 'Jóga', href: '/profiles?service=YOGA' },
              { emoji: '💪', label: 'Fitness', href: '/profiles?service=FITNESS' },
              { emoji: '💬', label: 'Konzultace', href: '/profiles?service=CONSULTATION' },
              { emoji: '🎙️', label: 'Nahrávání', href: '/profiles?service=STUDIO_RECORDING' },
              { emoji: '💄', label: 'Kosmetika', href: '/profiles?service=BEAUTY' },
              { emoji: '💃', label: 'Tanec', href: '/profiles?service=DANCE' },
            ].map(({ emoji, label, href }) => (
              <Link key={label} href={href} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                <span className="text-2xl">{emoji}</span>
                <span className="font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Nabízíte služby?</h2>
          <p className="text-gray-500 mb-6">Vytvořte si profil a získejte nové zákazníky ještě dnes</p>
          <Link href="/register" className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Začít zdarma
          </Link>
        </div>
      </section>
    </div>
  )
}
