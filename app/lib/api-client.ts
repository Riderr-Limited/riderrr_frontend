// lib/api-client.ts
import { API_CONFIG } from './config';

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private static getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async post(url: string, data: any, contentType: string = 'application/json') {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(contentType),
      body: contentType === 'application/json' ? JSON.stringify(data) : data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', JSON.stringify(errorData, null, 2));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async put(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Helper method to build URL with API_CONFIG
  static buildUrl(endpoint: string): string {
    return API_CONFIG.buildUrl(endpoint);
  }

  // Helper method to get specific endpoint
  static getEndpoint(category: keyof typeof API_CONFIG.ENDPOINTS, key: string): string {
    return API_CONFIG.getEndpoint(category, key);
  }
}