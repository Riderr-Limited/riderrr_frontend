// lib/tokenUtils.ts
export const TokenUtils = {
  // Get token from either storage key
  getToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '';
  },

  // Set token using consistent key
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
    // Also set the camelCase version for backward compatibility
    localStorage.setItem('accessToken', token);
  },

  // Get refresh token
  getRefreshToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken') || '';
  },

  // Set refresh token using consistent key
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refresh_token', token);
    localStorage.setItem('refreshToken', token);
  },

  // Get user data safely
  getUser(): any {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Clear all tokens and user data
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isVerified');
  }
};