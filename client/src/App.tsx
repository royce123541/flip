import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/flip/ProtectedRoute'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/useAuth'
import AppLayout from '@/layouts/AppLayout'
import Account from '@/pages/Account'
import Analytics from '@/pages/Analytics'
import Auth from '@/pages/Auth'
import BillingCancel from '@/pages/BillingCancel'
import BillingSuccess from '@/pages/BillingSuccess'
import Dashboard from '@/pages/Dashboard'
import DeckDetail from '@/pages/DeckDetail'
import DeckEditor from '@/pages/DeckEditor'
import Gallery from '@/pages/Gallery'
import Generate from '@/pages/Generate'
import GenerateReview from '@/pages/GenerateReview'
import Landing from '@/pages/Landing'
import Pricing from '@/pages/Pricing'
import Quiz from '@/pages/Quiz'
import QuizResults from '@/pages/QuizResults'
import Study from '@/pages/Study'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Auth mode="login" />} />
                <Route path="/signup" element={<Auth mode="signup" />} />
                {import.meta.env.DEV && <Route path="/gallery" element={<Gallery />} />}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/pricing" element={<Pricing />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/account" element={<Account />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/billing/success" element={<BillingSuccess />} />
                    <Route path="/billing/cancel" element={<BillingCancel />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/decks/new" element={<DeckEditor />} />
                    <Route path="/decks/:id" element={<DeckDetail />} />
                    <Route path="/decks/:id/edit" element={<DeckEditor />} />
                    <Route path="/generate" element={<Generate />} />
                    <Route path="/generate/review" element={<GenerateReview />} />
                    <Route path="/review" element={<Study />} />
                    <Route path="/study/:deckId" element={<Study />} />
                    <Route path="/quiz/results/:attemptId" element={<QuizResults />} />
                    <Route path="/quiz/:deckId" element={<Quiz />} />
                  </Route>
                </Route>
                {/* Unknown addresses go home; the landing page sends signed-in people on to their dashboard. */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
