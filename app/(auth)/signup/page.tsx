"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useOrgStore } from "@/store/orgRegistration.store";

export default function OrgRegistration({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Use stores
  const { step, loading, form, setStep, update, setLoading } = useOrgStore();
  const { setAuth } = useAuthStore();
  
  // Local states for verification flow
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateField(field: string, value: string) {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'phone':
      case 'companyPhone':
        // Accept exactly: 08012345678 (11 digits) or +2348012345678 (14 digits)
        const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
        if (value && !phoneRegex.test(value)) {
          newErrors[field] = 'Please use format: 08012345678 (11 digits) or +2348012345678 (14 digits)';
        } else {
          // Additional length check
          if (value && value.startsWith('0') && value.length !== 11) {
            newErrors[field] = `Phone number must be exactly 11 digits when starting with 0. You entered ${value.length} digits.`;
          } else if (value && value.startsWith('+234') && value.length !== 14) {
            newErrors[field] = `Phone number must be exactly 14 digits when starting with +234. You entered ${value.length} digits.`;
          } else {
            delete newErrors[field];
          }
        }
        break;
        
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'accountNumber':
        if (value && !/^\d{10}$/.test(value)) {
          newErrors.accountNumber = 'Account number must be 10 digits';
        } else {
          delete newErrors.accountNumber;
        }
        break;
        
      default:
        if (!value && field !== 'taxId' && field !== 'bankName' && 
            field !== 'accountName' && field !== 'accountNumber') {
          newErrors[field] = 'This field is required';
        } else {
          delete newErrors[field];
        }
    }
    
    setErrors(newErrors);
  }

  // Validate all required fields for current step
  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      const step1Fields = ['companyName', 'name', 'phone', 'email', 'password'];
      step1Fields.forEach(field => {
        if (!form[field as keyof typeof form]) {
          newErrors[field] = 'This field is required';
        }
      });
      
      // Email format validation
      if (form.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
      
      // Phone format validation
      if (form.phone) {
        const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
        if (!phoneRegex.test(form.phone)) {
          newErrors.phone = 'Please use format: 08012345678 (11 digits) or +2348012345678 (14 digits)';
        } else {
          // Length check
          if (form.phone.startsWith('0') && form.phone.length !== 11) {
            newErrors.phone = `Phone number must be exactly 11 digits when starting with 0. You entered ${form.phone.length} digits.`;
          } else if (form.phone.startsWith('+234') && form.phone.length !== 14) {
            newErrors.phone = `Phone number must be exactly 14 digits when starting with +234. You entered ${form.phone.length} digits.`;
          }
        }
      }
      
      // Password length validation
      if (form.password && form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (step === 2) {
      const step2Fields = ['address', 'city', 'state', 'lga', 'businessLicense', 'companyPhone'];
      step2Fields.forEach(field => {
        if (!form[field as keyof typeof form]) {
          newErrors[field] = 'This field is required';
        }
      });
      
      // Company phone format validation
      if (form.companyPhone) {
        const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
        if (!phoneRegex.test(form.companyPhone)) {
          newErrors.companyPhone = 'Please use format: 08012345678 (11 digits) or +2348012345678 (14 digits)';
        } else {
          // Length check
          if (form.companyPhone.startsWith('0') && form.companyPhone.length !== 11) {
            newErrors.companyPhone = `Company phone must be exactly 11 digits when starting with 0. You entered ${form.companyPhone.length} digits.`;
          } else if (form.companyPhone.startsWith('+234') && form.companyPhone.length !== 14) {
            newErrors.companyPhone = `Company phone must be exactly 14 digits when starting with +234. You entered ${form.companyPhone.length} digits.`;
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle next step
  function handleNext() {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
    }
  }

  // Handle previous step
  function handlePrevious() {
    setStep(step - 1);
  }

  async function submitRegistration() {
    // Final validation before submission
    if (!validateStep(3)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare JSON payload for backend
      const payload = {
        // User fields
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: "company_admin",
        
        // Company fields
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        lga: form.lga.trim(),
        businessLicense: form.businessLicense.trim(),
        taxId: form.taxId?.trim() || "",
        companyPhone: form.companyPhone.trim(),
        
        // Bank details (optional)
        bankName: form.bankName?.trim() || "",
        accountName: form.accountName?.trim() || "",
        accountNumber: form.accountNumber?.trim() || "",
      };

      console.log('📤 Sending registration data:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "http://localhost:5000/api/auth/signup", 
        payload, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Registration successful:', response.data);

      // Store auth data in stores
      if (response.data.data?.accessToken && response.data.data?.refreshToken) {
        // Store in auth store
        setAuth({
          user: response.data.data.user,
          userId: response.data.data.user?._id,
          email: response.data.data.user?.email,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          requiresVerification: response.data.requiresVerification || true
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('userId', response.data.data.user?._id || '');
        localStorage.setItem('userEmail', form.email.trim().toLowerCase());
        
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      }

      // AUTOMATICALLY SHOW VERIFICATION SCREEN
      setShowVerification(true);
      
      toast({
        title: "Verification Required",
        description: "Please verify your email to complete registration",
      });

    } catch (err: any) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        
        if (err.response.status === 422) {
          // Validation errors from backend
          const errorData = err.response.data;
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((e: any) => {
              // Show field-specific errors
              const field = Object.keys(e)[0];
              const message = e[field];
              return `${field}: ${message}`;
            }).join(', ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (err.response.status === 409) {
          errorMessage = "User with this email or phone already exists";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Bad request";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
          console.error('Server error details:', err.response.data);
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Handle email verification
  async function handleVerifyEmail() {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    if (!form.email) {
      toast({
        title: "Session Error",
        description: "Please start the registration process again",
        variant: "destructive"
      });
      return;
    }

    setVerificationLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-email",
        {
          email: form.email.trim().toLowerCase(),
          token: verificationCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email verification successful:', response.data);

      // Update auth store with verified user
      if (response.data.data?.accessToken) {
        setAuth({
          accessToken: response.data.data.accessToken,
          user: response.data.data.user,
          isVerified: true
        });
        
        // Update localStorage
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('isVerified', 'true');
        
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      }

      toast({
        title: "Email Verified!",
        description: response.data.message || "Your email has been verified successfully",
      });

      // AUTOMATICALLY REDIRECT TO DASHBOARD AFTER 1.5 SECONDS
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('❌ Verification error:', err);
      
      let errorMessage = "Verification failed. Please try again.";
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid or expired verification code";
        } else if (err.response.status === 404) {
          errorMessage = "User not found. Please register again.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setVerificationLoading(false);
    }
  }

  // Handle resend verification code
  async function handleResendCode() {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-verification",
        {
          email: form.email.trim().toLowerCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Resend code successful:', response.data);

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
      });

    } catch (err: any) {
      console.error('❌ Resend code error:', err);
      
      let errorMessage = "Failed to resend code. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  // Go back to registration form
  function handleBackToRegistration() {
    setShowVerification(false);
    setVerificationCode("");
  }

  // If showing verification screen, render verification UI
  if (showVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          {/* Verification Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to <strong>{form.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please check your inbox (and spam folder) for the verification email.
              The code expires in 10 minutes.
            </p>
          </div>
          
          {/* Verification Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
              <p className="text-gray-600 text-sm">
                Enter the 6-digit code sent to your email address.
              </p>
            </div>
            
            {/* Verification Input */}
            <div className="space-y-4">
              <div>
                <label className="text-[14px] font-medium mb-2 block">
                  Verification Code
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  maxLength={6}
                  placeholder="123456"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationCode(value);
                  }}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  6-digit code (numbers only)
                </p>
              </div>
              
              <Button
                className="bg-[#337BFF] text-white w-full"
                onClick={handleVerifyEmail}
                disabled={verificationLoading || verificationCode.length !== 6}
              >
                {verificationLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-[#337BFF] hover:text-[#2a6ce6]"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBackToRegistration}
                className="text-sm text-gray-600 hover:text-gray-900 w-full text-center"
              >
                ← Back to registration
              </button>
            </div>
          </div>
          
          {/* Registration Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Registration Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Company:</span> {form.companyName}</p>
              <p><span className="font-medium">Email:</span> {form.email}</p>
              <p><span className="font-medium">Status:</span> Awaiting verification</p>
            </div>
          </div>
          
          {/* Success Message (shown briefly before redirect) */}
          {verificationLoading && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-pulse">
              <p className="text-green-700 font-medium">✓ Verification successful!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render registration form (original UI)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Company Registration</h1>
          <p className="mt-2 text-gray-600">
            Register your company account in 3 simple steps
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex flex-wrap gap-6 md:gap-8 justify-center mb-12">
          <div className="flex flex-col items-center">
            <div className={`p-4 flex items-center justify-center text-[18px] md:text-[22px] font-semibold text-center h-14 w-14 rounded-full ${step === 1 ? "bg-[#337BFF] text-white" : "border-gray-400 bg-[#BCBCBC] border"}`}>
              1
            </div>
            <p className="text-[14px] font-semibold mt-2">Account Details</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`p-4 flex items-center justify-center text-[18px] md:text-[22px] font-semibold text-center h-14 w-14 rounded-full ${step === 2 ? "bg-[#337BFF] text-white" : "border bg-[#BCBCBC] border-gray-400"}`}>
              2
            </div>
            <p className="text-[14px] font-semibold mt-2">Company Details</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`p-4 flex items-center justify-center text-[18px] md:text-[22px] font-semibold text-center h-14 w-14 rounded-full ${step === 3 ? "bg-[#337BFF] text-white" : "border-gray-400 bg-[#BCBCBC] border"}`}>
              3
            </div>
            <p className="text-[14px] font-semibold mt-2">Bank Details</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-6">Account Information</h3>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Company Name *
                  </label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => {
                      update("companyName", e.target.value);
                      validateField("companyName", e.target.value);
                    }}
                    placeholder="Abcd Logistics"
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Contact Person Name *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      update("name", e.target.value);
                      validateField("name", e.target.value);
                    }}
                    placeholder="John Doe"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Contact Phone *
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => {
                      update("phone", e.target.value);
                      validateField("phone", e.target.value);
                    }}
                    placeholder="08012345678 or +2348012345678"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 08012345678 (11 digits) or +2348012345678 (14 digits)
                  </p>
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Company Phone *
                  </label>
                  <Input
                    value={form.companyPhone}
                    onChange={(e) => {
                      update("companyPhone", e.target.value);
                      validateField("companyPhone", e.target.value);
                    }}
                    placeholder="08012345679 or +2348012345679"
                    className={errors.companyPhone ? "border-red-500" : ""}
                  />
                  {errors.companyPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyPhone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 08012345678 (11 digits) or +2348012345678 (14 digits)
                  </p>
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      update("email", e.target.value);
                      validateField("email", e.target.value);
                    }}
                    placeholder="email@gmail.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => {
                      update("password", e.target.value);
                      validateField("password", e.target.value);
                    }}
                    placeholder="At least 6 characters"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Note:</span> All fields marked with * are required.
                  Your phone number will be used for account verification.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {step === 2 && (
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-6">Company Information</h3>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Business Address *
                  </label>
                  <Input
                    value={form.address}
                    onChange={(e) => {
                      update("address", e.target.value);
                      validateField("address", e.target.value);
                    }}
                    placeholder="123, Example Street"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    City *
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => {
                      update("city", e.target.value);
                      validateField("city", e.target.value);
                    }}
                    placeholder="Abuja"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    State *
                  </label>
                  <Input
                    value={form.state}
                    onChange={(e) => {
                      update("state", e.target.value);
                      validateField("state", e.target.value);
                    }}
                    placeholder="FCT"
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    LGA (Local Government Area) *
                  </label>
                  <Input
                    value={form.lga}
                    onChange={(e) => {
                      update("lga", e.target.value);
                      validateField("lga", e.target.value);
                    }}
                    placeholder="Municipal Area Council"
                    className={errors.lga ? "border-red-500" : ""}
                  />
                  {errors.lga && (
                    <p className="text-red-500 text-sm mt-1">{errors.lga}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Business License / Registration Number *
                  </label>
                  <Input
                    value={form.businessLicense}
                    onChange={(e) => {
                      update("businessLicense", e.target.value);
                      validateField("businessLicense", e.target.value);
                    }}
                    placeholder="RC12345678"
                    className={errors.businessLicense ? "border-red-500" : ""}
                  />
                  {errors.businessLicense && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessLicense}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Tax ID (optional)
                  </label>
                  <Input
                    value={form.taxId}
                    onChange={(e) => update("taxId", e.target.value)}
                    placeholder="TIN12345678"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {step === 3 && (
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-6">Bank Information</h3>
              
              {/* Bank Details Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Bank Details (Optional)</h3>
                <p className="text-sm text-blue-700">
                  Providing your bank details now will help speed up future payment processing.
                  You can skip this step and add it later from your account settings.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Bank Name
                  </label>
                  <Input
                    value={form.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    placeholder="Access Bank"
                  />
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Account Name
                  </label>
                  <Input
                    value={form.accountName}
                    onChange={(e) => update("accountName", e.target.value)}
                    placeholder="Riderr Limited"
                  />
                </div>
                
                <div>
                  <label className="text-[14px] font-medium mb-2 block">
                    Account Number
                  </label>
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => {
                      update("accountNumber", e.target.value);
                      validateField("accountNumber", e.target.value);
                    }}
                    placeholder="0123456789"
                    className={errors.accountNumber ? "border-red-500" : ""}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">10-digit account number</p>
                </div>
              </div>
              
              {/* Registration Summary */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Registration Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Company:</span> {form.companyName || "Not provided"}</p>
                  <p><span className="font-medium">Contact:</span> {form.name || "Not provided"}</p>
                  <p><span className="font-medium">Email:</span> {form.email || "Not provided"}</p>
                  <p><span className="font-medium">Phone:</span> {form.phone || "Not provided"}</p>
                  <p><span className="font-medium">Location:</span> {form.city && form.state ? `${form.city}, ${form.state}` : "Not provided"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg px-6 py-2"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div>
              {step < 3 ? (
                <Button
                  type="button"
                  className="bg-[#337BFF] text-white hover:bg-[#2a6ce6] rounded-lg px-8 py-2"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg px-6 py-2"
                    onClick={handlePrevious}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="bg-green-600 text-white hover:bg-green-700 rounded-lg px-8 py-2"
                    onClick={submitRegistration}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#337BFF] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-700">
                Step {step} of 3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}