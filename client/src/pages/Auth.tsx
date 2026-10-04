import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { PixelLogo } from '@/components/pixel/Logo'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/firebase'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})
type Values = z.infer<typeof schema>

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/dashboard'
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={from} replace />

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await fn()
      navigate(from, { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = ({ email, password }: Values) =>
    run(async () => {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(cred.user)
        toast.success('Account created. Check your email to verify it.')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    })

  const reset = async () => {
    const email = getValues('email')
    if (!z.string().email().safeParse(email).success) return toast.error('Enter your email first')
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Could not send reset email')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <PixelLogo className="mx-auto size-12" />
          <CardTitle className="text-2xl">{isSignup ? 'Create your account' : 'Welcome back'}</CardTitle>
          <CardDescription>{isSignup ? 'Start turning notes into flashcards.' : 'Sign in to keep studying.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))}>
            Continue with Google
          </Button>
          <div className="text-center text-xs text-muted-foreground">or</div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} aria-invalid={!!errors.password} {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {isSignup ? 'Sign up' : 'Log in'}
            </Button>
          </form>
          {!isSignup && (
            <Button variant="link" className="h-auto w-full p-0 text-xs" onClick={reset}>
              Forgot password?
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account? ' : 'New to Flip? '}
            <Link className="font-semibold text-foreground underline decoration-2 underline-offset-4 hover:decoration-dashed" to={isSignup ? '/login' : '/signup'}>
              {isSignup ? 'Log in' : 'Sign up'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
