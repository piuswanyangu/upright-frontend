import Link from 'next/link'
import { LayoutDashboard, LogOut, FileText, Settings } from 'lucide-react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    router.push('/login')
  }

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">U</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Upright PRO</span>
      </div>
      
      <div className="flex-1 py-8 px-4 space-y-2">
        <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <FileText className="w-5 h-5" /> My Cases
        </Link>
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" /> Settings
        </Link>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md hover:bg-slate-800 hover:text-white transition-colors text-red-400 hover:text-red-300">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  )
}
