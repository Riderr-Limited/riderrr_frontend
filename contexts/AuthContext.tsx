// contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "driver" | "company_admin" | "admin";
  companyId?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isActive?: boolean;
  driverId?: string;
  createdAt?: string;
  company?: {
    _id: string;
    name: string;
    businessType?: string;
    logo?: string;
  };
}

interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: User["role"];
  companyId?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User | null;
  };
}

interface ApiError {
  message: string;
  errors?: string[];
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  forgotPassword: (emailOrPhone: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => Promise<AuthResponse>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<AuthResponse>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - adjust based on your environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.riderr.ng/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          await fetchUserProfile();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Token management
  const getAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  };

  const getRefreshToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  // Store user data in localStorage for persistence
  const storeUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // API request helper with better error handling
  const apiRequest = async <T,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Safely merge additional headers
    if (
      options.headers &&
      typeof options.headers === "object" &&
      !Array.isArray(options.headers)
    ) {
      const additionalHeaders = options.headers as Record<string, string>;
      Object.assign(headers, additionalHeaders);
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle token refresh on 401
      if (response.status === 401 && !headers["no-refresh"]) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry the original request with new token
          return apiRequest(endpoint, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${getAccessToken()}`,
              "no-refresh": "true",
            },
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Error ${response.status}: ${response.statusText}`,
        );
      }

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Unable to connect to server. Please check your internet connection.",
        );
      }
      throw error;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const data = await apiRequest<AuthResponse>("/users/profile");
      if (data.success && data.data.user) {
        setUser(data.data.user);
        storeUser(data.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (data.success && data.data) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        storeUser(data.data.user);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (registerData: RegisterData) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      if (data.success && data.data) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        storeUser(data.data.user);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register as rider (driver)
  const registerAsRider = async (riderData: RegisterData & { companyId: string }) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(
        "/auth/signup-company-driver",
        {
          method: "POST",
          body: JSON.stringify(riderData),
        },
      );

      if (data.success && data.data) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        storeUser(data.data.user);
      } else {
        throw new Error(data.message || "Rider registration failed");
      }
    } catch (error) {
      console.error("Rider registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with company
  const registerWithCompany = async (companyId: string, userData: RegisterData) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(
        `/auth/signup/company/${companyId}`,
        {
          method: "POST",
          body: JSON.stringify(userData),
        },
      );

      if (data.success && data.data) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        storeUser(data.data.user);
      } else {
        throw new Error(data.message || "Company registration failed");
      }
    } catch (error) {
      console.error("Company registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    if (isRefreshing) return false;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem("access_token", data.data.accessToken);
        // Refresh token might also be rotated
        if (data.data.refreshToken) {
          localStorage.setItem("refresh_token", data.data.refreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearTokens();
      setUser(null);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint if token exists
      const token = getAccessToken();
      if (token) {
        await apiRequest("/auth/logout", {
          method: "POST",
        }).catch(() => {
          // Silently fail if logout API fails
        });
      }
    } finally {
      clearTokens();
      setUser(null);
      setIsLoading(false);
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    const updatedUser = user ? { ...user, ...userData } : (userData as User);
    setUser(updatedUser);
    if (updatedUser) {
      storeUser(updatedUser);
    }
  };

  // Forgot password
  const forgotPassword = async (emailOrPhone: string): Promise<ForgotPasswordResponse> => {
    try {
      const data = await apiRequest<{ success: boolean; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: emailOrPhone }), // Note: backend expects 'email' field
      });

      // Handle backend response structure
      if (!data.success) {
        throw new Error(data.message || "Failed to send reset instructions");
      }

      // Return the expected ForgotPasswordResponse structure
      return {
        success: data.success,
        message: data.message,
        data: {
          accessToken: "", // Not applicable for forgot password
          refreshToken: "", // Not applicable
          user: null,
        },
      };
    } catch (error) {
      console.error("Forgot password error:", error);

      // For security, still return success even if email doesn't exist
      // This matches backend behavior
      if (error instanceof Error && error.message.includes("Failed to send")) {
        return {
          success: true,
          message:
            "If an account exists with this email, a reset code will be sent",
          data: {
            accessToken: "",
            refreshToken: "",
            user: null,
          },
        };
      }

      throw error;
    }
  };

  // Reset password
  const resetPassword = async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }

      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token: string) => {
    try {
      const data = await apiRequest<AuthResponse>(
        `/auth/verify-email/${token}`,
      );

      if (!data.success) {
        throw new Error(data.message || "Email verification failed");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const data = await apiRequest<AuthResponse>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      if (data.success && data.data.user) {
        setUser(data.data.user);
        storeUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      const data = await apiRequest<AuthResponse>("/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      return data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || isRefreshing,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = "/login";
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for role-based access control - ADD THIS
export function useRole() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === "admin",
    isCompanyAdmin: user?.role === "company_admin",
    isDriver: user?.role === "driver",
    isCustomer: user?.role === "customer",
    isVerified: user?.isVerified === true,
    isActive: user?.isActive !== false,

    hasRole: (roles: string | string[]) => {
      if (!user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },

    canAccess: (requiredRole: string | string[]) => {
      if (!user) return false;
      if (!user.isVerified) return false;
      if (!user.isActive) return false;

      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
      }
      return user.role === requiredRole;
    },

    getUserRole: () => user?.role || "guest",
  };
}

// Hook for company-specific features - ADD THIS
export function useCompany() {
  const { user } = useAuth();

  return {
    companyId: user?.companyId,
    company: user?.company,
    isCompanyUser: !!user?.companyId,
    canManageCompany: user?.role === "company_admin" || user?.role === "admin",
    isCompanyAdmin: user?.role === "company_admin",
    isCompanyDriver: user?.role === "driver" && !!user?.companyId,
  };
}

// Hook for permissions - ADD THIS
export function usePermissions() {
  const { user } = useAuth();
  const { isAdmin, isCompanyAdmin, isDriver, isCustomer } = useRole();

  return {
    // Dashboard access
    canViewDashboard: !!user,
    canViewAdminDashboard: isAdmin,
    canViewCompanyDashboard: isCompanyAdmin || isAdmin,
    canViewDriverDashboard: isDriver,
    canViewCustomerDashboard: isCustomer,

    // Management permissions
    canManageUsers: isAdmin,
    canManageCompanies: isAdmin,
    canManageDrivers: isAdmin || isCompanyAdmin,
    canManageDeliveries: isAdmin || isCompanyAdmin || isDriver,
    canManageRides: isAdmin || isCompanyAdmin || isDriver,

    // Financial permissions
    canViewRevenue: isAdmin || isCompanyAdmin,
    canProcessPayments: isAdmin,
    canViewReports: isAdmin || isCompanyAdmin,

    // Profile permissions
    canEditProfile: !!user,
    canChangePassword: !!user,
    canUploadDocuments: isDriver || isCompanyAdmin,

    // Company-specific
    canAddDrivers: isCompanyAdmin || isAdmin,
    canViewCompanyStats: isCompanyAdmin || isAdmin,
    canManageCompanyProfile: isCompanyAdmin || isAdmin,
  };
}

// Add these type exports for better TypeScript support
export type { LoginCredentials, RegisterData, AuthResponse, ForgotPasswordResponse, ApiError };
