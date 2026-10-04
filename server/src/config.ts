import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string({ error: 'is required (your MongoDB Atlas connection string)' }).min(1, 'is required (your MongoDB Atlas connection string)'),
  // Provide ONE of these. The path form avoids squeezing multi-line JSON into .env.
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRO_PRICE_ID: z.string().default(''),
  FREE_MONTHLY_AI_LIMIT: z.coerce.number().int().positive().default(5),
})

function fail(problems: string[]): never {
  console.error('\nFlip server cannot start. Fix server/.env:\n')
  for (const p of problems) console.error(`  - ${p}`)
  console.error('\nTip: copy server/.env.example to server/.env and fill in the values.\n')
  process.exit(1)
}

const parsed = schema.safeParse(process.env)
if (!parsed.success) fail(parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`))
const env = parsed.data

function loadServiceAccount(): Record<string, unknown> {
  const source = env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? { label: 'FIREBASE_SERVICE_ACCOUNT_PATH', read: () => readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf8') }
    : env.FIREBASE_SERVICE_ACCOUNT
      ? { label: 'FIREBASE_SERVICE_ACCOUNT', read: () => env.FIREBASE_SERVICE_ACCOUNT! }
      : null
  if (!source) {
    return fail(['set FIREBASE_SERVICE_ACCOUNT_PATH (path to the service-account .json file) or FIREBASE_SERVICE_ACCOUNT (the JSON itself)'])
  }

  try {
    const json = JSON.parse(source.read()) as Record<string, unknown>
    for (const key of ['project_id', 'client_email', 'private_key']) {
      if (typeof json[key] !== 'string') return fail([`${source.label}: JSON is missing "${key}". Download a fresh key from Firebase > Project settings > Service accounts.`])
    }
    return json
  } catch (e) {
    const reason = e instanceof Error && 'code' in e && e.code === 'ENOENT' ? 'file not found' : 'not valid JSON'
    return fail([`${source.label}: ${reason}`])
  }
}

export const config = { ...env, firebaseServiceAccount: loadServiceAccount() }
