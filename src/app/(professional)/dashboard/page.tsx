'use client'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { FileStack, ShieldAlert, CheckCircle2, History } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'

export default function ProfessionalDashboard() {
  const [profession, setProfession] = useState('Professional')
  
  useEffect(() => {
    const prof = Cookies.get('upright_profession')
    if (prof) {
      setProfession(prof.charAt(0).toUpperCase() + prof.slice(1).toLowerCase())
    }
  }, [])

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['professional_dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/professional/')
      return response.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    )
  }

  const assignedCases = dashboardData?.assigned_cases || []
  const activeCases = assignedCases.filter((c: any) => c.status === 'OPEN' || c.status === 'IN_PROGRESS')
  const closedCases = assignedCases.filter((c: any) => c.status === 'CLOSED')

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profession} Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your assigned cases and recent activity.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center">
              <div className="p-4 bg-blue-100 text-blue-700 rounded-xl mr-4"><FileStack className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Assigned</p>
                <p className="text-3xl font-bold text-slate-900">{assignedCases.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center">
              <div className="p-4 bg-amber-100 text-amber-700 rounded-xl mr-4"><ShieldAlert className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active / Open</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData?.active_cases_count || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center">
              <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl mr-4"><CheckCircle2 className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Closed Cases</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData?.closed_cases_count || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Active Cases Section */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle>Active / Pending Cases</CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-100">
                {activeCases.map((caseItem: any) => (
                  <Link href={`/dashboard/cases/${caseItem.id}`} key={caseItem.id} className="block hover:bg-slate-50 transition-colors p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-slate-900">{caseItem.case_id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${caseItem.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {caseItem.status}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 text-sm max-w-xl">{caseItem.description}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400 font-medium">
                        {format(new Date(caseItem.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
                {activeCases.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">No active or pending cases.</div>
                )}
              </div>
            </Card>

            {/* Completed Cases Section */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-slate-600">Completed Cases History</CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-100">
                {closedCases.map((caseItem: any) => (
                  <Link href={`/dashboard/cases/${caseItem.id}`} key={caseItem.id} className="block hover:bg-slate-50 transition-colors p-6 opacity-75">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-slate-900">{caseItem.case_id}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                            {caseItem.status}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 text-sm max-w-xl">{caseItem.description}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        {format(new Date(caseItem.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
                {closedCases.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">No completed cases yet.</div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="flex items-center text-lg"><History className="w-5 h-5 mr-2 text-slate-400" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {dashboardData?.recent_activity?.map((activity: any) => (
                    <div key={activity.id} className="p-4 flex gap-4">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{activity.event_type.replace('_', ' ')}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-2">{format(new Date(activity.created_at), 'PPp')}</p>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.recent_activity || dashboardData.recent_activity.length === 0) && (
                    <div className="p-6 text-center text-xs text-slate-500">No recent activity.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
