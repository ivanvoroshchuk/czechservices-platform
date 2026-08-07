import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stránka nenalezena</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            Domů
          </Link>
          <Link href="/profiles" className="border border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Procházet poskytovatele
          </Link>
        </div>
      </div>
    </div>
  )
}
