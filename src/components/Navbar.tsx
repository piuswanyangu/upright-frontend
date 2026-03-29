import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Upright Support</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/access-case">
            <Button variant="ghost" className="text-slate-600">Access Case</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-slate-200">Professional Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
