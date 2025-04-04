// lib/api.ts
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// Build status response type
export interface BuildStatus {
  id: string;
  status: string;
  progress: number;
  estimatedTime: number;
  startedAt: string;
  completedAt?: string;
  buildUrl?: string;
  error?: string;
}

// Project creation response
export interface ProjectCreateResponse {
  _id: string;
}

export async function apiRequest<T = unknown, D = Record<string, unknown>>(
  endpoint: string, 
  method: RequestMethod = 'GET', 
  data?: D
): Promise<ApiResponse<T>> {
  const session = await getSession();
  
  if (!API_URL) {
    throw new Error('API_URL is not defined in environment variables');
  }
  
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making API request to: ${url}`, { method });
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`HTTP error ${response.status}: ${e.message}`);
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
      }
    }
    
    const responseData = await response.json();
    return responseData as ApiResponse<T>;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}