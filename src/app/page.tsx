import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import type { Location } from '@/types/database';

/**
 * QueuePe Landing Page
 * Server Component fetching location data from Supabase.
 */
export default async function LandingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('category');

  const locs = locations ?? [];

  return (
    <div className="bg-[#0c0a06] text-[#f5ede0] min-h-screen selection:bg-[#FF6B00]/30">
      
      {/* ─── 1. NAVBAR ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0c0a06]/95 backdrop-blur-md border-b border-[#362a16] h-[64px] flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-bebas text-2xl tracking-wide">
            Queue<span className="text-[#FF6B00]">Pe</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-[#362a16] text-[#f5ede0] hover:bg-[#1f180e] px-5">
              LOGIN
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-5 border-none">
              REGISTER
            </Button>
          </Link>
        </div>
      </nav>

      {/* ─── 2. HERO ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <p className="font-mono text-[10px] text-[#FF6B00] tracking-[.18em] uppercase mb-6 animate-fade-in">
          INDIA&apos;S QUEUE PROBLEM, SOLVED
        </p>
        
        <h1 className="font-bebas text-[clamp(64px,10vw,100px)] leading-[0.9] mb-8 select-none">
          Skip The <span className="text-[#FF6B00]">LINE.</span>
        </h1>
        
        <p className="italic text-[#a08060] text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          &quot;We send a verified Stander to hold your spot at any RTO, hospital, bank or government office — while you carry on with your day.&quot;
        </p>

        {/* Stat Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            '₹150 starts at/hr',
            '15 min avg match',
            '4.8★ avg rating'
          ].map((stat) => (
            <div key={stat} className="font-mono text-[11px] px-4 py-2 border border-[#362a16] rounded-full text-[#a08060] bg-[#1f180e]/40">
              {stat}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
          <Link href="/register" className="flex-1">
            <Button className="w-full py-6 text-xl tracking-wider">
              BOOK A STANDER →
            </Button>
          </Link>
          <Link href="/register?role=STANDER" className="flex-1">
            <Button variant="outline" className="w-full py-6 text-xl tracking-wider border-[#f5ede0] text-[#f5ede0] hover:bg-[#f5ede0]/5 bg-transparent">
              EARN AS A STANDER
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS ────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="font-mono text-[11px] text-[#FF6B00] tracking-widest text-center mb-20 uppercase">
          HOW IT WORKS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {[
            { n: '01', title: 'Choose & Pay', text: 'Select location + time, pay online, instant confirmation' },
            { n: '02', title: 'We Match Fast', text: 'Verified Stander matched in 15 min, WhatsApp notification' },
            { n: '03', title: 'Track & Go', text: 'Live GPS updates, WhatsApp alert when your turn nears' },
          ].map((step) => (
            <div key={step.n} className="relative group">
              <span className="absolute -top-12 -left-4 font-bebas text-[120px] text-[#FF6B00]/5 select-none leading-none -z-10 transition-colors group-hover:text-[#FF6B00]/10">
                {step.n}
              </span>
              <h3 className="font-bebas text-3xl text-[#FF6B00] mb-4 tracking-wide">{step.title}</h3>
              <p className="text-[#a08060] leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. LOCATION TYPES GRID ──────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-[#1f180e]/20 border-y border-[#362a16]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-mono text-[11px] text-[#FF6B00] tracking-widest text-center mb-16 uppercase">
            OPERATIONAL LOCATIONS
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {locs.map((loc) => (
              <div 
                key={loc.id} 
                className="bg-[#1f180e] border border-[#362a16] rounded-[10px] p-6 md:p-8 hover:border-[#FF6B00] transition-all group"
              >
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{loc.icon}</div>
                <h4 className="font-semibold text-lg md:text-xl text-[#f5ede0] mb-2">{loc.name}</h4>
                <p className="font-mono text-[11px] text-[#a08060] uppercase tracking-wider">
                  Avg wait: {loc.avg_wait_hours}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. TRUST SIGNALS ───────────────────────────────── */}
      <section className="py-16 border-b border-[#362a16]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            'Aadhaar-verified Standers',
            'GPS check-ins every 30 min',
            'WhatsApp alert when your turn',
            'Full refund if no match in 20 min'
          ].map((signal) => (
            <div key={signal} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#1A7A4A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-[#f5ede0]/80">{signal}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. STANDER RECRUITMENT ─────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#1f180e] rounded-2xl p-8 md:p-16 border border-[#362a16] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B00]" />
          
          <p className="font-mono text-[10px] text-[#FF6B00] tracking-[.18em] mb-6">FOR STANDERS</p>
          <h2 className="font-bebas text-[48px] md:text-[72px] leading-none mb-6">
            EARN ₹150–200/HR <br className="hidden md:block" />
            <span className="text-[#FF6B00]">JUST BY STANDING</span>
          </h2>
          <p className="text-[#a08060] text-lg mb-10 max-w-lg mx-auto">
            Join 42+ verified standers. Average ₹8,000+ earned last week. 
            Flexible hours, instant payouts.
          </p>
          <Link href="/register?role=STANDER">
            <Button className="max-w-xs mx-auto py-7 text-2xl tracking-widest">
              START EARNING →
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── 7. FOOTER ──────────────────────────────────────── */}
      <footer className="py-16 px-6 md:px-12 border-t border-[#362a16] bg-[#0c0a06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <span className="font-bebas text-3xl tracking-wide">
              Queue<span className="text-[#FF6B00]">Pe</span>
            </span>
            <p className="text-[#a08060] text-sm max-w-[240px]">
              Skip the Line, Not Your Day. <br />
              India&apos;s leading queue standing service.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h5 className="font-mono text-[10px] text-[#FF6B00] tracking-widest uppercase">Company</h5>
              <ul className="space-y-2 text-sm text-[#a08060]">
                <li><Link href="/about" className="hover:text-[#f5ede0] transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-[#f5ede0] transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-[#f5ede0] transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-mono text-[10px] text-[#FF6B00] tracking-widest uppercase">Contact</h5>
              <ul className="space-y-2 text-sm text-[#a08060]">
                <li><Link href="/contact" className="hover:text-[#f5ede0] transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-[#f5ede0] transition-colors">Partnerships</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-[#362a16] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-[#362a16]">
            © {new Date().getFullYear()} QueuePe. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="w-5 h-5 bg-[#362a16] rounded-full" />
            <div className="w-5 h-5 bg-[#362a16] rounded-full" />
            <div className="w-5 h-5 bg-[#362a16] rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
