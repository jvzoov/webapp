-- =============================================================
-- QueuePe — OTP Sessions Table
-- =============================================================

CREATE TABLE IF NOT EXISTS public.otp_sessions (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone      text        NOT NULL,
    otp_hash   text        NOT NULL,
    expires_at timestamptz NOT NULL,
    attempts   int         DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX ON public.otp_sessions(phone);
CREATE INDEX ON public.otp_sessions(expires_at);

-- No RLS needed — accessed only via service role in API routes
