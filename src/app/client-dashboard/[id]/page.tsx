'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FileUp, ShieldAlert, Clock, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export default function ClientDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [credentials, setCredentials] = useState<{ case_id: string; access_code: string } | null>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const creds = sessionStorage.getItem('upright_case_auth')
    if (creds) {
      setCredentials(JSON.parse(creds))
    } else {
      router.push('/access-case')
    }
  }, [router])

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', credentials?.case_id],
    queryFn: async () => {
      const response = await api.post('/cases/access/', credentials)
      return response.data
    },
    enabled: !!credentials,
  })

  // To get timeline, we need to pass case_id and access_code since the pure timeline endpoint requires Auth.
  // Wait, our backend `/cases/{id}/timeline/` uses `IsAuthenticated` which means clients can't hit it directly unless we change the permission.
  // Let's rely on the caseData for now or just display case details. Since the client is unauthenticated, they shouldn't hit authenticated endpoints. Let's make an evidence upload mutation instead.

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/evidence/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Evidence uploaded successfully. The professional team will review it.")
      setFile(null)
      queryClient.invalidateQueries({ queryKey: ['case', credentials?.case_id] })
    },
    onError: () => {
      toast.error("Failed to upload evidence. Ensure the file is under 20MB.")
    }
  })

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !caseData) return
    const formData = new FormData()
    formData.append('case', caseData.id)
    formData.append('file', file)
    uploadMutation.mutate(formData)
  }

  if (isLoading || !credentials) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Case Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-blue-600" /> Secure view for Case ID: <span className="font-mono ml-2 font-semibold text-slate-700">{caseData.case_id}</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-medium">
            Status: <span className={caseData.status === 'OPEN' ? 'text-green-600' : 'text-blue-600'}>{caseData.status}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Info className="w-5 h-5 mr-2 text-slate-400"/> Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                  {caseData.description}
                </div>
                <div className="mt-6 flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-2" /> Submitted on {format(new Date(caseData.created_at), 'PPP')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><FileUp className="w-5 h-5 mr-2 text-slate-400"/> Context & Evidence</CardTitle>
                <CardDescription>Upload supporting documents (PDF, JPG, PNG). Max 20MB.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!file || uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Evidence'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.assigned_professionals?.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.assigned_professionals.map((prof: any) => (
                      <div key={prof.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mr-3">
                          {prof.name.charAt(0) || prof.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{prof.name || prof.username}</p>
                          <p className="text-sm text-slate-500">{prof.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">No professionals assigned yet. Your case is being reviewed by admins.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
