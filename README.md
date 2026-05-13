# QueuePe — Skip the Line

Book verified queue-standers at any government office in India.

## 🚀 Vercel Deployment

### 1. Environment Variables
Set these in the Vercel Dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (secret) |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://queuepe.app`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Public Key |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for verifying webhooks |
| `RAZORPAY_ACCOUNT_NUMBER` | Your Razorpay X account number |
| `WATI_API_ENDPOINT` | WATI API Base URL |
| `WATI_API_TOKEN` | WATI API Bearer Token |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps JS API Key |
| `CRON_SECRET` | Secret for Vercel Cron jobs |

### 2. Razorpay Webhook Setup
Go to Razorpay Dashboard → Settings → Webhooks:
- **URL**: `https://your-domain.com/api/webhooks/razorpay`
- **Events**: `payment.captured`, `payout.processed`, `payout.failed`
- **Secret**: Must match `RAZORPAY_WEBHOOK_SECRET`

### 3. Supabase Realtime
Enable Realtime for the following tables in the Supabase Dashboard:
- `bookings`
- `check_ins`
- `notifications`

### 4. PWA Installation
Run the icon generator before building:
```bash
npm install canvas
node scripts/gen-icons.js
```

---

## 🛠 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (Postgres + Realtime)
- **Payments**: Razorpay (Checkout + Payouts)
- **Messaging**: WATI (WhatsApp API)
- **Styling**: Tailwind CSS + shadcn/ui
- **PWA**: next-pwa
