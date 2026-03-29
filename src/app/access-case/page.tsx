'use client'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { AlertCircle, LockKeyhole } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

const formSchema = z.object({
  case_id: z.string().min(1, 'Case ID is required.'),
  access_code: z.string().min(1, 'Access code is required.'),
})

export default function AccessCasePage() {
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case_id: '',
      access_code: '',
    },
  })

  const accessMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await api.post('/cases/access/', values)
      return { data: response.data, credentials: values }
    },
    onSuccess: (result) => {
      // Store credentials in sessionStorage to access the case in subsequent routes safely
      sessionStorage.setItem('upright_case_auth', JSON.stringify(result.credentials))
      router.push(`/client-dashboard/${result.data.id}`)
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    accessMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <LockKeyhole className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Access Case</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Enter the Case ID and secure Access Code provided when you submitted your case.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="case_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Case ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Case ID..." {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Access Code</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your Access Code..." {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {accessMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    Invalid Case ID or Access Code. Please check your credentials and try again.
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800" 
                  disabled={accessMutation.isPending}
                >
                  {accessMutation.isPending ? 'Verifying...' : 'Access Dashboard'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
