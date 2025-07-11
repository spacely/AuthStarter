// AuthStarter API Client
// This client communicates with the AuthStarter backend API

export interface App {
  id: string
  name: string
  domain: string
  apiKey: string
  createdAt: string
  userCount?: number
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  emailVerified: boolean
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterAppResponse {
  app: App
}

export interface AppsListResponse {
  apps: App[]
}

export interface UsersListResponse {
  users: User[]
}

export interface AppStatsResponse {
  totalUsers: number
  totalApps: number
  totalApiCalls: number
  recentUsers: User[]
  recentApps: App[]
}

class AuthStarterClient {
  private baseUrl: string
  private apiKey: string | null = null
  private token: string | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authstarter_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add API key if available
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Service-level authentication (for dashboard users)
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/service/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authstarter_token', response.data.token)
      }
      return response.data
    }

    throw new Error(response.message || 'Login failed')
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/service/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authstarter_token', response.data.token)
      }
      return response.data
    }

    throw new Error(response.message || 'Registration failed')
  }

  async logout(): Promise<void> {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authstarter_token')
    }
  }

  // App management
  async createApp(name: string, domain: string): Promise<App> {
    const response = await this.request<RegisterAppResponse>('/api/apps/register', {
      method: 'POST',
      body: JSON.stringify({ name, domain }),
    })

    if (response.success && response.data) {
      return response.data.app
    }

    throw new Error(response.message || 'Failed to create app')
  }

  async getApps(): Promise<App[]> {
    const response = await this.request<AppsListResponse>('/api/service/apps')

    if (response.success && response.data) {
      return response.data.apps
    }

    throw new Error(response.message || 'Failed to fetch apps')
  }

  async getApp(appId: string): Promise<App> {
    const response = await this.request<{ app: App }>(`/api/service/apps/${appId}`)

    if (response.success && response.data) {
      return response.data.app
    }

    throw new Error(response.message || 'Failed to fetch app')
  }

  async deleteApp(appId: string): Promise<void> {
    const response = await this.request(`/api/service/apps/${appId}`, {
      method: 'DELETE',
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete app')
    }
  }

  // User management for specific app
  async getAppUsers(appId: string): Promise<User[]> {
    const response = await this.request<UsersListResponse>(`/api/service/apps/${appId}/users`)

    if (response.success && response.data) {
      return response.data.users
    }

    throw new Error(response.message || 'Failed to fetch users')
  }

  async deleteAppUser(appId: string, userId: string): Promise<void> {
    const response = await this.request(`/api/service/apps/${appId}/users/${userId}`, {
      method: 'DELETE',
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user')
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<AppStatsResponse> {
    const response = await this.request<AppStatsResponse>('/api/service/stats')

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to fetch dashboard stats')
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.request<{ status: string; message: string }>('/health')

    if (response.success && response.data) {
      return response.data
    }

    throw new Error('Health check failed')
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authstarter_token', token)
    }
  }
}

export const authClient = new AuthStarterClient()
export default authClient