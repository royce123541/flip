import { AlertTriangle, Layers, LogOut, Menu, Plus, User } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { useMe } from '@/hooks/useGenerate'
import { auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/decks/new', label: 'Create' },
  { to: '/generate', label: 'AI generate' },
  { to: '/analytics', label: 'Analytics' },
]
const pricingLink = { to: '/pricing', label: 'Pricing' }

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')

/** Shell for signed-in pages and for public pages that share the nav (e.g. /pricing). */
export default function AppLayout() {
  const { user } = useAuth()
  const { data: me } = useMe()
  const links = user ? [...memberLinks, pricingLink] : [pricingLink]
  const initial = (user?.email ?? '?')[0].toUpperCase()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link to={user ? '/dashboard' : '/pricing'} className="flex items-center gap-2 font-bold">
            <Layers className="size-5 text-primary" aria-hidden /> Flip
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Button render={<Link to="/decks/new" />} nativeButton={false} size="sm" className="hidden sm:inline-flex">
                  <Plus /> New deck
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />}>
                    <Avatar className="size-8">
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link to="/account" />}>
                      <User /> Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut(auth)}>
                      <LogOut /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link to="/login" />} nativeButton={false}>Log in</Button>
                <Button size="sm" render={<Link to="/signup" />} nativeButton={false}>Sign up</Button>
              </>
            )}

            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetTitle className="px-4 pt-4">Flip</SheetTitle>
                <nav className="flex flex-col gap-4 p-4" aria-label="Mobile">
                  {links.map((l) => (
                    <NavLink key={l.to} to={l.to} className={linkClass}>
                      {l.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {me?.subscriptionStatus === 'past_due' && (
        <div role="alert" className="border-b border-destructive/40 bg-destructive/10">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 text-sm">
            <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden />
            <span>Your last payment failed.</span>
            <Link to="/account" className="font-medium underline">Update payment method</Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
