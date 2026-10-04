import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { clearDraft } from '@/lib/generated'

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That password is incorrect.',
  'auth/wrong-password': 'That password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/user-mismatch': 'Please sign in with the same Google account.',
}

/** Re-confirms identity, then permanently deletes the account and everything in it. */
export function DeleteAccountDialog({ email, isPro }: { email: string; isPro: boolean }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const user = auth.currentUser
  const usesPassword = !!user?.providerData.some((p) => p.providerId === 'password')
  const confirmed = typed.trim().toLowerCase() === email.toLowerCase() && (!usesPassword || password.length > 0)

  const reset = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTyped('')
      setPassword('')
    }
  }

  const remove = async () => {
    if (!user || !confirmed) return
    setBusy(true)
    try {
      // The server only deletes after a fresh sign-in, so re-confirm identity first.
      if (usesPassword) await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? email, password))
      else await reauthenticateWithPopup(user, new GoogleAuthProvider())
      await user.getIdToken(true)

      await api<void>('/me', { method: 'DELETE' })

      clearDraft()
      queryClient.clear()
      await signOut(auth).catch(() => undefined)
      toast.success('Your account has been deleted.')
      navigate('/login', { replace: true })
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
        toast.error(AUTH_MESSAGES[e.code] ?? 'Could not confirm it is you. Please try again.')
      } else {
        toast.error(e instanceof Error ? e.message : 'Something went wrong')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={reset}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription render={<div />}>
            <p>This permanently deletes your login, all your decks and cards, quiz results and study history. It cannot be undone.</p>
            {isPro && (
              <p className="mt-2 font-medium text-foreground">
                Your Pro subscription is cancelled immediately. There is no refund for the rest of the current period.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="confirm-email">
              Type <span className="font-semibold">{email}</span> to confirm
            </Label>
            <Input id="confirm-email" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
          {usesPassword ? (
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Your password</Label>
              <Input id="confirm-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You'll be asked to sign in with Google once more to confirm.</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={remove} disabled={!confirmed || busy}>
            {busy ? 'Deleting…' : 'Delete forever'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
