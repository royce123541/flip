import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { config } from './config.js'
import { analyticsRouter } from './routes/analytics.js'
import { billingRouter, stripeWebhook } from './routes/billing.js'
import { decksRouter } from './routes/decks.js'
import { generateRouter } from './routes/generate.js'
import { meRouter } from './routes/me.js'
import { quizRouter } from './routes/quiz.js'
import { studyRouter } from './routes/study.js'

const app = express()
app.use(cors({ origin: config.CLIENT_ORIGIN }))
// Stripe signature verification needs the raw body, so this must come BEFORE express.json()
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/me', meRouter)
app.use('/api/decks', decksRouter)
app.use('/api/study', studyRouter)
app.use('/api/generate', generateRouter)
app.use('/api/billing', billingRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/quiz', quizRouter)

try {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
} catch {
  console.error('\nCould not connect to MongoDB. Check MONGODB_URI in server/.env, that your Atlas user and password are right,')
  console.error('and that your current IP address is allowed under Atlas > Network Access.\n')
  process.exit(1)
}

app.listen(config.PORT, () => console.log(`Flip API on :${config.PORT}`))
