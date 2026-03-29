'use client'
import { useState, useRef } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { ClipboardCopy, CheckCircle2, AlertCircle, UploadCloud, FileVideo, FileImage, X } from 'lucide-react'
import Link from 'next/link'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']

const formSchema = z.object({
  description: z.string().min(20, 'Description must be at least 20 characters.').max(5000),
  evidence: z
    .custom<FileList>()
    .refine((files) => !files || files.length === 0 || files.length === 1, 'You can only upload one file.')
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_TYPES.includes(files[0].type),
      'Only images (JPG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are accepted.'
    )
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      'File must not exceed 20 MB.'
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function SubmitCasePage() {
  const [successData, setSuccessData] = useState<{ case_id: string; access_code: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // 1. Submit Case
      const caseResponse = await api.post('/cases/', { description: values.description })
      const caseData = caseResponse.data

      // 2. Upload Evidence if a file is selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('case', caseData.id) // Map evidence to the newly created case UUID
        formData.append('file', selectedFile)
        await api.post('/evidence/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      
      return caseData
    },
    onSuccess: (data) => {
      setSuccessData(data)
    },
  })

  function onSubmit(values: FormValues) {
    submitMutation.mutate(values)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    form.setValue('evidence', files ?? undefined)
    form.trigger('evidence')
    setSelectedFile(files && files.length > 0 ? files[0] : null)
  }

  function clearFile() {
    setSelectedFile(null)
    form.setValue('evidence', undefined)
    form.trigger('evidence')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function formatBytes(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isVideo = selectedFile?.type.startsWith('video/')
  const isImage = selectedFile?.type.startsWith('image/')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-2xl">
          {!successData ? (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-white rounded-t-xl border-b border-slate-100 pb-6">
                <CardTitle className="text-2xl text-slate-900">Submit a New Case</CardTitle>
                <CardDescription className="text-base text-slate-500 mt-2">
                  Please describe your situation in detail and attach supporting evidence if available.
                  Do not include identifiable information (names, exact addresses) if you wish to remain strictly anonymous.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 bg-white space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">
                            Case Description <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your situation clearly — include what happened, when, where, and what kind of support you are seeking..."
                              className="min-h-[200px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-slate-400 text-right">{field.value?.length ?? 0} / 5000 characters (min 20)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Evidence Upload */}
                    <FormField
                      control={form.control}
                      name="evidence"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">
                            Supporting Evidence <span className="text-slate-400 font-normal">(optional)</span>
                          </FormLabel>

                          {!selectedFile ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors rounded-xl p-8 flex flex-col items-center gap-3 text-center"
                            >
                              <UploadCloud className="w-10 h-10 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-700">Click to upload a photo or video</p>
                                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF, MP4, WebM, MOV — max 20 MB</p>
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </div>
                          ) : (
                            <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50">
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                {isVideo ? (
                                  <FileVideo className="w-6 h-6 text-blue-600" />
                                ) : isImage ? (
                                  <FileImage className="w-6 h-6 text-blue-600" />
                                ) : null}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{formatBytes(selectedFile.size)} · {selectedFile.type}</p>
                              </div>
                              <button
                                type="button"
                                onClick={clearFile}
                                className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                                aria-label="Remove file"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {submitMutation.isError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Something went wrong while submitting. Please try again.
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? 'Submitting secure case...' : 'Submit Case'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardHeader className="items-center text-center pb-2">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <CardTitle className="text-2xl text-slate-900">Case Submitted Successfully</CardTitle>
                <CardDescription className="text-emerald-700 font-medium max-w-md">
                  Please save your Case ID and Access Code immediately. You will need both to access your case and upload evidence.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-white border border-emerald-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Case ID</p>
                      <p className="font-mono text-xl font-bold text-slate-900">{successData.case_id}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(successData.case_id)}>
                      <ClipboardCopy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Access Code</p>
                      <p className="font-mono text-xl font-bold text-slate-900">{successData.access_code}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(successData.access_code)}>
                      <ClipboardCopy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-4 border-t border-emerald-100/50 mt-4 bg-white/50 rounded-b-xl">
                <Link href="/access-case" className="w-full">
                  <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white">Go to My Case Dashboard</Button>
                </Link>
                <p className="text-xs text-center text-slate-500 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  If you lose these credentials, you will permanently lose access to this case.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
