# Flip: AI-Powered Flashcard & Quiz Builder

Turn notes into flashcards and quizzes, study them with spaced repetition, and track progress.
React (Vite) + Node/Express + MongoDB, with Firebase Auth, Gemini, and Stripe.

```
client/   React + TypeScript + Tailwind + shadcn/ui   (http://localhost:5173)
server/   Express + Mongoose REST API                 (http://localhost:4000)
```

## What's in it

| Area | What it does |
|---|---|
| Decks | Create, edit, duplicate, delete, search. Manual card builder. |
| Study | Flashcards with simplified SM-2 spaced repetition (Again / Hard / Good / Easy, keys 1-4). |
| Quiz | Multiple choice from any deck, graded on the server, with a results review. |
| AI generation | Paste text (Free) or upload a PDF (Pro). Review and edit cards before saving. |
| Billing | Stripe subscription (Pro), Checkout, customer portal, webhook sync. |
| Analytics | Basic stats for Free. Streaks, accuracy trend, activity and deck mastery for Pro. |

Free plan: 5 AI generations per calendar month (UTC), paste-text only. Pro: PDF upload, higher AI limit, full analytics.

## Prerequisites

- Node.js 20+ (developed on 25) and npm
- Accounts (all have free tiers): Firebase, MongoDB Atlas, Google AI Studio, Stripe (test mode)
- Optional: the [Stripe CLI](https://stripe.com/docs/stripe-cli) to test webhooks locally

## 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Configure services

Copy both example files, then fill them in using the sections below:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Vite only reads `client/.env` at startup, so restart `npm run dev` after editing it.

### Firebase (sign-in)

1. [Firebase console](https://console.firebase.google.com) > create a project.
2. **Build > Authentication > Sign-in method**: enable **Email/Password** and **Google**.
3. **Project settings > General > Your apps > Web (`</>`)**: register an app and copy its config into `client/.env`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
4. **Project settings > Service accounts > Generate new private key**. Save the file as
   `server/firebase-service-account.json` (already git-ignored) and keep
   `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json` in `server/.env`.

`localhost` is an authorised sign-in domain by default. Never commit the key file.

### MongoDB Atlas (data)

1. Create a free cluster, then **Database Access**: add a user with a password.
2. **Network Access**: add your current IP address (or `0.0.0.0/0` for local development only).
3. **Connect > Drivers**: copy the connection string into `MONGODB_URI`, and add a database name before the `?`
   (for example `...mongodb.net/flip?retryWrites=true`). URL-encode special characters in the password.

### Gemini (AI generation)

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY`.
2. The model is `GEMINI_MODEL` (default `gemini-3.5-flash-lite`). If Google rejects the name, change it here. No code change needed.

Without a key the app still runs; AI generation returns a clear "not configured" error.

### Stripe (Pro plan), test mode only

Test mode is free: no bank details, no verification, no fees. Keep the **Test mode** toggle (top right of the dashboard) on, and never put a live `sk_live_...` key in `.env`.

1. **Product catalogue**: create a "Flip Pro" product with a **recurring monthly** price. Copy the `price_...` ID to `STRIPE_PRO_PRICE_ID`.
2. **Developers > API keys**: copy the secret key (`sk_test_...`) to `STRIPE_SECRET_KEY`.
3. **Activate the Customer portal** (where users update their card or cancel). Open
   https://dashboard.stripe.com/test/settings/billing/portal, click **Activate test link**, keep the defaults
   (cancellation "At end of billing period" must stay on), and click **Save**. "Manage billing" fails until you do.
4. **Install the Stripe CLI.** Easiest on Windows: download `stripe_X.Y.Z_windows_x86_64.zip` from
   https://github.com/stripe/stripe-cli/releases/latest, extract `stripe.exe` to a folder such as `C:\Users\<you>\stripe`,
   and add that folder to your user `Path` (Start > "Edit the system environment variables" > Environment Variables).
   Open a **new** terminal and check with `stripe --version`. (Scoop also works: `scoop install stripe`.)
5. **Sign the CLI in:** run `stripe login`, press Enter, and click **Allow access** in the browser tab it opens.
6. **Forward webhooks** in a terminal of its own, and leave it running while you develop. Current CLI versions require
   the event list; these are the events the server handles:
   ```bash
   stripe listen --forward-to localhost:4000/api/billing/webhook --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed
   ```
   It prints `Ready! ... Your webhook signing secret is whsec_...`. Copy that value into `STRIPE_WEBHOOK_SECRET` in
   `server/.env` (no quotes, no spaces), then restart the server. The secret stays the same across runs on the same machine.
7. **Check it** from another terminal: `stripe trigger checkout.session.completed`. The listener should show
   `<-- [200] POST http://localhost:4000/api/billing/webhook`.
8. Pay with the test card `4242 4242 4242 4242`, any future expiry date, any CVC.

`VITE_PRO_PRICE_LABEL` in `client/.env` is display text only. Keep it in sync with the real Stripe price.

## 3. Run

Three terminals:

```bash
cd server && npm run dev     # API on :4000 (start this first)
stripe listen ...            # the full command from Stripe step 6
cd client && npm run dev     # app on :5173
```

Open http://localhost:5173 and sign up. `http://localhost:5173/gallery` shows every UI component without signing in.

## Trying Pro features without Stripe

Set `plan` to `"pro"` on your document in the `users` collection (Atlas > Browse Collections). PDF upload and
full analytics unlock immediately. Setting it back to `"free"` re-applies the limits.

## Checks

```bash
cd server && npm run typecheck
cd client && npx tsc -b && npm run build
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Flip needs a little setup" screen | `client/.env` is missing the Firebase values. Fill them in and restart Vite. |
| Server exits with "Fix server/.env" | The message names the exact variable. |
| "Could not connect to MongoDB" | Wrong URI/password, or your IP is not in Atlas Network Access. |
| Sign-in works but every API call is 401 | The service-account key belongs to a different Firebase project than the web config. |
| Browser shows CORS errors | `CLIENT_ORIGIN` in `server/.env` must match the app's URL exactly (default `http://localhost:5173`). |
| Upgrade works but plan stays Free | The webhook is not reaching the server. Is `stripe listen` running, and does `STRIPE_WEBHOOK_SECRET` match what it printed? |
| "Manage billing" fails | Activate the Customer portal in the Stripe dashboard (test mode). |
| `stripe listen` says "must specify events to forward" | Add the `--events ...` list from Stripe step 6. |
| `stripe listen` stops with "expired OAuth token" (401) | The CLI sign-in expired. Run `stripe login` again, then restart `stripe listen`. If the printed `whsec_...` changed, update `.env` and restart the server. |
| Listener shows `[400] Invalid signature` | `STRIPE_WEBHOOK_SECRET` does not match the `whsec_...` the listener printed, or the server was not restarted after editing `.env`. |
| Listener shows "connection refused" | The server is not running on port 4000. Start it before `stripe listen`. |
| `winget install` cannot find the Stripe CLI | Use the zip download from Stripe step 4 instead. |
| PDF says "scanned" | Only text-based PDFs are supported (no OCR). |

## Known limits

Not included, by design: real-time multiplayer, native apps, free-text answer grading, offline mode, handwriting OCR.
Not built yet: landing page, resuming a quiz mid-way, sharing or importing decks.
