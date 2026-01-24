// lib/config.ts
interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    AUTH: Record<string, string>;
    COMPANY: Record<string, string>;
    DELIVERIES: Record<string, string>;
    NOTIFICATIONS: Record<string, string>;
  };
  buildUrl: (endpoint: string) => string;
  getEndpoint: (category: keyof ApiConfig['ENDPOINTS'], key: string) => string;
}

export const API_CONFIG: ApiConfig = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.riderr.ng/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP_COMPANY_DRIVER: '/auth/signup-company-driver',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_VERIFICATION: '/auth/resend-verification',
      CHANGE_PASSWORD: '/auth/change-password',
      LOGOUT: '/auth/logout',
    },
    
    // Company endpoints
    COMPANY: {
      PROFILE: '/company/profile',
      SETTINGS: '/company/settings',
      DRIVERS: '/company/drivers',
      STATISTICS: '/company/statistics',
      DOCUMENTS: '/company/documents',
    },
    
    // Deliveries endpoints
    DELIVERIES: {
      COMPANY_DELIVERIES: '/deliveries/company/deliveries',
    },
    
    // Notifications endpoints
    NOTIFICATIONS: {
      UNREAD_COUNT: '/notifications/unread-count',
    },
  },
  
  // Helper function to build full URL
  buildUrl: (endpoint: string): string => {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${normalizedEndpoint}`;
  },
  
  // Helper to get specific endpoint
  getEndpoint: (category: keyof ApiConfig['ENDPOINTS'], key: string): string => {
    const endpoints = API_CONFIG.ENDPOINTS[category] as Record<string, string>;
    return endpoints[key];
  },
};

// For backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;