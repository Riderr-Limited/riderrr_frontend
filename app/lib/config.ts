// lib/config.ts
interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    AUTH: Record<string, string>;
    COMPANY: Record<string, string>;
    DELIVERIES: Record<string, string>;
    PAYMENTS: Record<string, string>;
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
      NOTIFICATIONS: "/company/notifications",
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
