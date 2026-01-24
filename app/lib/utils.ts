// libs/utils.ts

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options?: {
    includeTime?: boolean;
    short?: boolean;
    locale?: string;
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const { includeTime = false, short = false, locale = 'en-US' } = options || {};

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  if (includeTime) {
    return new Intl.DateTimeFormat(locale, {
      ...dateOptions,
      ...timeOptions,
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, dateOptions).format(date);
}

/**
 * Format a date to relative time (e.g., "2 hours ago", "yesterday")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, { short: true });
  }
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: NGN)
 * @param locale - Locale (default: en-NG)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  locale: string = 'en-NG'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    // Format +234 XXX XXX XXXX
    return `+${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Format 0XXX XXX XXXX
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phone;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 * @param text - camelCase text
 * @returns Title Case text
 */
export function camelToTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Convert string to URL-friendly slug
 * @param text - Text to convert
 * @returns URL slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Generate a random ID
 * @param length - Length of ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function for limiting frequent calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for limiting call frequency
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns Boolean indicating if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Merge multiple objects deeply
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function deepMerge<T>(...objects: Partial<T>[]): T {
  const result: any = {};
  
  objects.forEach(obj => {
    if (!obj) return;
    
    Object.keys(obj).forEach(key => {
      const val = (obj as any)[key];
      
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        result[key] = deepMerge(result[key] || {}, val);
      } else if (Array.isArray(val)) {
        result[key] = (result[key] || []).concat([...val]);
      } else {
        result[key] = val;
      }
    });
  });
  
  return result as T;
}

/**
 * Get initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join('');
}

/**
 * Get status color class based on status
 * @param status - Status string
 * @returns Tailwind CSS class for status color
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  const colorMap: Record<string, string> = {
    // Delivery statuses
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    picked_up: 'bg-purple-100 text-purple-800 border-purple-200',
    in_transit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    
    // Payment statuses
    paid: 'bg-green-100 text-green-800 border-green-200',
    unpaid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    
    // Driver statuses
    online: 'bg-green-100 text-green-800 border-green-200',
    offline: 'bg-gray-100 text-gray-800 border-gray-200',
    busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    
    // Approval statuses
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    
    // Company statuses
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  
  return colorMap[statusLower] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get status badge text
 * @param status - Status string
 * @returns Human-readable status text
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Failed',
    paid: 'Paid',
    unpaid: 'Unpaid',
    refunded: 'Refunded',
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    approved: 'Approved',
    rejected: 'Rejected',
    pending_approval: 'Pending Approval',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending_verification: 'Pending Verification',
  };
  
  return statusMap[status.toLowerCase()] || capitalizeWords(status.replace('_', ' '));
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Nigeria format)
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    errors.push('Password must be at least 8 characters long');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push('Password must contain at least one number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * CN utility function for conditional class names (similar to clsx)
 * @param classes - Class names to conditionally include
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get time ago string from date
 * @param date - Date object or string
 * @returns Time ago string
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return '1 year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return '1 month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return 'yesterday';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return '1 hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return '1 minute ago';
  
  return 'just now';
}

/**
 * Format distance in kilometers
 * @param distance - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * Format duration in minutes
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

export default {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  truncateText,
  formatPhoneNumber,
  capitalizeWords,
  camelToTitleCase,
  slugify,
  generateId,
  formatFileSize,
  debounce,
  throttle,
  isEmpty,
  deepClone,
  deepMerge,
  getInitials,
  getStatusColor,
  getStatusText,
  isValidEmail,
  isValidPhone,
  validatePassword,
  cn,
  timeAgo,
  formatDistance,
  formatDuration,
};