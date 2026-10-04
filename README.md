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

## Deploy to Render

In production a single Render web service runs the Express server, which also serves the built React app.
One URL, no CORS setup. `render.yaml` in the repo root describes the service.

**Free tier note:** the free plan sleeps after 15 minutes without traffic, and the next visit takes about 30-50 seconds
to wake it. Open the site a minute before a demo. Stripe retries webhooks, so a sleeping server does not lose payments.

### 1. Put the code on GitHub
Create an empty GitHub repository, then from the project root:
```bash
git remote add origin https://github.com/<you>/flip.git
git push -u origin main
```
`.env` files and the Firebase key file are git-ignored; they never leave your machine.

### 2. Create the service from the blueprint
1. In the [Render dashboard](https://dashboard.render.com), choose **New > Blueprint** and pick your repository.
   Render reads `render.yaml` and creates a web service called `flip`.
2. It asks for every value marked as secret. Copy them from your local `server/.env` and `client/.env`:
   `MONGODB_URI`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and the four `VITE_FIREBASE_*` values.
   For now, put any placeholder in `STRIPE_WEBHOOK_SECRET` and `CLIENT_ORIGIN`; you set them properly in step 4.
   Do **not** add `VITE_API_URL`; in production the app calls its own server.
3. Add the Firebase key: open the service, then **Environment > Secret Files > Add Secret File**. Name it
   `firebase-service-account.json` and paste the contents of `server/firebase-service-account.json`.
   (The blueprint already points `FIREBASE_SERVICE_ACCOUNT_PATH` at `/etc/secrets/firebase-service-account.json`.)
4. Deploy. When it finishes, copy your URL (e.g. `https://flip-ab12.onrender.com`).

### 3. Let the services know about your new URL
- **MongoDB Atlas > Network Access:** add `0.0.0.0/0`. Render's outgoing IP addresses change, so a fixed allowlist does not work.
  Use a strong database password.
- **Firebase > Authentication > Settings > Authorized domains:** add your Render domain (without `https://`).
  Without this, Google sign-in fails on the live site.
- **Stripe (test mode) > Developers > Webhooks > Add endpoint:**
  URL `https://<your-domain>/api/billing/webhook`, with these events: `checkout.session.completed`,
  `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`,
  `invoice.paid`, `invoice.payment_failed`. Then reveal the endpoint's **signing secret** (`whsec_...`).
  This is a different secret from the one `stripe listen` prints locally.

### 4. Finish the configuration
In Render, under **Environment**, set:
- `CLIENT_ORIGIN` to your full URL, e.g. `https://flip-ab12.onrender.com` (Stripe uses it to send users back after checkout)
- `STRIPE_WEBHOOK_SECRET` to the endpoint's signing secret from step 3

Save; Render redeploys automatically. Every later `git push` to `main` also redeploys.

### 5. Check the live site
1. `https://<your-domain>/api/health` returns `{"ok":true}`.
2. Sign up with email, and separately try **Continue with Google**.
3. Create a deck, study it, take a quiz, and generate cards with AI.
4. Upgrade with the test card `4242 4242 4242 4242`. In Stripe > Webhooks, the endpoint's deliveries should show `200`.
5. Refresh on a deep page such as `/decks/...`; it should load, not 404.

**Stay in Stripe test mode** unless you intend to take real payments. Live mode requires Stripe to verify you
as a business, plus live keys, a live price, and a separate live webhook endpoint.

### Production safeguards already in place
Security headers (helmet, with a content security policy that allows Firebase and Google sign-in), per-IP rate limits
(600 API requests per 15 minutes, and 30 AI generations per hour on top of the monthly quota), year-long caching for
built assets, and the developer-only `/gallery` page is excluded from production builds.

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
| Live site: Google sign-in fails or closes immediately | Add the Render domain to Firebase > Authentication > Settings > Authorized domains. |
| Live site: "Could not connect to MongoDB" in Render logs | Allow `0.0.0.0/0` in Atlas > Network Access. |
| Live site: upgrade works but plan stays Free | Check Stripe > Webhooks > your endpoint's deliveries, and that `STRIPE_WEBHOOK_SECRET` is that endpoint's secret (not the `stripe listen` one). |
| Live site takes ~40 s to load | Render's free plan was asleep. Later requests are fast. |
| Local `npm ci` fails with `EPERM ... unlink` on Windows | A running dev server is holding files in `node_modules`. Stop `npm run dev` first, or use `npm install`. |
| PDF says "scanned" | Only text-based PDFs are supported (no OCR). |

## Known limits

Not included, by design: real-time multiplayer, native apps, free-text answer grading, offline mode, handwriting OCR.
Not built yet: landing page, resuming a quiz mid-way, sharing or importing decks.
