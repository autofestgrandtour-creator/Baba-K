"use client";

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { EventItem, TicketTier } from '@/types';

interface PaystackCheckoutButtonProps {
  event: EventItem;
  tier: TicketTier;
  qty: number;
  buyerName: string;
  buyerEmail: string;
  selectedGateway: 'paystack' | 'opay' | 'alatpay';
  setError: React.Dispatch<React.SetStateAction<string>>;
  setPaymentState: React.Dispatch<React.SetStateAction<'idle' | 'processing'>>;
  setProcessingStep: React.Dispatch<React.SetStateAction<string>>;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaystackCheckoutButton({
  event,
  tier,
  qty,
  buyerName,
  buyerEmail,
  selectedGateway,
  setError,
  setPaymentState,
  setProcessingStep,
  onSuccess,
  onClose,
}: PaystackCheckoutButtonProps) {
  const totalAmount = tier.price * qty;
  const config = {
    reference: `REF-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`,
    email: buyerEmail,
    amount: totalAmount * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayClick = async () => {
    setError('');

    if (!buyerName || !buyerEmail) {
      setError('Please provide the Attendee Name and target Email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(buyerEmail)) {
      setError('Attendee email format is incorrect.');
      return;
    }
    if (selectedGateway !== 'paystack') {
      setError('Live checkout currently supports Paystack only.');
      return;
    }

    setPaymentState('processing');
    setProcessingStep('Opening Paystack checkout...');

    const onSuccessCallback = async (reference: any) => {
      try {
        setProcessingStep('Verifying payment with backend...');
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: reference.reference,
            email: buyerEmail,
            eventId: event.id,
            tierName: tier.name,
            price: tier.price,
            quantity: qty,
            buyerName,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setProcessingStep('✓ Payment verified! Your tickets are being created...');
          setTimeout(() => {
            setPaymentState('idle');
            onSuccess();
            onClose();
          }, 2000);
        } else {
          setError(data.message || 'Payment was not verified by the server.');
          setPaymentState('idle');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Error verifying payment. Contact support.');
        setPaymentState('idle');
      }
    };

    const onCloseCallback = () => {
      console.log('User closed the payment window.');
      setPaymentState('idle');
      setProcessingStep('');
    };

    initializePayment({ onSuccess: onSuccessCallback, onClose: onCloseCallback });
  };

  return (
    <button
      type="button"
      onClick={handlePayClick}
      id="checkout-pay-btn"
      className="w-full py-4 bg-[#00F2FF] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#00F2FF]/20 hover:bg-[#00d6e0] transition-colors cursor-pointer flex items-center justify-center gap-2"
    >
      <span>Pay with Paystack</span>
    </button>
  );
}
