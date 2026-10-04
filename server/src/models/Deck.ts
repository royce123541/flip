import { Schema, model } from 'mongoose'

const cardSchema = new Schema({
  front: { type: String, required: true, trim: true },
  back: { type: String, required: true, trim: true },
  distractors: { type: [String], default: [], validate: (v: string[]) => v.length <= 3 },
  // simplified SM-2 scheduling state
  ease: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 }, // days
  due: { type: Date, default: () => new Date() },
  reps: { type: Number, default: 0 },
})

const deckSchema = new Schema(
  {
    ownerUid: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    cards: { type: [cardSchema], default: [] },
  },
  { timestamps: true },
)

export const Deck = model('Deck', deckSchema)
