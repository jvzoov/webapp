-- =============================================================
-- QueuePe — Stander Earnings Helpers
-- =============================================================

/**
 * Atomically increments a stander's total_earnings balance.
 * Used when a payout cannot be immediately processed via Razorpay.
 */
CREATE OR REPLACE FUNCTION public.increment_stander_earnings(s_id uuid, amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.stander_profiles
    SET total_earnings = total_earnings + amount,
        job_count = job_count + 1,
        updated_at = now()
    WHERE user_id = s_id;
END;
$$;

-- Grant execution to authenticated users (and service role)
GRANT EXECUTE ON FUNCTION public.increment_stander_earnings(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stander_earnings(uuid, int) TO service_role;
