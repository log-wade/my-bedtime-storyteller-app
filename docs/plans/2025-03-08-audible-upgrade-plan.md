# Bedtime Storyteller — Audible-Style Upgrade (Hive Plan)

> **For Claude:** Execute via hive-mind-orchestrator: parallel subagents for Auth, Stripe, Media Player, and Pages. Integrate outcomes and gate listening behind subscription.

**Goal:** Upgrade My Bedtime Storyteller into an Audible-style app with a full media player, multiple pages with book details, Stripe monthly subscription (7-day free trial), and Google + Apple OAuth.

**Architecture:** Next.js App Router. Auth via Auth.js (NextAuth v5). Stripe Checkout for subscriptions; webhooks to track subscription status (store in DB or session). Media player is a persistent client component (play, pause, seek, rewind, fast-forward, speed). Book data from Gutendex (include summaries for detail pages). Listening to books gated: only subscribed (or trialing) users can call /api/read.

**Tech Stack:** Next.js 16, Auth.js (next-auth@beta), Stripe (stripe), Tailwind, existing ElevenLabs + Gutendex.

---

## Task 1: Auth (Google + Apple OAuth)

- Install `next-auth@beta` (Auth.js v5). Add `auth.ts` with Google and Apple providers; use env `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`.
- Mount route handler at `src/app/api/auth/[...nextauth]/route.ts`.
- Add middleware to protect `/account`, `/library` (optional), and allow public home/search and book detail.
- Provide `SessionProvider` in layout; add sign-in/sign-out buttons in header/nav.

**Deliverables:** Users can sign in with Google and Apple; session available server- and client-side; protected routes redirect to sign-in.

---

## Task 2: Stripe subscription (7-day trial, checkout, webhooks)

- Install `stripe`. Create product + recurring price in Stripe Dashboard (monthly); set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_ID`.
- **Checkout:** API route `POST /api/stripe/checkout` creates a Checkout Session (mode: subscription, `subscription_data.trial_period_days: 7`), optionally links `client_reference_id` to auth user id; returns `{ url }` for redirect.
- **Webhook:** `POST /api/stripe/webhook` handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; verify signature; store subscription status (e.g. in a simple JSON file or Vercel KV / DB) keyed by Stripe customer id or email. If no DB, use Stripe as source of truth and look up subscription by customer id on demand.
- **Portal:** Optional `POST /api/stripe/portal` to create billing portal session for managing subscription.
- **Subscription check:** Helper or API that, given user id/email, returns whether user has active or trialing subscription (query Stripe or stored state).

**Deliverables:** Pricing page with “Start 7-day free trial” button → Stripe Checkout → success redirect; webhook keeps subscription state; app can gate “Read to me” on subscription.

---

## Task 3: Audible-style media player

- Build a persistent **player component** (e.g. fixed bottom bar or slide-up panel). Features: **Play**, **Pause**, **Rewind** (e.g. -15s), **Fast-forward** (+15s), **Seek bar** (scrub by position), **Playback speed** (0.75x, 1x, 1.25x, 1.5x).
- Use a single `<audio>` element (or ref) and control via `currentTime`, `playbackRate`, `play()`, `pause()`. Load audio from existing `/api/read/[bookId]` (or new endpoint that returns same MP3). Show book title and “Now playing” state.
- Optional: “Next chunk” for long books (if we add chunked API later); for this phase, one segment per book is fine.
- Integrate player into layout or a global provider so it stays visible across pages when something is playing.

**Deliverables:** Full control bar (play/pause, ±15s, seek, speed); state persists across navigations when playing; Audible-like UX.

---

## Task 4: Multiple pages + book detail + descriptions

- **Layout/nav:** Shared layout with header: logo, search (or link to search), “Library” or “My books”, “Pricing”, “Account” (sign in / profile). Footer optional.
- **Home:** Keep search; results link to book detail page (`/book/[id]`).
- **Book detail page** `/book/[id]`: Fetch book from Gutendex by id (use Gutendex API); show cover, title, authors, **full description** (Gutendex `summaries[0]` or subjects), subjects, languages. “Read to me” / “Listen” button that starts the player (or navigates to home with book pre-selected). Gate button: show “Subscribe to listen” if not subscribed.
- **Pricing page** `/pricing`: Explain plan (monthly, 7-day free trial), price; CTA “Start free trial” → calls `/api/stripe/checkout` and redirects to Stripe.
- **Account page** `/account`: Show session (name, email); link to manage subscription (Stripe portal) if subscribed; sign out.
- **API:** Extend `GET /api/books` or add `GET /api/books/[id]` returning full book object including `summaries`, `subjects`, `bookshelves` for the detail page.

**Deliverables:** Nav on all pages; book detail with rich description; pricing with trial CTA; account with subscription management; listening gated by subscription.

---

## Task 5: Integration and gating

- **Read gating:** In `GET /api/read/[bookId]`, resolve current user (session or Stripe customer by cookie/header). If no active/trialing subscription, return 403 with JSON `{ error: "Subscription required" }`. Frontend shows “Subscribe to listen” or redirects to pricing.
- **Player:** When user clicks “Listen” on book detail or search, start player with `/api/read/[bookId]` (after subscription check); show player bar.
- **Env:** Document all env vars in `.env.example`: Auth, Stripe, ElevenLabs.

---

## Execution order

1. **Parallel:** Task 1 (Auth), Task 2 (Stripe), Task 3 (Player), Task 4 (Pages).
2. **Sequential:** Task 5 (Integration and gating) after 1–4 are merged.
