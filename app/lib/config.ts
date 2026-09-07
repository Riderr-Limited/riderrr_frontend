// lib/config.ts
interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    AUTH: Record<string, string>;
    COMPANY: Record<string, string>;
    COMPANY_DASHBOARD: Record<string, string | ((...args: string[]) => string)>;
    DELIVERIES: Record<string, string>;
    PAYMENTS: Record<string, string>;
    NOTIFICATIONS: Record<string, string>;
  };
  buildUrl: (endpoint: string) => string;
  getEndpoint: (category: keyof ApiConfig["ENDPOINTS"], key: string) => string;
}

export const API_CONFIG: ApiConfig = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://riderr-backend.onrender.com/api",

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      SIGNUP: "/auth/signup",
      SIGNUP_COMPANY_DRIVER: "/auth/signup-company-driver",
      VERIFY_EMAIL: "/auth/verify-email",
      RESEND_VERIFICATION: "/auth/resend-verification",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      PROFILE: "/auth/profile",
      CHANGE_PASSWORD: "/auth/change-password",
    },

    // Company endpoints
    COMPANY: {
      PROFILE: "/company/profile",
      SETTINGS: "/company/settings",
      DRIVERS: "/company/drivers",
      STATS: "/company/stats",
      STATISTICS: "/company/stats",
      NOTIFICATIONS: "/company/notifications",
    },

    // Company Dashboard endpoints
    COMPANY_DASHBOARD: {
      OVERVIEW: "/company-dashboard/overview",
      RIDERS: "/company-dashboard/riders",
      RIDER_APPROVE: (id: string) => `/company-dashboard/riders/${id}/approve`,
      RIDER_SUSPEND: (id: string) => `/company-dashboard/riders/${id}/suspend`,
      RIDER_ACTIVATE: (id: string) => `/company-dashboard/riders/${id}/activate`,
      RIDER_DELIVERIES: (id: string) => `/company-dashboard/riders/${id}/deliveries`,
      DELIVERIES: "/company-dashboard/deliveries",
      MANUAL_RECORDS: "/company-dashboard/manual-records",
      MANUAL_RECORDS_SUMMARY: "/company-dashboard/manual-records/summary",
      MANUAL_RECORD: (id: string) => `/company-dashboard/manual-records/${id}`,
    },

    // Notifications endpoints
    NOTIFICATIONS: {
      UNREAD_COUNT: "/notifications/unread-count",
    },

    // Deliveries endpoints
    DELIVERIES: {
      COMPANY_DELIVERIES: "/deliveries/company/deliveries",
    },

    // Payments endpoints
    PAYMENTS: {
      BANKS: "/payments/banks",
      VERIFY_ACCOUNT: "/payments/verify-account",
      COMPANY_PAYMENTS: "/payments/company-payments",
      COMPANY_SETTLEMENTS: "/payments/company-settlements",
      COMPLETE_AND_SETTLE: "/payments/complete-and-settle",
      COMPANY_BANK_ACCOUNT: "/payments/company/bank-account",
      SETUP_BANK_ACCOUNT: "/payments/company/setup-bank-account",
    },
  },

  // Helper function to build full URL
  buildUrl: (endpoint: string): string => {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ""); // Remove trailing slash
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    return `${baseUrl}${normalizedEndpoint}`;
  },

  // Helper to get specific endpoint
  getEndpoint: (
    category: keyof ApiConfig["ENDPOINTS"],
    key: string,
  ): string => {
    const endpoints = API_CONFIG.ENDPOINTS[category] as Record<string, string>;
    return endpoints[key];
  },
};

// For backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
