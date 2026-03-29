'use client'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case_detail', params.id],
    queryFn: async () => {
      const response = await api.get(`/cases/${params.id}/`)
      return response.data
    }
  })

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['case_timeline', params.id],
    queryFn: async () => {
      const response = await api.get(`/cases/${params.id}/timeline/`)
      return response.data
    }
  })

  if (caseLoading || timelineLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 flex items-center mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Case <span className="font-mono text-blue-600">{caseData?.case_id}</span></h1>
              <p className="text-slate-500 mt-1">Current Status: <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${caseData?.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{caseData?.status}</span></p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle>Case Description</CardTitle>
                <CardDescription>Submitted on {caseData?.created_at ? format(new Date(caseData.created_at), 'PPP') : ''}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-100">
                  {caseData?.description}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle>Evidence Files</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-500 italic text-sm text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                  Evidence viewing is securely restricted. Download endpoint access required.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="flex items-center"><Clock className="w-5 h-5 mr-2 text-slate-400" /> Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {timelineData?.map((event: any, index: number) => (
                    <div key={event.id} className="relative pl-6 border-l-2 border-slate-200 last:border-l-0 pb-6 last:pb-0">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
                      <p className="font-bold text-slate-900 leading-none mb-1">{event.event_type.replace('_', ' ')}</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">{format(new Date(event.created_at), 'PPp')}</p>
                      {event.description && <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 mt-2 shadow-sm">{event.description}</p>}
                    </div>
                  ))}
                  {(!timelineData || timelineData.length === 0) && (
                    <p className="text-slate-500 text-sm text-center italic py-4">No timeline events recorded.</p>
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
