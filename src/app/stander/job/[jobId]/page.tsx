import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import GeoCheckinCard from '@/components/stander/GeoCheckinCard';
import CheckInLog from '@/components/client/CheckInLog';
import JobCompleteModal from '@/components/stander/JobCompleteModal';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  params: Promise<{ jobId: string }>;
}

async function getJob(jobId: string, standerId: string): Promise<BookingWithDetails | null> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(name, phone),
      check_ins(*)
    `)
    .eq('id', jobId)
    .eq('stander_id', standerId)
    .single();

  if (error || !data) return null;
  return data as BookingWithDetails;
}

export default async function ActiveJobPage({ params }: Props) {
  const { jobId } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user as any;
  if (user.role !== 'STANDER') redirect('/client/home');

  const job = await getJob(jobId, user.id);
  if (!job) notFound();

  // If job is already completed, redirect to earnings
  if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
    redirect('/stander/earnings');
  }

  const checkIns = (job as any).check_ins?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) ?? [];
  const payoutRupees = Math.round(job.stander_payout / 100);

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#F7F4EE' }}>
      <TopBar role="stander" userName={user.name} avatarInitials={user.avatarInitials} />

      {/* Header */}
      <div style={{ background: '#1A1612', padding: '16px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Active Job
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: job.status === 'ALERT' ? '#dc2626' : '#1A7A4A', border: `1px solid ${job.status === 'ALERT' ? '#dc2626' : '#1A7A4A'}`, padding: '2px 6px', borderRadius: '4px' }}>
            {job.status}
          </div>
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', lineHeight: 1 }}>
          {job.location?.name}
        </h2>
        <div style={{ fontSize: '13px', color: '#a08060', marginTop: '4px' }}>
          Client: {job.client?.name}
          {job.client?.phone && ` · 📞 ${job.client.phone}`}
        </div>
      </div>

      <main style={{ flex: 1, padding: '16px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Instructions */}
        {job.instructions && (
          <div style={{ background: '#fff', border: '1px solid #D4CFC6', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '4px' }}>
              Client Instructions
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#1A1612' }}>
              &quot;{job.instructions}&quot;
            </div>
          </div>
        )}

        {/* Check-in Card (Client component) */}
        <GeoCheckinCard bookingId={job.id} onCheckIn={() => {}} />

        {/* Log */}
        <CheckInLog checkIns={checkIns} />

        {/* Alert / Complete Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            style={{
              flex: 1,
              background: job.status === 'ALERT' ? '#D4CFC6' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              padding: '12px 0',
              cursor: job.status === 'ALERT' ? 'not-allowed' : 'pointer',
            }}
          >
            {job.status === 'ALERT' ? '✓ CLIENT ALERTED' : '🔔 ALERT CLIENT'}
          </button>
          
          <button
            style={{
              flex: 1,
              background: '#1A7A4A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              padding: '12px 0',
              cursor: 'pointer',
            }}
          >
            MARK COMPLETE
          </button>
        </div>
      </main>

      <BottomNav role="stander" />
      
      {/* Example static modal trigger — in real app, state would control this */}
      {/* <JobCompleteModal bookingId={job.id} payout={payoutRupees} durationHours={job.estimated_hours} checkInCount={checkIns.length} onClose={() => {}} /> */}
    </div>
  );
}
