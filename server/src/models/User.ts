import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    subscriptionStatus: { type: String, enum: ['none', 'active', 'past_due', 'canceled'], default: 'none' },
    stripeCustomerId: { type: String, index: true, sparse: true },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    // AI quota: counter resets when aiPeriod (YYYY-MM, UTC) changes
    aiPeriod: { type: String, default: '' },
    aiUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const User = model('User', userSchema)
