import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { FileLock2, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Secure & Anonymous Platform
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl leading-tight">
          Confidential Support When <br />
          <span className="text-blue-600">You Need It Most</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          Upright connects vulnerable individuals with verified professionals. Submit cases securely, upload evidence, and get the help you deserve.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <Link href="/submit-case" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 group">
              Submit a Case Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/access-case" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-lg px-8 h-14 bg-white hover:bg-slate-50 border-slate-200">
              Access Existing Case
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <FileLock2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">End-to-End Security</h3>
            <p className="text-slate-600 leading-relaxed">
              Your case is protected with a unique Access Code. Upload critical evidence up to 20MB strictly linked to your anonymized profile.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Verified Professionals</h3>
            <p className="text-slate-600 leading-relaxed">
              We match you directly with highly qualified, verified Lawyers, Counselors, and Financial Advisors who specifically handle your class of disputes.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
