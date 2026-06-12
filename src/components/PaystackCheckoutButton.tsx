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
  const isFreeTicket = totalAmount === 0;

  const config = {
    reference: `REF-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`,
    email: buyerEmail,
    amount: Math.max(100, totalAmount * 100), // Minimum 100 kobo if 0, otherwise total
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const handleFreeTicket = async () => {
    try {
      setProcessingStep('Creating free ticket reservation...');
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: `FREE-${Date.now()}`,
          email: buyerEmail,
          eventId: event.id,
          tierName: tier.name,
          price: 0,
          quantity: qty,
          buyerName,
          isFree: true,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProcessingStep('✓ Free ticket reserved! Check your email...');
        setTimeout(() => {
          setPaymentState('idle');
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to create free ticket reservation.');
        setPaymentState('idle');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating free ticket. Contact support.';
      setError(errorMessage);
      setPaymentState('idle');
    }
  };

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

    // Handle free tickets separately (no payment required)
    if (isFreeTicket) {
      setPaymentState('processing');
      await handleFreeTicket();
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
        const errorMessage = err instanceof Error ? err.message : 'Error verifying payment. Contact support.';
        console.error('Verification error:', err);
        setError(errorMessage);
        setPaymentState('idle');
      }
    };

    const onCloseCallback = () => {
      console.log('User closed the payment window.');
      setPaymentState('idle');
      setProcessingStep('');
    };

    const onErrorCallback = (error: any) => {
      const errorMessage = error instanceof Error ? error.message : (error?.message || 'Payment initialization failed.');
      console.error('Paystack error:', error);
      setError(errorMessage);
      setPaymentState('idle');
    };

    try {
      initializePayment({ 
        onSuccess: onSuccessCallback, 
        onClose: onCloseCallback,
        onError: onErrorCallback
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment.';
      console.error('Payment init error:', err);
      setError(errorMessage);
      setPaymentState('idle');
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayClick}
      id="checkout-pay-btn"
      className="w-full py-4 bg-[#00F2FF] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#00F2FF]/20 hover:bg-[#00d6e0] transition-colors cursor-pointer flex items-center justify-center gap-2"
    >
      <span>{isFreeTicket ? 'Get Free Ticket' : 'Pay with Paystack'}</span>
    </button>
  );
}
