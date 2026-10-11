// components/BankSetupAlert.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconAlertTriangle,
  IconX,
  IconInfoCircle
} from '@tabler/icons-react';

interface BankSetupAlertProps {
  setupStatus: 'not_setup' | 'saved_unverified' | 'verified';
  bankAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    verified: boolean;
  } | null;
  onDismiss?: () => void;
}

export function BankSetupAlert({ setupStatus, bankAccount, onDismiss }: BankSetupAlertProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || setupStatus === 'verified') {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleSetupBank = () => {
    router.push('/dashboard/bank-setup');
  };

  const getAlertContent = () => {
    switch (setupStatus) {
      case 'not_setup':
        return {
          icon: <IconAlertTriangle className="size-[18px] text-amber-600" stroke={1.75} />,
          title: 'Add a bank account to get paid',
          message: 'Delivery payments are settled to your bank account automatically once it is set up.',
          buttonText: 'Set up bank account',
        };
      case 'saved_unverified':
        return {
          icon: <IconInfoCircle className="size-[18px] text-brand-primary" stroke={1.75} />,
          title: 'Bank account pending verification',
          message: `${bankAccount?.bankName} ····${bankAccount?.accountNumber?.slice(-4)} will be verified on your first settlement.`,
          buttonText: 'View details',
        };
      default:
        return null;
    }
  };

  const content = getAlertContent();
  if (!content) return null;

  return (
    <div className="dash-card flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 shrink-0">{content.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-ink">{content.title}</p>
          <p className="mt-0.5 text-sm text-brand-ink-muted">{content.message}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-[30px] sm:pl-0">
        <button onClick={handleSetupBank} className="dash-btn dash-btn-sm dash-btn-secondary">
          {content.buttonText}
        </button>
        <button
          onClick={handleDismiss}
          className="dash-icon-btn"
          title="Dismiss"
          aria-label="Dismiss"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </div>
  );
}
