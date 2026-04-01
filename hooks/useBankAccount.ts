// hooks/useBankAccount.ts
import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/app/lib/config';
import { TokenUtils } from '@/lib/tokenUtils';

interface BankAccount {
  accountNumber: string;
  accountNumberFull: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  verified: boolean;
  verifiedAt: string | null;
}

interface BankAccountData {
  isSetup: boolean;
  bankAccount: BankAccount | null;
  setupStatus: 'not_setup' | 'saved_unverified' | 'verified';
  message: string;
}

export function useBankAccount() {
  const [bankData, setBankData] = useState<BankAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = TokenUtils.getToken();
      if (!token) {
        setError('No authentication token');
        return;
      }

      const response = await fetch(
        API_CONFIG.buildUrl('/payments/company/bank-account'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setBankData(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank account');
      }
    } catch (err) {
      console.error('Error fetching bank account:', err);
      setError('Failed to fetch bank account status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccount();
  }, []);

  return {
    bankData,
    loading,
    error,
    refetch: fetchBankAccount,
    isSetup: bankData?.isSetup || false,
    setupStatus: bankData?.setupStatus || 'not_setup',
    needsSetup: !bankData?.isSetup,
  };
}