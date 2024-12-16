import { API_BASE_URL,ACCESS_TOKEN } from "../constants";

import axios from 'axios';

export interface UserProfile {
    userId: string;
    email: string;
    fullName: string;
    registrationDate: string;
    lastLogin: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userProfile: UserProfile;
    tokenType: 'BEARER';
  }
  
  // Authentication Service
  export class AuthService {
    // Local storage keys
    private static ACCESS_TOKEN_KEY = 'access_token';
    private static REFRESH_TOKEN_KEY = 'refresh_token';
    private static USER_PROFILE_KEY = 'user_profile';
  
    // Store login response
    public static storeLoginResponse(response: LoginResponse): void {
      // Store tokens
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      
      // Store user profile
      localStorage.setItem(
        this.USER_PROFILE_KEY, 
        JSON.stringify(response.userProfile)
      );
    }
  
    // Retrieve user profile
    /**
     * Retrieves the user profile from local storage.
     * @returns The user profile if it exists, otherwise null.
     * @example
     * const userProfile = AuthService.getUserProfile();
     * if (userProfile) {
     *   console.log(`Name: ${userProfile.fullName}`);
     *   console.log(`Email: ${userProfile.email}`);
     * }
     */
    public static getUserProfile(): UserProfile | null {
      const profileJson = localStorage.getItem(this.USER_PROFILE_KEY);
      return profileJson ? JSON.parse(profileJson) : null;
    }

    public static getUserId(): string | null {
        const profileJson = localStorage.getItem(this.USER_PROFILE_KEY);
        return profileJson ? JSON.parse(profileJson).userId : null;
      }
  
    // Get access token
    public static getAccessToken(): string | null {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
  
    // Get refresh token
    public static getRefreshToken(): string | null {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
  
    // Check if user is authenticated
    public static isAuthenticated(): boolean {
      return !!this.getAccessToken();
    }
  
    // Logout method
    public static logout(): void {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_PROFILE_KEY);
    }
  
    // Axios interceptor example
    public static setupAxiosInterceptors(axios: any) {
      // Request interceptor
      axios.interceptors.request.use(
        (config: any) => {
          const token = this.getAccessToken();
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error: any) => Promise.reject(error)
      );
  
      // Response interceptor for token refresh
      axios.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
          const originalRequest = error.config;
  
          // If unauthorized and not already retried
          if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
  
            try {
              // Implement your token refresh logic here
              const refreshToken = this.getRefreshToken();
              const response = await axios.post('/auth/refresh', { refreshToken });
              
              // Update stored tokens
              this.storeLoginResponse(response.data);
  
              // Retry the original request
              originalRequest.headers['Authorization'] = 
                `Bearer ${response.data.accessToken}`;
              return axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              this.logout();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }
  
          return Promise.reject(error);
        }
      );
    }
  }















// Function to handle user registration
export const register = async (email: string, password: string, username: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      email,
      password,
      username,
    });
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

// Function to handle user login
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signin`, {
      email,
      password,
    },
    {
      headers: {
        'Content-Type': `application/json`,
        'X-Requested-With': `XMLHttpRequest`
      },
    });
    console.log(response.data);
    AuthService.storeLoginResponse(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};

// Function to handle change password
export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const response = await axios.post(
      `${API_BASE_URL}/change-password`,
      {
        oldPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Password change failed');
  }
};




// Function to handle user logout
export const logout = async () => {
  try {
    const accessToken = AuthService.getAccessToken();
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    AuthService.logout();
    return response.data;
  } catch (error) {
    throw new Error('Logout failed');
  }
};
