-- ============================================================
-- QueuePe — Initial Database Migration
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text        UNIQUE NOT NULL,
  phone            text        UNIQUE NOT NULL,
  name             text        NOT NULL,
  role             text        NOT NULL CHECK (role IN ('CLIENT','STANDER','ADMIN')),
  password_hash    text,
  aadhaar_verified bool        DEFAULT false,
  avatar_initials  text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ─── 2. LOCATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.locations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  icon           text,
  avg_wait_hours text,
  category       text        CHECK (category IN ('RTO','PASSPORT','HOSPITAL','BANK','COURT','OTHER')),
  created_at     timestamptz DEFAULT now()
);

-- ─── 3. BOOKINGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  stander_id            uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  location_id           uuid        REFERENCES public.locations(id) ON DELETE SET NULL,
  location_address      text        NOT NULL,
  start_time            timestamptz NOT NULL,
  estimated_hours       int         NOT NULL CHECK (estimated_hours BETWEEN 1 AND 8),
  status                text        DEFAULT 'PENDING_MATCH' CHECK (status IN ('PENDING_MATCH','MATCHED','ACTIVE','ALERT','COMPLETED','CANCELLED')),
  total_amount          int         NOT NULL,
  stander_payout        int         NOT NULL,
  platform_fee          int         NOT NULL,
  razorpay_order_id     text,
  razorpay_payment_id   text,
  payment_status        text        DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','REFUNDED')),
  instructions          text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─── 4. CHECK_INS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_ins (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid        REFERENCES public.bookings(id) ON DELETE CASCADE,
  stander_id          uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  latitude            float8      NOT NULL,
  longitude           float8      NOT NULL,
  selfie_url          text,
  queue_position      int,
  estimated_minutes   int,
  is_alert            bool        DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- ─── 5. REVIEWS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid        REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  client_id   uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  stander_id  uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  rating      int         CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz DEFAULT now()
);

-- ─── 6. STANDER_PROFILES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stander_profiles (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  total_earnings   int         DEFAULT 0,
  job_count        int         DEFAULT 0,
  rating           float8      DEFAULT 5.0,
  on_time_percent  int         DEFAULT 100,
  current_streak   int         DEFAULT 0,
  is_online        bool        DEFAULT false,
  upi_id           text,
  created_at       timestamptz DEFAULT now()
);

-- ─── 7. NOTIFICATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES public.users(id) ON DELETE CASCADE,
  type        text        CHECK (type IN ('JOB_AVAILABLE','CHECK_IN','ALERT','PAYMENT','MATCHED')),
  message     text        NOT NULL,
  is_read     bool        DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_client_id   ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_stander_id  ON public.bookings(stander_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at  ON public.bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_check_ins_booking_id  ON public.check_ins(booking_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at  ON public.check_ins(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ─── USERS ──────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ─── LOCATIONS (public read) ─────────────────────────────────
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT USING (true);

-- ─── BOOKINGS ────────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Clients see their own bookings
CREATE POLICY "bookings_client_select" ON public.bookings
  FOR SELECT USING (client_id = auth.uid());

-- Standers see their own bookings + PENDING_MATCH (job feed)
CREATE POLICY "bookings_stander_select" ON public.bookings
  FOR SELECT USING (
    stander_id = auth.uid()
    OR (status = 'PENDING_MATCH' AND payment_status = 'PAID')
  );

-- ─── CHECK_INS ───────────────────────────────────────────────
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Standers can insert their own check-ins
CREATE POLICY "checkins_stander_insert" ON public.check_ins
  FOR INSERT WITH CHECK (stander_id = auth.uid());

-- Clients can select check-ins for their bookings
CREATE POLICY "checkins_client_select" ON public.check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = check_ins.booking_id
        AND bookings.client_id = auth.uid()
    )
  );

-- Standers can select their own check-ins
CREATE POLICY "checkins_stander_select" ON public.check_ins
  FOR SELECT USING (stander_id = auth.uid());

-- ─── REVIEWS ─────────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Clients can insert for their completed bookings
CREATE POLICY "reviews_client_insert" ON public.reviews
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
        AND bookings.client_id = auth.uid()
        AND bookings.status = 'COMPLETED'
    )
  );

-- Both parties can select
CREATE POLICY "reviews_parties_select" ON public.reviews
  FOR SELECT USING (
    client_id = auth.uid() OR stander_id = auth.uid()
  );

-- ─── STANDER_PROFILES ────────────────────────────────────────
ALTER TABLE public.stander_profiles ENABLE ROW LEVEL SECURITY;

-- Users see own profile
CREATE POLICY "stander_profiles_select_own" ON public.stander_profiles
  FOR SELECT USING (user_id = auth.uid());

-- ─── NOTIFICATIONS ───────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- SEED — LOCATIONS
-- ============================================================
INSERT INTO public.locations (name, icon, avg_wait_hours, category) VALUES
  ('RTO Office',         '🚗', '3–5 hrs', 'RTO'),
  ('Passport Seva',      '🛂', '2–4 hrs', 'PASSPORT'),
  ('Govt Hospital',      '🏥', '4–6 hrs', 'HOSPITAL'),
  ('Bank / Post Office', '🏦', '1–2 hrs', 'BANK'),
  ('RERA / Court',       '⚖️', '2–3 hrs', 'COURT'),
  ('Other / Custom',     '📍', 'Varies',  'OTHER')
ON CONFLICT DO NOTHING;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
