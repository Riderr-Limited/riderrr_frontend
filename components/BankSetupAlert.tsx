// components/BankSetupAlert.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconBuildingBank, 
  IconAlertTriangle, 
  IconX, 
  IconArrowRight,
  IconInfoCircle 
} from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

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
          icon: <IconAlertTriangle className="h-6 w-6 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          title: 'Bank Account Required',
          message: 'Set up your bank account to receive payments from deliveries automatically.',
          buttonText: 'Setup Bank Account',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'saved_unverified':
        return {
          icon: <IconInfoCircle className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          title: 'Bank Account Pending Verification',
          message: `Your bank account (${bankAccount?.bankName} - ****${bankAccount?.accountNumber?.slice(-4)}) will be verified on your first settlement.`,
          buttonText: 'View Details',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return null;
    }
  };

  const content = getAlertContent();
  if (!content) return null;

  return (
    <div className={`${content.bgColor} ${content.borderColor} border rounded-xl p-4 md:p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {content.icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${content.textColor} mb-2`}>
                {content.title}
              </h3>
              <p className={`text-sm ${content.textColor} mb-4 leading-relaxed`}>
                {content.message}
              </p>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSetupBank}
                  className={`${content.buttonColor} text-white px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm`}
                >
                  <IconBuildingBank className="h-4 w-4" />
                  {content.buttonText}
                  <IconArrowRight className="h-4 w-4" />
                </Button>
                
                {setupStatus === 'saved_unverified' && (
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                    ✓ Account saved
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors ml-4"
              title="Dismiss"
            >
              <IconX className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}