import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { config } from './config.js'
import { analyticsRouter } from './routes/analytics.js'
import { billingRouter, stripeWebhook } from './routes/billing.js'
import { decksRouter } from './routes/decks.js'
import { generateRouter } from './routes/generate.js'
import { meRouter } from './routes/me.js'
import { quizRouter } from './routes/quiz.js'
import { studyRouter } from './routes/study.js'

// Built React app. Same relative location from src/ (dev) and dist/ (production).
const clientDist = path.resolve(import.meta.dirname, '../../client/dist')
const serveClient = existsSync(path.join(clientDist, 'index.html'))

const app = express()
// Render (and most hosts) sit behind one proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1)

app.use(
  helmet({
    // Firebase's Google sign-in popup talks back to this page; the default "same-origin" breaks it.
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://apis.google.com'],
        connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseapp.com'],
        frameSrc: ['https://*.firebaseapp.com', 'https://accounts.google.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
      },
    },
  }),
)
app.use(cors({ origin: config.CLIENT_ORIGIN }))

// Stripe signature verification needs the raw body, so this must come BEFORE express.json().
// It is also exempt from rate limits: Stripe retries in bursts.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
app.use(express.json({ limit: '1mb' }))

const limit = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: message, code: 'rate_limited' },
  })
app.use('/api', limit(15, 600, 'Too many requests. Please slow down and try again shortly.'))
// AI generation costs money per call, so it gets a much tighter per-IP cap on top of the monthly quota.
app.use('/api/generate', limit(60, 30, 'Too many generation requests. Please wait a while before trying again.'))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/me', meRouter)
app.use('/api/decks', decksRouter)
app.use('/api/study', studyRouter)
app.use('/api/generate', generateRouter)
app.use('/api/billing', billingRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/quiz', quizRouter)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

if (serveClient) {
  // Hashed build assets never change, so they can be cached for a year.
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(clientDist, { index: false }))
  // Every other path is a client-side route (e.g. /decks/123): send the app and let React Router handle it.
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

try {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
} catch {
  console.error('\nCould not connect to MongoDB. Check MONGODB_URI, that your Atlas user and password are right,')
  console.error('and that this machine\'s IP address is allowed under Atlas > Network Access.\n')
  process.exit(1)
}

app.listen(config.PORT, () => console.log(`Flip on :${config.PORT}${serveClient ? ' (serving the web app too)' : ' (API only)'}`))
