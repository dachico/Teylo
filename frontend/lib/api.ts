import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T, D = Record<string, unknown>>(
  endpoint: string, 
  method: RequestMethod = 'GET', 
  data?: D
): Promise<T> {
  const session = await getSession();
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
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error ${response.status} ${e}`);
      }
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}