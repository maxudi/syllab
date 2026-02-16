import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
          <AlertCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Página não encontrada
        </h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link href="/">
          <Button size="lg">
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  )
}
