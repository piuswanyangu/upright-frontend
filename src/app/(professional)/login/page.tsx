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
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

const formSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function ProfessionalLoginPage() {
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await api.post('/auth/login/', values)
      return response.data
    },
    onSuccess: (data) => {
      Cookies.set('access_token', data.access, { expires: 1 })
      Cookies.set('refresh_token', data.refresh, { expires: 7 })
      Cookies.set('upright_role', data.role || 'PROFESSIONAL', { expires: 1 })
      if (data.profession_role) {
        Cookies.set('upright_profession', data.profession_role, { expires: 1 })
      }
      
      if (data.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Login</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Sign in to manage your assigned cases securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin or lawyer1" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    Invalid credentials. Please try again.
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
