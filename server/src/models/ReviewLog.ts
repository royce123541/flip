import { Schema, model } from 'mongoose'

/** One row per card answered (flashcard rating or quiz answer). Source of truth for streaks and activity charts. */
const reviewLogSchema = new Schema({
  ownerUid: { type: String, required: true },
  deckId: { type: Schema.Types.ObjectId, required: true },
  cardId: { type: Schema.Types.ObjectId, required: true },
  grade: { type: String, enum: ['again', 'hard', 'good', 'easy'], required: true },
  source: { type: String, enum: ['study', 'quiz'], required: true },
  at: { type: Date, default: () => new Date() },
  // Scheduling state before this answer, so a study answer can be undone exactly.
  prev: {
    type: new Schema({ ease: Number, interval: Number, reps: Number, due: Date }, { _id: false }),
    required: false,
  },
})

reviewLogSchema.index({ ownerUid: 1, at: -1 })

export const ReviewLog = model('ReviewLog', reviewLogSchema)
