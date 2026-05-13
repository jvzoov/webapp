import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import LocationGrid from '@/components/client/LocationGrid';
import type { Location } from '@/types/database';

async function getLocations(): Promise<Location[]> {
  const { data } = await supabaseAdmin
    .from('locations')
    .select('*')
    .order('category');
  return data ?? [];
}

export default async function ClientHomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { user } = session;
  const locations = await getLocations();

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <TopBar
        role="client"
        userName={user.name}
        avatarInitials={user.avatarInitials}
      />

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {/* Hero Band */}
        <div style={{ background: '#1A1612', padding: '20px 16px 24px' }}>
          <p
            style={{
              fontFamily:    'DM Mono, monospace',
              fontSize:      '10px',
              color:         '#FF6B00',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom:  '8px',
            }}
          >
            India&apos;s Queue Problem, Solved
          </p>
          <h1
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize:   '48px',
              lineHeight: 0.95,
              color:      '#fff',
              marginBottom:'10px',
            }}
          >
            Skip The{' '}
            <span style={{ color: '#FF6B00' }}>LINE.</span>
          </h1>
          <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
            We send a verified Stander to hold your spot at any RTO, hospital,
            bank or government office — while you carry on with your day.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { num: '₹150',   label: 'starts at/hr' },
              { num: '15min',  label: 'avg match time' },
              { num: '4.8★',  label: 'avg stander rating' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize:   '22px',
                    color:      '#FF6B00',
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize:   '9px',
                    color:      'rgba(255,255,255,0.4)',
                    letterSpacing:'0.06em',
                    textTransform:'uppercase',
                    marginTop:  '2px',
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section label */}
        <div style={{ padding: '20px 16px 12px' }}>
          <p
            style={{
              fontFamily:    'DM Mono, monospace',
              fontSize:      '10px',
              color:         '#8A8480',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Choose a Location
          </p>
        </div>

        {/* Location Grid + Book button (Client Component) */}
        <LocationGrid locations={locations} />
      </main>

      <BottomNav role="client" />
    </div>
  );
}
