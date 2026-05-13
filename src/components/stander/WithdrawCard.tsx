'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  balance: number; // in paise
  upiId: string | null;
  onUpdateUPI: (newUpi: string) => Promise<void>;
}

export default function WithdrawCard({ balance, upiId: initialUpi, onUpdateUPI }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [upiId, setUpiId] = useState(initialUpi || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!upiId) {
      toast.error('Please set a UPI ID first');
      return;
    }
    
    if (balance < 10000) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/stander/withdraw', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      
      toast.success(`₹${balance / 100} withdrawal initiated to ${upiId}`);
      window.location.reload(); // Refresh to update balance
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUPI = async () => {
    setIsLoading(true);
    try {
      await onUpdateUPI(upiId);
      setIsEditing(false);
      toast.success('UPI ID updated');
    } catch (err) {
      toast.error('Failed to update UPI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-4 mt-4 space-y-6">
      <div>
        <p className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest mb-1">Available Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#1A1612]">{formatINR(balance)}</span>
        </div>
      </div>

      <div className="bg-[#F7F4EE] rounded-lg p-4 border border-[#D4CFC6]/30">
        <div className="flex justify-between items-center mb-2">
          <p className="font-mono text-[9px] text-[#8A8480] uppercase tracking-widest">Withdrawal UPI ID</p>
          <button 
            onClick={() => isEditing ? saveUPI() : setIsEditing(true)}
            className="text-[10px] font-bold text-[#FF6B00] hover:underline uppercase"
            disabled={isLoading}
          >
            {isEditing ? 'SAVE' : 'EDIT'}
          </button>
        </div>
        {isEditing ? (
          <Input 
            value={upiId} 
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. user@okaxis"
            className="bg-white h-9 text-xs"
            autoFocus
          />
        ) : (
          <p className="text-sm font-semibold text-[#1A1612]">
            {upiId || <span className="text-red-400 font-normal italic">Not set</span>}
          </p>
        )}
      </div>

      <Button 
        onClick={handleWithdraw}
        loading={isLoading}
        disabled={isLoading || balance < 10000 || !upiId}
        className="w-full py-4 bg-[#1A7A4A] hover:bg-[#145d38] border-none uppercase tracking-widest font-mono text-xs h-auto shadow-lg shadow-green-900/10"
      >
        {balance < 10000 ? `₹${(10000 - balance) / 100} more to withdraw` : 'WITHDRAW TO UPI'}
      </Button>
    </Card>
  );
}
