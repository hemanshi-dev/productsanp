import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV
  ? '/api'  // Use Vite proxy in development
  : (import.meta.env.VITE_API_URL);
const SECRET_KEY = 'QNf1Mzd59w8u4VByb1VvzwM6ptXAdhXvRrWN8yaZ9tw';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  picture?: string;
  mobile_number?: string;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  user?: User;
}

export interface ProfileResponse {
  status: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    full_name?: string;
    picture?: string;
    mobile_number?: string;
    credits?: number;
    created_at?: string;
    email_verified?: boolean;
    google_id?: string | null;
    is_active?: boolean;
    last_login?: string;
    login_method?: string;
  };
}

export interface AdminLoginResponse {
  status: boolean;
  message: string;
  admin?: {
    id: string;
    email: string;
    name?: string;
    created_at?: string;
    last_login?: string;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  credits?: number;
  created_at?: string;
  is_active?: boolean;
}

export interface Pagination {
  has_more: boolean;
  limit: number;
  next_cursor?: string;
  total_users: number;
  users_returned: number;
}

export interface UserListResponse {
  status: boolean;
  message: string;
  data?: {
    pagination: Pagination;
    users: UserListItem[];
  };
}

// Generate HMAC signature (matches Python implementation)
const generateSignature = (apiKey: string, timestamp: string, body: string) => {
  // Ensure timestamp is a string to match Python's str(int(time.time()))
  const message = `${apiKey}${timestamp}${body}`;
  return CryptoJS.HmacSHA256(message, apiKey).toString(CryptoJS.enc.Hex);
};

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(error.response.data?.message || 'Request failed');
        } else if (error.request) {
          throw new Error('Network error - no response received');
        } else {
          throw new Error(error.message || 'Request failed');
        }
      }
    );
  }

  private async request<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      url: endpoint,
      ...config,
    });
    return response.data;
  }

  async googleAuth(googleData: {
    email: string;
    name: string;
    picture?: string;
    sub?: string;
    email_verified: boolean;
  }): Promise<AuthResponse> {
    // Use seconds since epoch (matches Python's int(time.time()))
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Ensure consistent JSON stringification
    const body = JSON.stringify(googleData);

    // Generate signature with timestamp as string (matches Python implementation)
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<AuthResponse>('/auth/google-login', {
      method: 'POST',
      data: body, // Send the stringified body directly to ensure it matches the signature
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    mobile_number: string;
  }): Promise<AuthResponse & { user?: { id: string; email: string; name: string; email_verified: boolean; created_at: string } }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<AuthResponse & { user?: { id: string; email: string; name: string; email_verified: boolean; created_at: string } }>('/auth/register', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async verifyOtp(data: {
    email: string;
    otp: string;
  }): Promise<AuthResponse & { credits_added?: number }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<AuthResponse & { credits_added?: number }>('/auth/verify-otp', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    // Use seconds since epoch (matches Python's int(time.time()))
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";

    // Generate signature with timestamp as string (matches Python implementation)
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<ProfileResponse>('/auth/profile', {
      method: 'GET',
      params: {
        user_id: userId,
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async updateProfile(data: { user_id: string; full_name?: string; mobile_number?: string }): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/auth/update-profile', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async resetPasswordRequest(data: { email: string }): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/auth/reset-password-request', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async resetPassword(data: { email: string; otp: string }): Promise<{ status: boolean; message: string; new_password?: string; note?: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string; new_password?: string; note?: string }>('/auth/reset-password', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async adminLogin(data: { email: string, password: string }): Promise<AdminLoginResponse> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<AdminLoginResponse>('/admin/login', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getUserList(limit: number = 10, cursor?: string): Promise<UserListResponse> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<UserListResponse>('/admin/users', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async searchUsers(query: string, limit: number = 10, cursor?: string): Promise<UserListResponse> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<UserListResponse>('/admin/users/search', {
      method: 'GET',
      params: {
        q: query,
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async updateUser(data: { id: string; credits?: number; is_active?: boolean }): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/users/update', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async updateUserStatus(data: { user_id: string; is_active: boolean; reason: string }): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/users/status', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async deleteUser(id: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/users/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async updateCredits(data: { user_id: string; credits_change: number; reason: string }): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/credits/update', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getCategories(limit: number = 10, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      categories: Array<{
        id: string;
        title: string;
        image: string;
        showBanner: boolean;
        is_active: boolean;
        index: number;
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        categories_returned: number;
        has_more: boolean;
        limit: number;
        next_cursor?: string | null;
        total_categories: number;
      };
      sorting: {
        sort_by: string;
        sort_order: string;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        categories: Array<{
          id: string;
          title: string;
          image: string;
          showBanner: boolean;
          is_active: boolean;
          index: number;
          created_at: string;
          updated_at: string;
        }>;
        pagination: {
          categories_returned: number;
          has_more: boolean;
          limit: number;
          next_cursor?: string | null;
          total_categories: number;
        };
        sorting: {
          sort_by: string;
          sort_order: string;
        };
      };
    }>('/admin/categories', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async createCategory(data: FormData): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // For FormData, we can't stringify it, so we'll use empty string for signature
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    // Use axiosInstance.post directly
    // Set Content-Type to null to remove default and let axios auto-detect FormData
    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null, // Remove default Content-Type to allow axios to set multipart/form-data
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string }>(
      '/admin/categories/create',
      data,
      { headers }
    );
    return response.data;
  }

  async updateCategory(data: FormData): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    // Use axiosInstance.post directly
    // Set Content-Type to null to remove default and let axios auto-detect FormData
    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null, // Remove default Content-Type to allow axios to set multipart/form-data
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string }>(
      '/admin/categories/update',
      data,
      { headers }
    );
    return response.data;
  }

  async deleteCategory(id: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/categories/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async addBannerToCategory(categoryId: string, bannerId: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { category_id: categoryId, banner_id: bannerId };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/categories/add-banner', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async removeBannerFromCategory(categoryId: string, bannerId: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { category_id: categoryId, banner_id: bannerId };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/categories/remove-banner', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getBanners(limit: number = 10, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      banners: Array<{
        id: string;
        title: string;
        image: string;
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        banners_returned: number;
        has_more: boolean;
        limit: number;
        next_cursor?: string | null;
        total_banners: number;
      };
      sorting: {
        sort_by: string;
        sort_order: string;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        banners: Array<{
          id: string;
          title: string;
          image: string;
          created_at: string;
          updated_at: string;
        }>;
        pagination: {
          banners_returned: number;
          has_more: boolean;
          limit: number;
          next_cursor?: string | null;
          total_banners: number;
        };
        sorting: {
          sort_by: string;
          sort_order: string;
        };
      };
    }>('/admin/banners', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async createBanner(data: FormData): Promise<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; created_at: string } }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; created_at: string } }>(
      '/admin/banners/create',
      data,
      { headers }
    );
    return response.data;
  }

  async updateBanner(data: FormData): Promise<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; created_at: string } }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; created_at: string } }>(
      '/admin/banners/update',
      data,
      { headers }
    );
    return response.data;
  }

  async deleteBanner(id: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/banners/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async searchBanners(name: string, limit: number = 10): Promise<{
    status: boolean;
    message: string;
    data?: {
      banners: Array<{
        id: string;
        title: string;
        image: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        banners: Array<{
          id: string;
          title: string;
          image: string;
          created_at: string;
          updated_at: string;
        }>;
      };
    }>('/admin/banners/search', {
      method: 'GET',
      params: {
        name,
        limit
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getBannersByCategory(categoryId: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      banners: Array<{
        id: string;
        title: string;
        image: string;
        banner_id: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        banners: Array<{
          id: string;
          title: string;
          image: string;
          banner_id: string;
          created_at: string;
          updated_at: string;
        }>;
      };
    }>('/admin/banners/by-category', {
      method: 'GET',
      params: {
        category_id: categoryId
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  // Prompts API
  async getPrompts(limit: number = 10, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      prompts: Array<{
        id: string;
        title: string;
        image: string;
        prompt: string;
        visible: boolean;
        created_at: string;
        updated_at: string;
      }>;
      pagination: {
        has_more: boolean;
        limit: number;
        next_cursor?: string;
        returned: number;
        total_prompts: number;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        prompts: Array<{
          id: string;
          title: string;
          image: string;
          prompt: string;
          visible: boolean;
          created_at: string;
          updated_at: string;
        }>;
        pagination: {
          has_more: boolean;
          limit: number;
          next_cursor?: string;
          returned: number;
          total_prompts: number;
        };
      };
    }>('/admin/prompts', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async createPrompt(data: FormData): Promise<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; prompt: string; visible: boolean; created_at: string } }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; prompt: string; visible: boolean; created_at: string } }>(
      '/admin/prompts/create',
      data,
      { headers }
    );
    return response.data;
  }

  async updatePrompt(data: FormData): Promise<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; prompt: string; visible: boolean; updated_at: string } }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{ status: boolean; message: string; data?: { id: string; title: string; image: string | null; prompt: string; visible: boolean; updated_at: string } }>(
      '/admin/prompts/update',
      data,
      { headers }
    );
    return response.data;
  }

  async getPromptDetail(id: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      id: string;
      title: string;
      image_url: string | null;
      prompts: string[];
      custom_prompt_1?: string;
      custom_prompt_2?: string;
      custom_prompt_3?: string;
      custom_prompt_4?: string;
      custom_prompt_product_1?: string;
      custom_prompt_product_2?: string;
      custom_prompt_product_3?: string;
      custom_prompt_product_4?: string;
      visible: boolean;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        id: string;
        title: string;
        image_url: string | null;
        prompts: string[];
        custom_prompt_1?: string;
        custom_prompt_2?: string;
        custom_prompt_3?: string;
        custom_prompt_4?: string;
        custom_prompt_product_1?: string;
        custom_prompt_product_2?: string;
        custom_prompt_product_3?: string;
        custom_prompt_product_4?: string;
        visible: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
    }>(`/admin/prompts/detail/${id}`, {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async deletePrompt(id: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/prompts/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async searchPrompts(name: string, limit: number = 10): Promise<{
    status: boolean;
    message: string;
    data?: {
      prompts: Array<{
        id: string;
        title: string;
        image: string;
        prompt: string;
        visible: boolean;
        created_at: string;
        updated_at: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        prompts: Array<{
          id: string;
          title: string;
          image: string;
          prompt: string;
          visible: boolean;
          created_at: string;
          updated_at: string;
        }>;
      };
    }>('/admin/prompts/search', {
      method: 'GET',
      params: {
        name,
        limit
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async addPromptToBanner(bannerId: string, promptId: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { banner_id: bannerId, prompt_id: promptId };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/banners/add-prompt', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async removePromptFromBanner(bannerId: string, promptId: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { banner_id: bannerId, prompt_id: promptId };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/banners/remove-prompt', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getPromptsByBanner(bannerId: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      prompts: Array<{
        id: string;
        title: string;
        image: string;
        prompt: string;
        prompt_id: string;
        visible: boolean;
        created_at: string;
        updated_at: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        prompts: Array<{
          id: string;
          title: string;
          image: string;
          prompt: string;
          prompt_id: string;
          visible: boolean;
          created_at: string;
          updated_at: string;
        }>;
      };
    }>('/admin/prompts/by-banner', {
      method: 'GET',
      params: {
        banner_id: bannerId
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getCreditHistory(userId: string, limit: number = 10, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      user: {
        id: string;
        email: string;
        name?: string;
        current_credits: number;
      };
      history: Array<{
        id: string;
        change: number;
        previous: number;
        new: number;
        reason: string;
        action_by: string;
        timestamp: string;
      }>;
      pagination: {
        has_more: boolean;
        limit: number;
        next_cursor?: string;
        returned: number;
        total_entries: number;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        user: {
          id: string;
          email: string;
          name?: string;
          current_credits: number;
        };
        history: Array<{
          id: string;
          change: number;
          previous: number;
          new: number;
          reason: string;
          action_by: string;
          timestamp: string;
        }>;
        pagination: {
          has_more: boolean;
          limit: number;
          next_cursor?: string;
          returned: number;
          total_entries: number;
        };
      };
    }>('/admin/credits/history', {
      method: 'GET',
      params: {
        user_id: userId,
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async generateImage(data: {
    user_id: string;
    style_id: string;
    user_prompt: string;
    modeling: boolean;
    type: string;
    total_image_generation: number;
    aspect_ratio: string;
    face_id: string;
    face_photo_base64: string;
    photos_base64: string[];
  }): Promise<{
    status: boolean;
    message: string;
    data?: {
      credits_required: number;
      job_id: string;
      status: string;
      user_credits: number;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        credits_required: number;
        job_id: string;
        status: string;
        user_credits: number;
      };
    }>('/generate-image', {
      method: 'POST',
      data: body,
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }

  async checkImageGenerationStatus(jobId: string): Promise<{
    status: boolean;
    data?: {
      completed_at: string | null;
      created_at: string;
      credits_deducted: number;
      credits_required: number;
      errors?: string[];
      failed_count: number;
      failed_images?: Array<{
        error: string;
        index: number;
        status: string;
      }>;
      job_id: string;
      started_at: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'error' | 'partial_success';
      status_message: string | null;
      success_count: number;
      total_requested: number;
      generated_images?: Array<{
        index: number;
        mime_type: string;
        path: string;
        status: string;
        url: string;
        id?: string;
        image_id?: string | null;
        gallery_image_id?: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        completed_at: string | null;
        created_at: string;
        credits_deducted: number;
        credits_required: number;
        errors?: string[];
        failed_count: number;
        failed_images?: Array<{
          error: string;
          index: number;
          status: string;
        }>;
        job_id: string;
        started_at: string;
        status: 'pending' | 'processing' | 'completed' | 'failed' | 'error' | 'partial_success';
        status_message: string | null;
        success_count: number;
        total_requested: number;
        generated_images?: Array<{
          index: number;
          mime_type: string;
          path: string;
          status: string;
          url: string;
          id?: string;
          image_id?: string | null;
          gallery_image_id?: string;
        }>;
      };
    }>(`/generate-image/status/${jobId}`, {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async generateVideo(data: {
    user_id: string;
    image_id: string;
    total_video_generation: number;
  }): Promise<{
    status: boolean;
    message: string;
    data?: {
      credits_required: number;
      image_source: string;
      job_id: string;
      source_image_id: string;
      status: string;
      user_credits: number;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    // Use axiosInstance.post directly to ensure proper handling
    const response = await this.axiosInstance.post<{
      status: boolean;
      message: string;
      data?: {
        credits_required: number;
        image_source: string;
        job_id: string;
        source_image_id: string;
        status: string;
        user_credits: number;
      };
    }>('/generate-video', JSON.parse(body), {
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  }

  async checkVideoGenerationStatus(jobId: string): Promise<{
    status: boolean;
    data?: {
      completed_at: string | null;
      created_at: string;
      credits_deducted: number;
      credits_required: number;
      errors?: string[];
      failed_count: number;
      failed_videos?: Array<{
        error: string;
        index: number;
        status: string;
      }>;
      job_id: string;
      started_at: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'error';
      status_message: string | null;
      success_count: number;
      total_requested: number;
      generated_videos?: Array<{
        index: number;
        mime_type: string;
        path: string;
        status: string;
        url: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        completed_at: string | null;
        created_at: string;
        credits_deducted: number;
        credits_required: number;
        errors?: string[];
        failed_count: number;
        failed_videos?: Array<{
          error: string;
          index: number;
          status: string;
        }>;
        job_id: string;
        started_at: string;
        status: 'pending' | 'processing' | 'completed' | 'failed' | 'error';
        status_message: string | null;
        success_count: number;
        total_requested: number;
        generated_videos?: Array<{
          index: number;
          mime_type: string;
          path: string;
          status: string;
          url: string;
        }>;
      };
    }>(`/generate-video/status/${jobId}`, {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  // Faces API
  async getFaces(limit: number = 10, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      faces: Array<{
        id: string;
        face_id: string;
        image_url: string;
        path: string;
        type?: string;
        created_at: string;
        updated_at?: string;
      }>;
      pagination: {
        faces_returned: number;
        has_more: boolean;
        limit: number;
        next_cursor?: string | null;
        total_faces: number;
      };
      sorting: {
        sort_by: string;
        sort_order: string;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        faces: Array<{
          id: string;
          face_id: string;
          image_url: string;
          path: string;
          type?: string;
          created_at: string;
          updated_at?: string;
        }>;
        pagination: {
          faces_returned: number;
          has_more: boolean;
          limit: number;
          next_cursor?: string | null;
          total_faces: number;
        };
        sorting: {
          sort_by: string;
          sort_order: string;
        };
      };
    }>('/admin/faces', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async createFace(data: FormData): Promise<{
    status: boolean;
    message: string;
    data?: {
      id: string;
      face_id: string;
      image_url: string;
      path: string;
      created_at: string;
    }
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{
      status: boolean;
      message: string;
      data?: {
        id: string;
        face_id: string;
        image_url: string;
        path: string;
        type?: string;
        created_at: string;
      }
    }>(
      '/admin/faces/create',
      data,
      { headers }
    );
    return response.data;
  }

  async updateFace(data: FormData): Promise<{
    status: boolean;
    message: string;
    data?: {
      id: string;
      face_id: string;
      image_url: string;
      path: string;
      updated_at: string;
    }
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{
      status: boolean;
      message: string;
      data?: {
        id: string;
        face_id: string;
        image_url: string;
        path: string;
        type?: string;
        updated_at: string;
      }
    }>(
      '/admin/faces/update',
      data,
      { headers }
    );
    return response.data;
  }

  async deleteFace(id: string): Promise<{ status: boolean; message: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{ status: boolean; message: string }>('/admin/faces/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  // User-facing APIs for AI Image Generator
  async getUserCategories(limit: number = 50): Promise<{
    status: boolean;
    data?: {
      categories: Array<{
        id: string;
        image: string;
        title: string;
      }>;
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        categories: Array<{
          id: string;
          image: string;
          title: string;
        }>;
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
      };
    }>('/user/categories', {
      method: 'GET',
      params: {
        limit
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getUserBanners(categoryId: string, limit: number = 50): Promise<{
    status: boolean;
    data?: {
      banners: Array<{
        id: string;
        image: string;
        title: string;
      }>;
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        banners: Array<{
          id: string;
          image: string;
          title: string;
        }>;
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
      };
    }>('/user/banners', {
      method: 'GET',
      params: {
        category_id: categoryId,
        limit
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getUserPrompts(bannerId: string, categoryId: string, limit: number = 50): Promise<{
    status: boolean;
    data?: {
      prompts: Array<{
        id: string;
        image: string;
        title: string;
      }>;
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        prompts: Array<{
          id: string;
          image: string;
          title: string;
        }>;
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
      };
    }>('/user/prompts', {
      method: 'GET',
      params: {
        banner_id: bannerId,
        category_id: categoryId,
        limit
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getUserFaces(limit: number = 50, cursor?: string): Promise<{
    status: boolean;
    data?: {
      faces: Array<{
        id: string;
        image: string;
        type?: string;
      }>;
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        faces: Array<{
          id: string;
          image: string;
          type?: string;
        }>;
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
      };
    }>('/user/faces', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async getUserGallery(userId: string, limit: number = 20, cursor?: string): Promise<{
    status: boolean;
    data?: {
      count: number;
      has_more: boolean;
      next_cursor: string | null;
      items: Array<{
        aspect_ratio?: string;
        count: number;
        job_id: string;
        type: string;
        items: Array<{
          id: string;
          url: string;
          path: string;
          date: string;
          type: string;
        }>;
      }>;
      pending_items: Array<any>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        count: number;
        has_more: boolean;
        next_cursor: string | null;
        items: Array<{
          aspect_ratio?: string;
          count: number;
          job_id: string;
          type: string;
          items: Array<{
            id: string;
            url: string;
            path: string;
            date: string;
            type: string;
          }>;
        }>;
        pending_items: Array<any>;
      };
    }>('/user/gallery', {
      method: 'GET',
      params: {
        user_id: userId,
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async deleteGalleryImages(userId: string, imageIds: string[]): Promise<{
    status: boolean;
    message?: string;
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({
      user_id: userId,
      ids: imageIds
    });
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message?: string;
    }>('/user/gallery/delete', {
      method: 'POST',
      data: body,
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }

  // Explorer APIs
  async addExplorer(data: FormData): Promise<{
    status: boolean;
    message: string;
    data?: {
      id: string;
      title: string;
      type: string;
      file_path: string;
      created_at: string;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    const headers: any = {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': null,
    };

    const response = await this.axiosInstance.post<{
      status: boolean;
      message: string;
      data?: {
        id: string;
        title: string;
        type: string;
        file_path: string;
        created_at: string;
      };
    }>('/admin/explorer/add', data, { headers });
    return response.data;
  }

  async getExplorer(limit: number = 20, cursor?: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      items: Array<{
        id: string;
        title: string;
        type: string;
        url: string;
        created_at: string;
      }>;
      pagination: {
        has_more: boolean;
        items_returned: number;
        limit: number;
        next_cursor: string | null;
        total_items: number;
      };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        items: Array<{
          id: string;
          title: string;
          type: string;
          url: string;
          created_at: string;
        }>;
        pagination: {
          has_more: boolean;
          items_returned: number;
          limit: number;
          next_cursor: string | null;
          total_items: number;
        };
      };
    }>('/user/explorer', {
      method: 'GET',
      params: {
        limit,
        cursor
      },
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  async deleteExplorer(id: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      id: string;
      title: string;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = { id };
    const body = JSON.stringify(data);
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        id: string;
        title: string;
      };
    }>('/admin/explorer/delete', {
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  // Create payment order for credit purchase
  async createPaymentOrder(userId: string, amount: number): Promise<{
    status: boolean;
    message: string;
    data?: {
      amount: number;
      base_amount: number;
      credits_to_add: number;
      gst_amount: number;
      gst_rate: number;
      orderId: string;
      paymentSessionId: string;
      status: boolean;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({
      user_id: userId,
      amount: amount
    });
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        amount: number;
        base_amount: number;
        credits_to_add: number;
        gst_amount: number;
        gst_rate: number;
        orderId: string;
        paymentSessionId: string;
        status: boolean;
      };
    }>('/payment/create-order', {
      method: 'POST',
      data: body,
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }

  // Get transaction history for a user
  async getTransactionHistory(userId: string, limit?: number, cursor?: string): Promise<{
    status: boolean;
    message?: string;
    data?: {
      status: boolean;
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
      transactions: Array<{
        id: string;
        order_id: string;
        cf_order_id: string;
        amount: number;
        base_amount: number | null;
        gst_amount: number | null;
        gst_rate: number;
        credits_to_add: number;
        credits_added: boolean;
        currency: string;
        order_status: string;
        status: string;
        created_at: string;
        updated_at: string;
        completed_at: string | null;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = '';
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    // Build query parameters
    const params = new URLSearchParams({ user_id: userId })
    params.append('limit', (limit || 10).toString())
    if (cursor) params.append('cursor', cursor)

    return this.request<{
      status: boolean;
      message?: string;
      data?: {
        status: boolean;
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
        transactions: Array<{
          id: string;
          order_id: string;
          cf_order_id: string;
          amount: number;
          base_amount: number | null;
          gst_amount: number | null;
          gst_rate: number;
          credits_to_add: number;
          credits_added: boolean;
          currency: string;
          order_status: string;
          status: string;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        }>;
      };
    }>(`/payment/transaction-history?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
      }
    });
  }

  // Verify pending orders for a user
  async verifyOrder(userId: string): Promise<{
    status: boolean;
    message: string;
    data?: {
      status: boolean;
      results: Array<{
        amount: number;
        base_amount: number;
        completed_at: string | null;
        created_at: string;
        credits_added: boolean;
        credits_to_add: number;
        gst_amount: number;
        gst_rate: number;
        order_id: string;
        order_status: string;
        status: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({
      user_id: userId
    });
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message: string;
      data?: {
        status: boolean;
        results: Array<{
          amount: number;
          base_amount: number;
          completed_at: string | null;
          created_at: string;
          credits_added: boolean;
          credits_to_add: number;
          gst_amount: number;
          gst_rate: number;
          order_id: string;
          order_status: string;
          status: string;
        }>;
      };
    }>('/payment/verify-order', {
      method: 'POST',
      data: body,
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }

  // Get dashboard stats
  async getDashboardStats(): Promise<{
    status: boolean;
    data?: {
        '24h': {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        '7d': {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        month: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        year: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        all: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      data?: {
        '24h': {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        '7d': {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        month: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        year: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
        all: {
          active_users: number;
          failed_generations: number;
          image_generations: number;
          new_users: number;
          revenue: {
            total_amount: number;
            total_base_amount: number;
            total_gst_amount: number;
            transaction_count: number;
          };
        };
      };
    }>('/admin/stats/dashboard', {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }

  // Get purchase history
  async getPurchaseHistory(limit: number = 50, cursor?: string): Promise<{
    status: boolean;
    message?: string;
    data?: {
      pagination: {
        count: number;
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
      };
      purchases: Array<{
        id: string;
        order_id: string;
        user_id: string;
        user_name: string;
        user_email: string;
        amount: number;
        base_amount: number;
        gst_amount: number;
        gst_rate: number;
        credits_added: number;
        created_at: string;
        completed_at: string;
      }>;
    };
  }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const queryParams = new URLSearchParams()
    queryParams.append('limit', limit.toString())
    if (cursor) {
      queryParams.append('cursor', cursor)
    }
    const body = "";
    const signature = generateSignature(SECRET_KEY, timestamp, body);

    return this.request<{
      status: boolean;
      message?: string;
      data?: {
        pagination: {
          count: number;
          has_more: boolean;
          limit: number;
          next_cursor: string | null;
        };
        purchases: Array<{
          id: string;
          order_id: string;
          user_id: string;
          user_name: string;
          user_email: string;
          amount: number;
          base_amount: number;
          gst_amount: number;
          gst_rate: number;
          credits_added: number;
          created_at: string;
          completed_at: string;
        }>;
      };
    }>(`/admin/stats/purchases?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json',
      }
    });
  }
}

export const apiService = new ApiService();
