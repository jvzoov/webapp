import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Location } from '@/types/database';

async function getLocations(): Promise<Location[]> {
  const { data } = await supabaseAdmin
    .from('locations')
    .select('*')
    .order('category');
  return data ?? [];
}

export default async function LandingPage() {
  const locations = await getLocations();

  return (
    <>
      {/* ─── FONTS ─────────────────────────────────────────── */}
      <style>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-mono    { font-family: 'DM Mono', monospace; }
        .hero-h1      { font-size: clamp(64px, 10vw, 100px); line-height: 0.95; }
        .loc-card:hover { border-color: #FF6B00 !important; transform: translateY(-2px); }
        .loc-card { transition: all 0.2s ease; }
        .nav-btn-outline:hover { background: rgba(245,237,224,0.08); }
        .stander-earn-cta:hover { background: #e05e00; }
      `}</style>

      <div style={{ background: '#0c0a06', color: '#f5ede0', minHeight: '100vh' }}>

        {/* ─── NAVBAR ──────────────────────────────────────── */}
        <nav
          style={{
            position:       'sticky',
            top:            0,
            zIndex:         50,
            background:     'rgba(12,10,6,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom:   '1px solid #362a16',
            padding:        '0 24px',
            height:         '60px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          <span className="font-display" style={{ fontSize: '28px' }}>
            Queue<span style={{ color: '#FF6B00' }}>Pe</span>
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              href="/login"
              className="nav-btn-outline"
              style={{
                border:       '1px solid #362a16',
                borderRadius: '8px',
                padding:      '7px 16px',
                fontSize:     '13px',
                color:        '#f5ede0',
                textDecoration: 'none',
                fontFamily:   'Noto Sans, sans-serif',
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              style={{
                background:   '#FF6B00',
                borderRadius: '8px',
                padding:      '7px 16px',
                fontSize:     '13px',
                color:        '#fff',
                textDecoration: 'none',
                fontFamily:   'Noto Sans, sans-serif',
                fontWeight:   600,
              }}
            >
              Register
            </Link>
          </div>
        </nav>

        {/* ─── HERO ────────────────────────────────────────── */}
        <section
          style={{
            minHeight:      '100vh',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            textAlign:      'center',
            padding:        '80px 24px 60px',
          }}
        >
          <p
            className="font-mono"
            style={{
              color:         '#FF6B00',
              fontSize:      '12px',
              letterSpacing: '0.18em',
              marginBottom:  '20px',
              textTransform: 'uppercase',
            }}
          >
            India&apos;s Queue Problem, Solved
          </p>

          <h1 className="font-display hero-h1" style={{ color: '#f5ede0', marginBottom: '24px' }}>
            Skip The{' '}
            <span style={{ color: '#FF6B00' }}>LINE.</span>
          </h1>

          <p
            style={{
              fontStyle:    'italic',
              color:        'rgba(245,237,224,0.6)',
              fontSize:     'clamp(15px, 2.5vw, 18px)',
              maxWidth:     '560px',
              lineHeight:   1.7,
              marginBottom: '40px',
            }}
          >
            We send a verified Stander to hold your spot at any RTO, hospital,
            bank or government office — while you carry on with your day.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '44px' }}>
            {[
              { val: '₹150', label: 'starts at' },
              { val: '15 min', label: 'avg match' },
              { val: '4.8★', label: 'avg rating' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background:   '#1f180e',
                  border:       '1px solid #362a16',
                  borderRadius: '100px',
                  padding:      '8px 18px',
                  display:      'flex',
                  gap:          '8px',
                  alignItems:   'baseline',
                }}
              >
                <span className="font-display" style={{ color: '#FF6B00', fontSize: '20px' }}>
                  {s.val}
                </span>
                <span className="font-mono" style={{ color: '#a08060', fontSize: '11px' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/register"
              style={{
                background:   '#FF6B00',
                color:        '#fff',
                borderRadius: '10px',
                padding:      '14px 32px',
                fontFamily:   'Bebas Neue, sans-serif',
                fontSize:     '20px',
                letterSpacing:'0.06em',
                textDecoration:'none',
              }}
            >
              BOOK A STANDER →
            </Link>
            <Link
              href="/register?role=stander"
              style={{
                background:   'transparent',
                color:        '#f5ede0',
                border:       '1px solid #362a16',
                borderRadius: '10px',
                padding:      '14px 32px',
                fontFamily:   'Bebas Neue, sans-serif',
                fontSize:     '20px',
                letterSpacing:'0.06em',
                textDecoration:'none',
              }}
            >
              EARN AS A STANDER
            </Link>
          </div>
        </section>

        {/* ─── HOW IT WORKS ────────────────────────────────── */}
        <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
          <p className="font-mono" style={{ color: '#FF6B00', fontSize: '11px', letterSpacing: '0.18em', textAlign: 'center', marginBottom: '48px' }}>
            HOW IT WORKS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {[
              { n: '01', title: 'Choose & Pay',  body: 'Pick your location and start time. Pay securely online in under a minute.' },
              { n: '02', title: 'Get Matched',   body: 'We match you with a verified, Aadhaar-checked Stander near your office in ~15 min.' },
              { n: '03', title: 'Relax & Go',    body: 'Your Stander holds the spot and sends GPS check-ins. WhatsApp alert when it\'s your turn.' },
            ].map((step) => (
              <div key={step.n}>
                <div className="font-display" style={{ fontSize: '80px', color: '#1f180e', lineHeight: 1, marginBottom: '8px' }}>
                  {step.n}
                </div>
                <h3 className="font-display" style={{ fontSize: '28px', color: '#FF6B00', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(245,237,224,0.55)', fontSize: '15px', lineHeight: 1.65 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── LOCATION TYPES ──────────────────────────────── */}
        <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
          <p className="font-mono" style={{ color: '#FF6B00', fontSize: '11px', letterSpacing: '0.18em', textAlign: 'center', marginBottom: '48px' }}>
            WHERE WE OPERATE
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="loc-card"
                style={{
                  background:   '#1f180e',
                  border:       '1px solid #362a16',
                  borderRadius: '10px',
                  padding:      '20px',
                  cursor:       'default',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{loc.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>{loc.name}</div>
                <div className="font-mono" style={{ color: '#a08060', fontSize: '11px' }}>
                  Avg wait: {loc.avg_wait_hours}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TRUST SIGNALS ───────────────────────────────── */}
        <section style={{ padding: '60px 24px', borderTop: '1px solid #1f180e', borderBottom: '1px solid #1f180e' }}>
          <div
            style={{
              maxWidth: '900px',
              margin:   '0 auto',
              display:  'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap:      '28px',
            }}
          >
            {[
              { icon: '✓', text: 'Aadhaar-verified Standers' },
              { icon: '✓', text: 'GPS check-ins every 30 min' },
              { icon: '✓', text: 'WhatsApp alert when your turn' },
              { icon: '✓', text: 'Full refund if no match in 20 min' },
            ].map((t) => (
              <div key={t.text} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#FF6B00', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                  {t.icon}
                </span>
                <span style={{ color: 'rgba(245,237,224,0.7)', fontSize: '14px', lineHeight: 1.5 }}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── STANDER RECRUITMENT ─────────────────────────── */}
        <section
          style={{
            padding:    '80px 24px',
            textAlign:  'center',
            background: 'linear-gradient(135deg, #1f180e 0%, #0c0a06 100%)',
            borderTop:  '1px solid #362a16',
          }}
        >
          <p className="font-mono" style={{ color: '#FF6B00', fontSize: '11px', letterSpacing: '0.18em', marginBottom: '20px' }}>
            FOR STANDERS
          </p>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: '#f5ede0', marginBottom: '16px', lineHeight: 1 }}>
            EARN ₹150–200/HR<br />
            <span style={{ color: '#FF6B00' }}>JUST BY STANDING</span>
          </h2>
          <p style={{ color: 'rgba(245,237,224,0.55)', fontSize: '15px', marginBottom: '12px', maxWidth: '480px', margin: '0 auto 12px' }}>
            42 standers on QueuePe earned ₹8,000+ collectively last week.
            No skills needed — just show up, stand in line, and earn.
          </p>
          <div
            style={{
              display:        'flex',
              gap:            '20px',
              justifyContent: 'center',
              margin:         '32px 0',
              flexWrap:       'wrap',
            }}
          >
            {[
              { val: '42',      label: 'Active Standers' },
              { val: '₹8,000+', label: 'Earned Last Week' },
              { val: '4.8★',    label: 'Avg Stander Rating' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background:   '#0c0a06',
                  border:       '1px solid #362a16',
                  borderRadius: '10px',
                  padding:      '16px 24px',
                  textAlign:    'center',
                  minWidth:     '120px',
                }}
              >
                <div className="font-display" style={{ fontSize: '32px', color: '#FF6B00' }}>{s.val}</div>
                <div className="font-mono" style={{ fontSize: '10px', color: '#a08060', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/register?role=stander"
            className="stander-earn-cta"
            style={{
              display:       'inline-block',
              background:    '#FF6B00',
              color:         '#fff',
              borderRadius:  '10px',
              padding:       '14px 36px',
              fontFamily:    'Bebas Neue, sans-serif',
              fontSize:      '22px',
              letterSpacing: '0.06em',
              textDecoration:'none',
              transition:    'background 0.2s',
            }}
          >
            START EARNING →
          </Link>
        </section>

        {/* ─── FOOTER ──────────────────────────────────────── */}
        <footer
          style={{
            borderTop: '1px solid #1f180e',
            padding:   '36px 24px',
            textAlign: 'center',
          }}
        >
          <div className="font-display" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Queue<span style={{ color: '#FF6B00' }}>Pe</span>
          </div>
          <p style={{ color: '#a08060', fontSize: '13px', marginBottom: '20px' }}>
            India&apos;s queue-standing marketplace
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
              <Link
                key={l}
                href={`/${l.toLowerCase()}`}
                style={{ color: '#a08060', fontSize: '13px', textDecoration: 'none' }}
              >
                {l}
              </Link>
            ))}
          </div>
          <p style={{ color: '#362a16', fontSize: '12px', marginTop: '24px' }}>
            © {new Date().getFullYear()} QueuePe. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
