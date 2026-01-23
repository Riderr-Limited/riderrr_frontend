import { create } from "zustand";

export interface OrgForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  city: string;
  state: string;
  address: string;
  lga: string;
  businessLicense: string;
  taxId: string;
  companyPhone: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface OrgStore {
  step: number;
  loading: boolean;
  accessToken?: string;
  userId?: string;
  form: OrgForm;
  setStep: (step: number) => void;
  update: <K extends keyof OrgForm>(key: K, value: OrgForm[K]) => void;
  setAuth: (token: string, userId: string) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useOrgStore = create<OrgStore>((set) => ({
  step: 1,
  loading: false,
  form: {
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    city: "",
    state: "",
    address: "",
    lga: "",
    businessLicense: "",
    taxId: "",
    companyPhone: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  },
  setStep: (step) => set({ step }),
  update: (key, value) => set((s) => ({ form: { ...s.form, [key]: value } })),
  setAuth: (accessToken, userId) => set({ accessToken, userId }),
  setLoading: (loading) => set({ loading }),
  reset: () =>
    set({
      step: 1,
      loading: false,
      accessToken: undefined,
      userId: undefined,
    }),
}));
