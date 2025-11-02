const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Token storage key
const TOKEN_KEY = 'hirebot_auth_token';
const OLD_TOKEN_KEY = 'token'; // For migration from old key

// Set auth token in localStorage (defined first to avoid circular dependency)
const setToken = (token: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Get auth token from localStorage
const getToken = (): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // First, try new key
      let token = localStorage.getItem(TOKEN_KEY);
      
      // If not found, check old key (migration)
      if (!token) {
        token = localStorage.getItem(OLD_TOKEN_KEY);
        if (token) {
          // Migrate to new key
          setToken(token);
          localStorage.removeItem(OLD_TOKEN_KEY);
        }
      }
      
      return token;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
};

// Remove auth token from localStorage
const removeToken = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    let data: any = {};
    
    // Only try to parse JSON if content-type indicates it
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // If JSON parsing fails, use the text as the message
          throw new Error(text || 'Invalid response from server');
        }
      }
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Server error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle network errors (connection refused, CORS, etc.)
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error(`Unable to connect to server at ${API_URL}. Please make sure the backend server is running.`);
      }
    }
    // Re-throw other errors (including our custom errors)
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  logout: (): void => {
    removeToken();
  },

  getCurrentUser: async (): Promise<{ user: { id: string; name: string; email: string } }> => {
    return apiRequest<{ user: { id: string; name: string; email: string } }>('/auth/me');
  },

  getToken,
  setToken,
  removeToken,
};

