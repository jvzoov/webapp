-- =============================================================
-- QueuePe — Initial Schema Migration
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABLES
-- =============================================================

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email            text        UNIQUE NOT NULL,
    phone            text        UNIQUE NOT NULL,
    name             text        NOT NULL,
    role             text        NOT NULL CHECK (role IN ('CLIENT','STANDER','ADMIN')),
    password_hash    text,
    aadhaar_verified boolean     DEFAULT false,
    avatar_initials  text,
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now()
);

-- 2. locations
CREATE TABLE IF NOT EXISTS public.locations (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name           text        NOT NULL,
    icon           text,
    avg_wait_hours text,
    category       text        CHECK (category IN ('RTO','PASSPORT','HOSPITAL','BANK','COURT','OTHER')),
    lat            float8,
    lng            float8,
    created_at     timestamptz DEFAULT now()
);

-- 3. bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           uuid        REFERENCES public.users(id),
    stander_id          uuid        REFERENCES public.users(id),
    location_id         uuid        REFERENCES public.locations(id),
    location_address    text        NOT NULL,
    start_time          timestamptz NOT NULL,
    estimated_hours     int         NOT NULL CHECK (estimated_hours BETWEEN 1 AND 8),
    status              text        DEFAULT 'PENDING_MATCH' CHECK (status IN ('PENDING_MATCH','MATCHED','ACTIVE','ALERT','COMPLETED','CANCELLED')),
    total_amount        int         NOT NULL,   -- paise
    stander_payout      int         NOT NULL,   -- paise (80 % of hours×200)
    platform_fee        int         NOT NULL,   -- paise
    razorpay_order_id   text,
    razorpay_payment_id text,
    payment_status      text        DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','REFUNDED')),
    instructions        text,
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now()
);

-- 4. check_ins
CREATE TABLE IF NOT EXISTS public.check_ins (
    id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id        uuid        REFERENCES public.bookings(id),
    stander_id        uuid        REFERENCES public.users(id),
    latitude          float8      NOT NULL,
    longitude         float8      NOT NULL,
    selfie_url        text,
    queue_position    int,
    estimated_minutes int,
    is_alert          boolean     DEFAULT false,
    created_at        timestamptz DEFAULT now()
);

-- 5. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  uuid        REFERENCES public.bookings(id) UNIQUE,
    client_id   uuid        REFERENCES public.users(id),
    stander_id  uuid        REFERENCES public.users(id),
    rating      int         CHECK (rating BETWEEN 1 AND 5),
    comment     text,
    created_at  timestamptz DEFAULT now()
);

-- 6. stander_profiles
CREATE TABLE IF NOT EXISTS public.stander_profiles (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        REFERENCES public.users(id) UNIQUE,
    total_earnings  int         DEFAULT 0,   -- paise
    job_count       int         DEFAULT 0,
    rating          float8      DEFAULT 5.0,
    on_time_percent int         DEFAULT 100,
    current_streak  int         DEFAULT 0,
    is_online       boolean     DEFAULT false,
    upi_id          text,
    created_at      timestamptz DEFAULT now()
);

-- 7. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid        REFERENCES public.users(id),
    type       text        CHECK (type IN ('JOB_AVAILABLE','CHECK_IN','ALERT','PAYMENT','MATCHED')),
    message    text        NOT NULL,
    is_read    boolean     DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =============================================================
-- updated_at TRIGGER
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX ON public.bookings(client_id);
CREATE INDEX ON public.bookings(stander_id);
CREATE INDEX ON public.bookings(status);
CREATE INDEX ON public.bookings(created_at DESC);
CREATE INDEX ON public.check_ins(booking_id);
CREATE INDEX ON public.check_ins(created_at DESC);
CREATE INDEX ON public.notifications(user_id, is_read);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stander_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;

-- ── users ─────────────────────────────────────────────────────
-- SELECT own row
CREATE POLICY "users_select_own"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- UPDATE own row
CREATE POLICY "users_update_own"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ── locations ─────────────────────────────────────────────────
-- All authenticated users can read locations
CREATE POLICY "locations_select_authenticated"
    ON public.locations FOR SELECT
    USING (auth.role() = 'authenticated');

-- ── bookings ──────────────────────────────────────────────────
-- CLIENTs see their own bookings
CREATE POLICY "bookings_select_client"
    ON public.bookings FOR SELECT
    USING (auth.uid() = client_id);

-- STANDERs see their own assigned bookings
-- PLUS any PENDING_MATCH + PAID bookings (available jobs)
CREATE POLICY "bookings_select_stander"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = stander_id
        OR (
            status = 'PENDING_MATCH'
            AND payment_status = 'PAID'
            AND EXISTS (
                SELECT 1 FROM public.users
                WHERE id = auth.uid() AND role = 'STANDER'
            )
        )
    );

-- CLIENTs can INSERT their own bookings
CREATE POLICY "bookings_insert_client"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- CLIENTs can UPDATE (e.g. cancel) their own bookings
CREATE POLICY "bookings_update_client"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = client_id);

-- STANDERs can UPDATE bookings assigned to them
CREATE POLICY "bookings_update_stander"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = stander_id);

-- ── check_ins ─────────────────────────────────────────────────
-- STANDERs INSERT their own check-ins
CREATE POLICY "checkins_insert_stander"
    ON public.check_ins FOR INSERT
    WITH CHECK (auth.uid() = stander_id);

-- STANDERs SELECT their own check-ins
CREATE POLICY "checkins_select_stander"
    ON public.check_ins FOR SELECT
    USING (auth.uid() = stander_id);

-- CLIENTs SELECT check-ins belonging to their bookings
CREATE POLICY "checkins_select_client"
    ON public.check_ins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id    = check_ins.booking_id
              AND bookings.client_id = auth.uid()
        )
    );

-- ── reviews ───────────────────────────────────────────────────
-- CLIENTs INSERT reviews only for COMPLETED bookings they own
CREATE POLICY "reviews_insert_client"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = client_id
        AND EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id        = reviews.booking_id
              AND bookings.client_id = auth.uid()
              AND bookings.status    = 'COMPLETED'
        )
    );

-- Both client and stander can SELECT the review
CREATE POLICY "reviews_select"
    ON public.reviews FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = stander_id);

-- ── stander_profiles ──────────────────────────────────────────
-- Users can SELECT their own profile
CREATE POLICY "stander_profiles_select_own"
    ON public.stander_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- ── notifications ─────────────────────────────────────────────
-- Users see only their own notifications
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- =============================================================
-- STORAGE — private bucket: checkin-selfies
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('checkin-selfies', 'checkin-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- STANDERs INSERT objects into <bookingId>/* paths they own
CREATE POLICY "selfies_insert_stander"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'checkin-selfies'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'STANDER'
        )
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.bookings
            WHERE stander_id = auth.uid()
        )
    );

-- CLIENTs SELECT selfies for their bookings
CREATE POLICY "selfies_select_client"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'checkin-selfies'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.bookings
            WHERE client_id = auth.uid()
        )
    );

-- STANDERs SELECT their own selfies
CREATE POLICY "selfies_select_stander"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'checkin-selfies'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT id::text FROM public.bookings
            WHERE stander_id = auth.uid()
        )
    );

-- =============================================================
-- SEED: LOCATIONS
-- =============================================================

INSERT INTO public.locations (name, icon, avg_wait_hours, category, lat, lng)
VALUES
    ('RTO Office',         '🚗', '3–5 hrs', 'RTO',      12.9716, 77.5946),
    ('Passport Seva',      '🛂', '2–4 hrs', 'PASSPORT', 12.9698, 77.7499),
    ('Govt Hospital',      '🏥', '4–6 hrs', 'HOSPITAL', 12.9279, 77.6271),
    ('Bank / Post Office', '🏦', '1–2 hrs', 'BANK',     12.9352, 77.6245),
    ('RERA / Court',       '⚖️', '2–3 hrs', 'COURT',    12.9766, 77.5993),
    ('Other / Custom',     '📍', 'Varies',  'OTHER',    null,    null   );

-- =============================================================
-- SEED: TEST USERS  (passwords hashed via pgcrypto)
-- =============================================================

INSERT INTO public.users (email, phone, name, role, password_hash, aadhaar_verified, avatar_initials)
VALUES
    (
        'admin@queuepe.app',
        '+919000000000',
        'QueuePe Admin',
        'ADMIN',
        crypt('Admin@123', gen_salt('bf', 10)),
        true,
        'QA'
    ),
    (
        'client1@test.com',
        '+919000000001',
        'Rahul Sharma',
        'CLIENT',
        crypt('Client@123', gen_salt('bf', 10)),
        false,
        'RS'
    ),
    (
        'client2@test.com',
        '+919000000002',
        'Priya Mehta',
        'CLIENT',
        crypt('Client@123', gen_salt('bf', 10)),
        false,
        'PM'
    ),
    (
        'stander1@test.com',
        '+919000000003',
        'Arjun Singh',
        'STANDER',
        crypt('Stander@123', gen_salt('bf', 10)),
        true,
        'AS'
    ),
    (
        'stander2@test.com',
        '+919000000004',
        'Deepak Kumar',
        'STANDER',
        crypt('Stander@123', gen_salt('bf', 10)),
        true,
        'DK'
    );

-- =============================================================
-- SEED: STANDER PROFILES
-- =============================================================

INSERT INTO public.stander_profiles
    (user_id, total_earnings, job_count, rating, on_time_percent, current_streak, is_online, upi_id)
SELECT
    id, 48000, 24, 4.8, 95, 7, true, 'stander1@upi'
FROM public.users WHERE email = 'stander1@test.com';

INSERT INTO public.stander_profiles
    (user_id, total_earnings, job_count, rating, on_time_percent, current_streak, is_online, upi_id)
SELECT
    id, 32000, 16, 4.8, 92, 4, true, 'stander2@upi'
FROM public.users WHERE email = 'stander2@test.com';
