const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin-mates-backend.onrender.com';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'vendor' | 'company';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved?: boolean;
  approvalStatus?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Store token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Store user data in localStorage
export const setUserData = (user: User) => {
  localStorage.setItem('userData', JSON.stringify(user));
};

// Get user data from localStorage
export const getUserData = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Remove user data from localStorage
export const removeUserData = () => {
  localStorage.removeItem('userData');
};

// Login API
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  
  // Store token and user data
  if (data.success && data.data.token) {
    setAuthToken(data.data.token);
    setUserData(data.data.user);
  }

  return data;
};

// Signup API
export const signup = async (userData: SignupRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Signup failed' }));
    throw new Error(error.message || 'Signup failed');
  }

  const data: AuthResponse = await response.json();
  
  // Store token and user data
  if (data.success && data.data.token) {
    setAuthToken(data.data.token);
    setUserData(data.data.user);
  }

  return data;
};

// Get role-based dashboard path
export const getDashboardPath = (role: string): string => {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    case 'company':
    case 'companies':
      return '/companies/dashboard';
    default:
      return '/';
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Stats API Response
export interface StatsResponse {
  success: boolean;
  data: {
    vendors: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    users: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    admins: {
      total: number;
    };
  };
}

// Get stats
export const getStats = async (): Promise<StatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch stats' }));
    throw new Error(error.message || 'Failed to fetch stats');
  }

  return await response.json();
};

// Vendor/User data interface
export interface VendorUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  gstNumber?: string;
  aadharNumber?: string;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorsResponse {
  success: boolean;
  count: number;
  totalVendors: number;
  totalPages: number;
  currentPage: number;
  data: VendorUser[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UsersResponse {
  success: boolean;
  count: number;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  data: VendorUser[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Get vendors with filters
export const getVendors = async (
  status?: 'pending' | 'approved' | 'rejected',
  page: number = 1,
  limit: number = 10
): Promise<VendorsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/vendors?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vendors' }));
    throw new Error(error.message || 'Failed to fetch vendors');
  }

  return await response.json();
};

// Get users/companies with filters
export const getUsers = async (
  status?: 'pending' | 'approved' | 'rejected',
  page: number = 1,
  limit: number = 10
): Promise<UsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/users?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return await response.json();
};

// Approve user/vendor
export const approveUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/approve/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve' }));
    throw new Error(error.message || 'Failed to approve');
  }

  return await response.json();
};

// Reject user/vendor
export const rejectUser = async (id: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reject/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject' }));
    throw new Error(error.message || 'Failed to reject');
  }

  return await response.json();
};

// Bulk approve users/vendors
export const bulkApprove = async (userIds: string[]): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/bulk-approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to bulk approve' }));
    throw new Error(error.message || 'Failed to bulk approve');
  }

  return await response.json();
};

// Bulk reject users/vendors
export const bulkReject = async (userIds: string[], reason?: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/bulk-reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      userIds,
      reason: reason || 'Rejected by admin'
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to bulk reject' }));
    throw new Error(error.message || 'Failed to bulk reject');
  }

  return await response.json();
};

// Get current user profile
export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isApproved: boolean;
      approvalStatus: string;
    };
  };
}

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return await response.json();
};

// Format date to relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};
