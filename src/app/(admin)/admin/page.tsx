'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BarChart3, Users, FolderOpen, FileCheck } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const { data: adminData, isLoading } = useQuery({
    queryKey: ['admin_dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin/')
      return response.data
    }
  })

  const assignMutation = useMutation({
    mutationFn: async ({ caseId, professionalId }: { caseId: string, professionalId: string }) => {
      const response = await api.post(`/cases/${caseId}/assign/`, { professional_id: professionalId })
      return response.data
    },
    onSuccess: () => {
      toast.success('Case assigned successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard'] })
    },
    onError: () => {
      toast.error('Failed to assign professional. Please try again.')
    }
  })

  const handleAssign = (caseId: string, professionalId: string) => {
    if (professionalId) {
      assignMutation.mutate({ caseId, professionalId })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </main>
      </div>
    )
  }

  const allCases = adminData?.all_cases || []
  const professionals = adminData?.professionals || []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 mt-1">Platform-wide statistics and management overview.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-lg mr-4"><FolderOpen className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Cases</p>
                <p className="text-3xl font-bold text-slate-900">{adminData?.total_cases || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-lg mr-4"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Professionals</p>
                <p className="text-3xl font-bold text-slate-900">{adminData?.active_professionals || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-lg mr-4"><FileCheck className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Evidence Uploads</p>
                <p className="text-3xl font-bold text-slate-900">{adminData?.evidence_uploads || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-lg mr-4"><BarChart3 className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Open Cases</p>
                <p className="text-3xl font-bold text-slate-900">{adminData?.case_status_statistics?.OPEN || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-sm border-slate-200 lg:col-span-1">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle>Case Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="font-semibold text-amber-700">OPEN</span>
                  <span className="font-bold text-xl">{adminData?.case_status_statistics?.OPEN || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="font-semibold text-blue-700">IN PROGRESS</span>
                  <span className="font-bold text-xl">{adminData?.case_status_statistics?.IN_PROGRESS || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">CLOSED</span>
                  <span className="font-bold text-xl">{adminData?.case_status_statistics?.CLOSED || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 lg:col-span-2">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle>All Cases & Assignment</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {allCases.map((caseItem: any) => {
                const isAssigned = caseItem.assigned_professionals && caseItem.assigned_professionals.length > 0;
                return (
                  <div key={caseItem.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-slate-900">{caseItem.case_id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${caseItem.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : caseItem.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                            {caseItem.status}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 text-sm max-w-xl">{caseItem.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Submitted {format(new Date(caseItem.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="w-full sm:w-64 flex flex-col justify-center items-end bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {isAssigned ? (
                          <div className="text-sm">
                            <span className="text-slate-500 mr-2 text-xs uppercase tracking-wide">Assigned To</span>
                            <span className="font-semibold text-slate-900 text-right block">
                              {caseItem.assigned_professionals.map((p: any) => `${p.name || p.username} (${p.role})`).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assign Professional</label>
                            <Select onValueChange={(val) => handleAssign(caseItem.id, val)} disabled={assignMutation.isPending}>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select staff..." />
                              </SelectTrigger>
                              <SelectContent>
                                {professionals.map((prof: any) => (
                                  <SelectItem key={prof.id} value={prof.id.toString()}>
                                    {prof.name || prof.username} — {prof.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {allCases.length === 0 && (
                <div className="p-8 text-center text-slate-500">No cases found in the system.</div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
