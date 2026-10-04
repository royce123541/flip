import { Schema, model } from 'mongoose'

const answerSchema = new Schema(
  {
    cardId: { type: Schema.Types.ObjectId, required: true },
    chosen: { type: String, required: true },
    correct: { type: Boolean, required: true },
    // snapshot so results stay readable if the card is later edited or deleted
    front: { type: String, required: true },
    back: { type: String, required: true },
  },
  { _id: false },
)

const attemptSchema = new Schema(
  {
    ownerUid: { type: String, required: true, index: true },
    deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true },
)

export const QuizAttempt = model('QuizAttempt', attemptSchema)
