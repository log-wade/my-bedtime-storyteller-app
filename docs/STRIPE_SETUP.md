# Stripe setup checklist

Product and price are already created in your Stripe account. Complete these steps to enable checkout and webhooks.

## 1. API keys

1. Open [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).
2. Copy the **Secret key** (starts with `sk_`).
3. In `.env.local` (local) and in Vercel → Project → Settings → Environment Variables (production), set:
   - `STRIPE_SECRET_KEY` = your secret key

## 2. Price ID

The app uses this monthly price (already created):

- **Price ID:** `price_1T8onuRsxm9dFvTh6smwqBmQ`
- **Product:** My Bedtime Storyteller — $9.99/month

Set in env:

- `NEXT_PUBLIC_STRIPE_PRICE_ID=price_1T8onuRsxm9dFvTh6smwqBmQ`

(Already in `.env.example`.)

## 3. Webhook (production)

1. Open [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. **Endpoint URL:**  
   `https://my-bedtime-storyteller-app.vercel.app/api/stripe/webhook`
4. **Events to send:**  
   - `checkout.session.completed`  
   - `customer.subscription.updated`  
   - `customer.subscription.deleted`
5. After creating the endpoint, open it and reveal **Signing secret** (starts with `whsec_`).
6. In Vercel env, set:
   - `STRIPE_WEBHOOK_SECRET` = that signing secret

## 4. App URL

In Vercel env, set:

- `NEXT_PUBLIC_APP_URL=https://my-bedtime-storyteller-app.vercel.app`

(Use your real production URL if different.)

## 5. Redeploy

Redeploy the app on Vercel after adding or changing env vars so the new values are applied.

## Local testing (optional)

To test webhooks locally, use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.
