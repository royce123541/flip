import type { NextFunction, Request, Response } from 'express'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { config } from '../config.js'
import { User } from '../models/User.js'

if (!getApps().length) {
  initializeApp({ credential: cert(config.firebaseServiceAccount) })
}

export interface AuthedRequest extends Request {
  /** authTime: when the user last actually signed in (seconds since epoch), not when the token was refreshed. */
  user?: { uid: string; email: string; authTime: number }
}

/** Verifies the Firebase ID token and upserts the Mongo user record. */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.user = { uid: decoded.uid, email: decoded.email ?? '', authTime: decoded.auth_time }
    await User.updateOne({ uid: decoded.uid }, { $setOnInsert: { email: req.user.email } }, { upsert: true })
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
