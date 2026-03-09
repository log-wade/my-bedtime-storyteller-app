# My Bedtime Storyteller

An Audible-style app: search for a book, sign in with Google or Apple, subscribe with a 7-day free trial, and listen with a full media player (play, pause, rewind, fast-forward, seek, speed). Built with Next.js, ElevenLabs, Stripe, and Auth.js.

## Features

- **Book search** — Search by title or author. Results from [Project Gutenberg](https://www.gutenberg.org/) via [Gutendex](https://gutendex.com/).
- **Book detail pages** — Cover, title, authors, full description (summaries), subjects, and languages.
- **Media player** — Persistent bottom bar: play, pause, rewind (−15s), fast-forward (+15s), seek bar, playback speed (0.75×–1.5×). Stays visible across pages.
- **Auth** — Sign in with **Google** or **Apple** (Auth.js / NextAuth v5). Protected routes: Account, Library.
- **Subscription** — Monthly plan with **7-day free trial** (Stripe). Listening is gated: only subscribed (or trialing) users can use “Listen / Read to me.”
- **Account** — Profile, “Manage subscription” (Stripe Billing Portal), sign out.

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/log-wade/my-bedtime-storyteller-app.git
   cd my-bedtime-storyteller-app
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and set:

   - **Auth:** `AUTH_SECRET` (e.g. `openssl rand -base64 32`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`. Create OAuth clients in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId).
   - **ElevenLabs:** `ELEVENLABS_API_KEY` from [elevenlabs.io](https://elevenlabs.io/app/settings/api-keys).
   - **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_ID`, `NEXT_PUBLIC_APP_URL`. A product **"My Bedtime Storyteller"** and monthly price **$9.99** (`price_1T8onuRsxm9dFvTh6smwqBmQ`) are already created in your Stripe account—use that price ID or create your own. Add a [webhook](https://dashboard.stripe.com/webhooks) pointing to `https://your-domain.com/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; put the signing secret in `STRIPE_WEBHOOK_SECRET`.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in → Pricing → Start 7-day free trial → then search and listen.

## Tech

- **Next.js 16** (App Router), **Tailwind CSS**
- **Auth.js (NextAuth v5)** — Google & Apple OAuth
- **Stripe** — Checkout (subscription + 7-day trial), Billing Portal, webhooks
- **ElevenLabs** — text-to-speech
- **Gutendex** — Project Gutenberg search and metadata

## Pages

- **/** — Search and results; “Read to me” starts the player.
- **/book/[id]** — Book detail (description, subjects, “Listen”).
- **/pricing** — Monthly plan, 7-day trial, “Start 7-day free trial” (Stripe Checkout).
- **/account** — Profile, Manage subscription (Stripe Portal), Sign out (protected).
- **/library** — Placeholder (protected).

## API

- `GET /api/books?q=...` — Search books.
- `GET /api/books/[id]` — Full book details (for detail page).
- `GET /api/read/[bookId]` — Audio for book start. **Requires** signed-in user with active or trialing subscription; returns 401/403 otherwise.
- `POST /api/stripe/checkout` — Create Checkout Session (subscription, 7-day trial); returns `{ url }`.
- `POST /api/stripe/portal` — Create Billing Portal session (body: `{ customerId }`); returns `{ url }`.
- `POST /api/stripe/webhook` — Stripe webhooks (verify with `STRIPE_WEBHOOK_SECRET`).
- `GET /api/stripe/subscription?email=...` or `?customerId=...` — Check subscription status.

## Live app

**https://my-bedtime-storyteller-app.vercel.app**

Set all env vars in Vercel (Auth, ElevenLabs, Stripe, `NEXT_PUBLIC_APP_URL`). Configure Stripe webhook to:

**https://my-bedtime-storyteller-app.vercel.app/api/stripe/webhook**

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Put the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

## License

MIT
