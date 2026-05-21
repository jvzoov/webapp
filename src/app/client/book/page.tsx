'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Script from 'next/script';
import toast, { Toaster } from 'react-hot-toast';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/Separator';
import TopBar from '@/components/shared/TopBar';

const schema = z.object({
  locationId:      z.string().min(1, 'Select a location'),
  locationName:    z.string(),
  locationAddress: z.string().min(10, 'Enter the specific address (min 10 chars)'),
  startDate:       z.string(),
  startTime:       z.string(),
  estimatedHours:  z.coerce.number().min(1).max(8),
  instructions:    z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const locId = searchParams.get('locationId') ?? '';
  const locName = searchParams.get('locationName') ?? 'Select Location';

  // Default date: Tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId:   locId,
      locationName: locName,
      startDate:    defaultDate,
      startTime:    '08:00',
      estimatedHours: 2,
    },
  });

  const hours = watch('estimatedHours') ?? 2;
  const basePrice = hours * 200;
  const bookingFee = 49;
  const total = basePrice + bookingFee;
  const standerEarns = hours * 160;

  async function onSubmit(values: FormValues) {
    if (!session?.user) {
      toast.error('Please login to book');
      return;
    }

    if (!razorpayLoaded) {
      toast.error('Payment system is loading, please wait...');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Booking & Order
      const startTimeISO = new Date(`${values.startDate}T${values.startTime}:00`).toISOString();
      
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startTime: startTimeISO,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      const { bookingId, razorpayOrderId, amount } = data;

      // 2. Open Razorpay
      const options = {
        key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name:     'QueuePe',
        description: `Queue Standing — ${values.locationName}`,
        order_id: razorpayOrderId,
        prefill: {
          name:    session.user.name,
          contact: session.user.phone,
        },
        theme: { color: '#FF6B00' },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, bookingId }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success('Payment Successful!');
            router.push(`/client/track/${bookingId}`);
          } else {
            toast.error('Payment verification failed');
            setIsLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen pb-20">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <Toaster position="top-center" />
      
      <TopBar role="client" userName={session?.user?.name ?? ''} showBack title="Book a Stander" />

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        
        {/* Location Display */}
        <div className="space-y-1.5">
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#8A8480]">Location</label>
          <div className="bg-white border border-[#D4CFC6] rounded-lg px-3 py-2.5 flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span className="font-semibold text-sm">{locName}</span>
          </div>
          <input type="hidden" {...register('locationId')} />
          <input type="hidden" {...register('locationName')} />
        </div>

        <Textarea 
          label="Specific Address / Landmark" 
          placeholder="e.g. Near Counter 4, RTO HSR Layout" 
          error={errors.locationAddress?.message}
          {...register('locationAddress')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Date" 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input 
            label="Start Time" 
            type="time" 
            error={errors.startTime?.message}
            {...register('startTime')}
          />
        </div>

        <Select 
          label="Estimated Hours"
          options={[1,2,3,4,5,6,7,8].map(h => ({ value: h.toString(), label: `${h} hour${h > 1 ? 's' : ''}` }))}
          error={errors.estimatedHours?.message}
          {...register('estimatedHours')}
        />

        <Textarea 
          label="Instructions (Optional)" 
          placeholder="e.g. Please wear a blue shirt so I can find you" 
          className="min-h-[80px]"
          error={errors.instructions?.message}
          {...register('instructions')}
        />

        <Separator />

        {/* Price Preview */}
        <Card accentColor="saffron" className="bg-[#FF6B00]/5 border-[#FF6B00]/20">
          <p className="font-mono text-[11px] text-[#8A8480] mb-2">
            ₹200/hr × {hours}hrs + ₹49 booking fee
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-bebas text-5xl text-[#FF6B00]">₹{total}</span>
          </div>
          
          <p className="font-mono text-[11px] text-[#1A7A4A] mb-6 uppercase tracking-wider">
            ✓ Stander earns ₹{standerEarns}
          </p>

          <div className="space-y-2.5">
            {[
              'Stander stays until your turn or time is up',
              'Geo-verified check-ins every 30 minutes',
              'Instant WhatsApp alert when your turn approaches',
              'Full refund if no Stander matched within 20 min'
            ].map(text => (
              <div key={text} className="flex items-start gap-2 text-[11px] text-[#5a4030]">
                <span className="text-[#1A7A4A] font-bold">✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button 
          type="submit" 
          loading={isLoading}
          disabled={isLoading || !razorpayLoaded}
          className="w-full py-7 text-2xl tracking-widest shadow-xl shadow-[#FF6B00]/20"
        >
          {isLoading ? 'PROCESSING...' : `PAY ₹${total} & BOOK`}
        </Button>

      </form>
    </div>
  );
}
