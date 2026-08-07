import { Shield, Star, Clock, Users, Mail, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O nás',
  description: 'Zjistěte více o platformě CzechServices a naší misi.',
}

const FAQ = [
  {
    q: 'Jak mohu rezervovat službu?',
    a: 'Přejděte na profil poskytovatele, vyberte požadovanou službu, zvolte datum a čas a klikněte na tlačítko Rezervovat. Budete potřebovat bezplatný účet.',
  },
  {
    q: 'Je registrace zdarma?',
    a: 'Ano, registrace i základní používání platformy jsou zcela zdarma. Poskytovatelé mohou využívat prémiové plány pro více funkcí.',
  },
  {
    q: 'Jak mohu nabídnout své služby?',
    a: 'Po registraci přejděte do sekce Dashboard → Vytořit profil. Vyplňte informace, přidejte služby a profil publikujte. Váš profil se zobrazí po schválení administrátorem.',
  },
  {
    q: 'Jak funguje ověření věku?',
    a: 'Vyžadujeme ověření věku (18+) pro poskytovatele určitých kategorií služeb. Dokumenty se nahrávají bezpečně a jsou viditelné pouze pro tým ověřovatelů.',
  },
  {
    q: 'Jak mohu zrušit rezervaci?',
    a: 'Rezervace lze zrušit v sekci Moje rezervace, pokud má stav Čeká na potvrzení nebo Potvrzeno.',
  },
  {
    q: 'Jak mohu kontaktovat poskytovatele?',
    a: 'Na profilu každého poskytovatele je tlačítko Napsat zprávu. Budete přesměrováni do chatu, kde si můžete vyměňovat zprávy v reálném čase.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">O CzechServices</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Spojujeme zákazníky s profesionálními poskytovateli služeb v celé České republice.
          Jednoduše, bezpečně a rychle.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl text-white p-10 mb-12 text-center">
        <h2 className="text-2xl font-bold mb-3">Naše mise</h2>
        <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
          Věříme, že každý zaslouží snadný přístup ke kvalitním službám. Proto budujeme platformu,
          kde ověření profesionálové mohou prezentovat své dovednosti a zákazníci mohou bezpečně rezervovat.
        </p>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {[
          { icon: Shield, title: 'Bezpečnost',     desc: 'Všichni poskytovatelé procházejí ověřením totožnosti a věku' },
          { icon: Star,   title: 'Kvalita',         desc: 'Systém hodnocení zajišťuje vysoký standard poskytovaných služeb' },
          { icon: Clock,  title: 'Rychlost',        desc: 'Rezervace za pár kliknutí, bez zbytečného čekání' },
          { icon: Users,  title: 'Komunita',        desc: 'Tisíce spokojených zákazníků i poskytovatelů po celé ČR' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div id="faq" className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Časté dotazy</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-gray-900 select-none">
                {q}
                <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="grid sm:grid-cols-2 gap-5 mb-16">
        <div id="terms" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3">Obchodní podmínky</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Používáním platformy CzechServices souhlasíte s našimi obchodními podmínkami.
            Platforma slouží jako zprostředkovatel mezi zákazníky a poskytovateli služeb.
            CzechServices neodpovídá za kvalitu konkrétních poskytnutých služeb.
          </p>
        </div>
        <div id="privacy" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3">Ochrana soukromí</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vaše osobní data zpracováváme pouze v nezbytném rozsahu dle GDPR.
            Data nejsou sdílena s třetími stranami bez vašeho souhlasu.
            Máte právo na přístup, opravu nebo smazání svých dat kdykoli.
          </p>
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kontaktujte nás</h2>
        <p className="text-gray-500 mb-6">Máte dotaz nebo potřebujete pomoc? Rádi vám pomůžeme.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@czechservices.cz"
            className="flex items-center gap-2 px-5 py-3 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Mail className="w-4 h-4" />
            support@czechservices.cz
          </a>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Napsat zprávu
          </Link>
        </div>
      </div>
    </div>
  )
}
