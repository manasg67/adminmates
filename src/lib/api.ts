const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin-mates-backend.vercel.app';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'vendor' | 'company';
    gstNumber?: string;
    panCard?: string;
    companyLocation?: string;
  }
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved?: boolean;
  approvalStatus?: string;
  company?: {
    id: string;
    name: string;
    companyLocation?: string;
    gstNumber?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

type UserRole = 'admin' | 'vendor' | 'company';

const TOKEN_KEYS: Record<UserRole, string> = {
  admin: 'adminToken',
  vendor: 'vendorToken',
  company: 'companyToken',
};

const normalizeRole = (role?: string): UserRole | null => {
  if (!role) return null;
  const normalized = role.toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'vendor') return 'vendor';
  if (normalized === 'super-admin') return 'company';
  if (normalized === 'company-admin') return 'company';
  if (normalized === 'company-user') return 'company';
  if (normalized === 'user') return 'company';
  if (normalized === 'company') return 'company';
  return null;
};

// Store token in localStorage by role
export const setAuthToken = (token: string, role: UserRole) => {
  localStorage.setItem(TOKEN_KEYS[role], token);
};

// Get token from localStorage by role
export const getAuthToken = (role?: UserRole): string | null => {
  if (role) {
    return localStorage.getItem(TOKEN_KEYS[role]);
  }

  return (
    localStorage.getItem('vendorToken') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('companyToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token')
  );
};

// Remove token from localStorage
export const removeAuthToken = (role?: UserRole) => {
  if (role) {
    localStorage.removeItem(TOKEN_KEYS[role]);
    return;
  }

  localStorage.removeItem('vendorToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('companyToken');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
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
    const normalized = normalizeRole(data.data.user.role) || 'vendor';
    const role = normalized === 'admin' && data.data.user.company ? 'company' : normalized;
    setAuthToken(data.data.token, role);
    setUserData(data.data.user);
  }

  return data;
};

// Signup API - now accepts FormData for file upload
export const signup = async (userData: SignupRequest | FormData): Promise<AuthResponse> => {
  // Check if userData is FormData (has file upload)
  const isFormData = userData instanceof FormData;
  
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: isFormData ? {} : {
      'Content-Type': 'application/json',
    },
    body: isFormData ? userData : JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Signup failed' }));
    throw new Error(error.message || 'Signup failed');
  }

  const data: AuthResponse = await response.json();
  
  // Store token and user data
  if (data.success && data.data.token) {
    const normalized = normalizeRole(data.data.user.role) || 'vendor';
    const role = normalized === 'admin' && data.data.user.company ? 'company' : normalized;
    setAuthToken(data.data.token, role);
    setUserData(data.data.user);
  }

  return data;
};

// Forgot Password API
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send reset code' }));
    throw new Error(error.message || 'Failed to send reset code');
  }

  return await response.json();
};

// Reset Password API
export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reset password' }));
    throw new Error(error.message || 'Failed to reset password');
  }

  return await response.json();
};

// Get role-based dashboard path
export const getDashboardPath = (role: string): string => {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    case 'super-admin':
    case 'company-admin':
    case 'company-user':
    case 'user':
    case 'company':
    case 'companies':
      return '/companies/dashboard';
    default:
      return '/';
  }
};

// Helper function to get auth headers
const getAuthHeaders = (role?: UserRole) => {
  const resolvedRole = role || normalizeRole(getUserData()?.role) || undefined;
  const token = resolvedRole ? getAuthToken(resolvedRole) : getAuthToken();
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
    companies?: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    users?: {
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
    headers: getAuthHeaders('admin'),
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
  panCard?: string;
  companyLocation?: string;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
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

export interface CompaniesResponse {
  success: boolean;
  count: number;
  totalCompanies: number;
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

export interface CompanyUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  isApproved?: boolean;
  approvalStatus?: string;
  isActive?: boolean;
  monthlyLimit?: number;
  monthlySpent?: number;
  lastResetDate?: string;
  company?: {
    _id?: string;
    name: string;
    email?: string;
  };
  branch?: {
    _id?: string;
    branchName: string;
    location: string;
    approvalStatus?: string;
  };
  createdBy?: {
    _id?: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyUsersResponse {
  success: boolean;
  message?: string;
  data: CompanyUser[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  count?: number;
  totalUsers?: number;
  totalPages?: number;
  currentPage?: number;
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
    headers: getAuthHeaders('admin'),
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
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return await response.json();
};

// Get companies with filters
export const getCompanies = async (
  status?: 'pending' | 'approved' | 'rejected',
  page: number = 1,
  limit: number = 10
): Promise<CompaniesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/companies?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch companies' }));
    throw new Error(error.message || 'Failed to fetch companies');
  }

  return await response.json();
};

export const getCompanyUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role: string = 'company-admin'
): Promise<CompanyUsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  if (role) {
    params.append('role', role);
  }

  const response = await fetch(`${API_BASE_URL}/api/company/users?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch company users' }));
    throw new Error(error.message || 'Failed to fetch company users');
  }

  return await response.json();
};

export interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubAdminsResponse {
  success: boolean;
  message: string;
  data: {
    subAdmins: SubAdmin[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSubAdmins: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Get sub-admins
export const getSubAdmins = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<SubAdminsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/sub-admins?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch sub-admins' }));
    throw new Error(error.message || 'Failed to fetch sub-admins');
  }

  return await response.json();
};

// Approve user/vendor
export const approveUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/approve/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('admin'),
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
    headers: getAuthHeaders('admin'),
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
    headers: getAuthHeaders('admin'),
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
    headers: getAuthHeaders('admin'),
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

// Create company (onboarding)
export const createUser = async (data: { name: string; email: string; gstNumber: string; panCard: string; companyLocation: string }): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/create-company`, {
    method: 'POST',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create company' }));
    throw new Error(error.message || 'Failed to create company');
  }

  return await response.json();
};

export const createCompanyAdmin = async (data: { name: string; email: string }): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/company/create-admin`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create company admin' }));
    throw new Error(error.message || 'Failed to create company admin');
  }

  return await response.json();
};

export interface Branch {
  _id?: string;
  id?: string;
  branchName: string;
  location: string;
  branchAdminId?: string;
  branchAdmin?: {
    _id?: string;
    name: string;
    email: string;
  };
  company?: {
    _id?: string;
    name: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchesResponse {
  success: boolean;
  message?: string;
  data: Branch[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  totalBranches?: number;
  totalPages?: number;
  currentPage?: number;
}

export const createBranch = async (data: { branchName: string; location: string; branchAdminId: string }): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/branches/create`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create branch' }));
    throw new Error(error.message || 'Failed to create branch');
  }

  return await response.json();
};

export const getMyBranches = async (page: number = 1, limit: number = 10): Promise<BranchesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/branches/my-branches?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch branches' }));
    throw new Error(error.message || 'Failed to fetch branches');
  }

  return await response.json();
};

// Create vendor
export const createVendor = async (data: { name: string; email: string; gstNumber: string; panCard: string }): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/create-vendor`, {
    method: 'POST',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create vendor' }));
    throw new Error(error.message || 'Failed to create vendor');
  }

  return await response.json();
};

// Create sub-admin
export const createSubAdmin = async (data: { name: string; email: string }): Promise<{ success: boolean; message: string; data?: SubAdmin }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/create-sub-admin`, {
    method: 'POST',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create sub-admin' }));
    throw new Error(error.message || 'Failed to create sub-admin');
  }

  return await response.json();
};

// Toggle sub-admin status
export const toggleSubAdminStatus = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/toggle-status/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to toggle status' }));
    throw new Error(error.message || 'Failed to toggle status');
  }

  return await response.json();
};

// Get all branches with filters (admin)
export const getAllBranches = async (
  status?: 'pending' | 'approved' | 'rejected',
  page: number = 1,
  limit: number = 10
): Promise<BranchesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/branches?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch branches' }));
    throw new Error(error.message || 'Failed to fetch branches');
  }

  return await response.json();
};

// Approve branch
export const approveBranch = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/approve/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve branch' }));
    throw new Error(error.message || 'Failed to approve branch');
  }

  return await response.json();
};

// Reject branch
export const rejectBranch = async (id: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/reject/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject branch' }));
    throw new Error(error.message || 'Failed to reject branch');
  }

  return await response.json();
};

// Toggle branch status
export const toggleBranchStatus = async (branchId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/toggle-status/${branchId}`, {
    method: 'PUT',
    headers: getAuthHeaders('admin'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to toggle branch status' }));
    throw new Error(error.message || 'Failed to toggle branch status');
  }

  return await response.json();
};

// Create user for branch
export const createBranchUser = async (data: { name: string; email: string; branchId: string }): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/company/create-user`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create branch user' }));
    throw new Error(error.message || 'Failed to create branch user');
  }

  return await response.json();
};

// Get users by branch ID
export const getUsersByBranch = async (
  branchId: string,
  page: number = 1,
  limit: number = 10
): Promise<CompanyUsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    branchId: branchId,
  });

  const response = await fetch(`${API_BASE_URL}/api/company/users?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch branch users' }));
    throw new Error(error.message || 'Failed to fetch branch users');
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

// Category interfaces
export interface Category {
  _id: string;
  name: string;
  isActive: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  totalCategories: number;
  totalPages: number;
  currentPage: number;
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// SubCategory interfaces
export interface SubCategory {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  isActive: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SubCategoriesResponse {
  success: boolean;
  count: number;
  totalSubCategories: number;
  totalPages: number;
  currentPage: number;
  data: SubCategory[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Product interfaces
export interface ProductData {
  sku: string;
  brand: string;
  productName: string;
  description: string;
  price: number;
  weight: {
    value: number;
    unit: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  color: string;
  material: string;
  packSize: string;
  uom: string;
  gstSlab: number;
  hsnCode: string;
  categoryId: string;
  subCategoryId: string;
  images: File[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Create category (admin only)
export const createCategory = async (name: string): Promise<{ success: boolean; message: string; data?: Category }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create category' }));
    throw new Error(error.message || 'Failed to create category');
  }

  return await response.json();
};

// Get all categories (any user role)
export const getCategories = async (
  page: number = 1,
  limit: number = 10
): Promise<CategoriesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/admin/categories?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch categories' }));
    throw new Error(error.message || 'Failed to fetch categories');
  }

  return await response.json();
};

// Create subcategory (admin only)
export const createSubCategory = async (
  name: string,
  categoryId: string
): Promise<{ success: boolean; message: string; data?: SubCategory }> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/sub-categories`, {
    method: 'POST',
    headers: getAuthHeaders('admin'),
    body: JSON.stringify({ name, categoryId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create subcategory' }));
    throw new Error(error.message || 'Failed to create subcategory');
  }

  return await response.json();
};

// Get all subcategories (any user role)
export const getSubCategories = async (
  categoryId?: string,
  page: number = 1,
  limit: number = 10
): Promise<SubCategoriesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) {
    params.append('categoryId', categoryId);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/sub-categories?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch subcategories' }));
    throw new Error(error.message || 'Failed to fetch subcategories');
  }

  return await response.json();
};

// Create product
export const createProduct = async (productData: ProductData): Promise<ProductResponse> => {
  const token = getAuthToken('vendor');
  
  const formData = new FormData();
  formData.append('sku', productData.sku);
  formData.append('brand', productData.brand);
  formData.append('productName', productData.productName);
  formData.append('description', productData.description);
  formData.append('price', productData.price.toString());
  formData.append('weight', JSON.stringify(productData.weight));
  formData.append('dimensions', JSON.stringify(productData.dimensions));
  formData.append('color', productData.color);
  formData.append('material', productData.material);
  formData.append('packSize', productData.packSize);
  formData.append('uom', productData.uom);
  formData.append('gstSlab', productData.gstSlab.toString());
  formData.append('hsnCode', productData.hsnCode);
  formData.append('categoryId', productData.categoryId);
  formData.append('subCategoryId', productData.subCategoryId);
  
  // Append images
  productData.images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create product' }));
    throw new Error(error.message || 'Failed to create product');
  }

  return await response.json();
};

// Product interfaces for listing
export interface VendorInfo {
  _id: string;
  name: string;
  email: string;
  gstNumber: string;
  vendorLocation?: string;
  companyLocation?: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  _id: string;
}

export interface Product {
  _id: string;
  vendor: VendorInfo;
  sku: string;
  brand: string;
  productName: string;
  description: string;
  vendorPrice?: number;
  adminCut?: number;
  price: number;
  weight: {
    value: number;
    unit: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  color: string;
  material: string;
  packSize: string;
  uom: string;
  gstSlab: number;
  hsnCode: string;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    name: string;
  };
  categoryId?: string;
  subCategoryId?: string;
  categories?: string[];
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Get products with filters
export const getProducts = async (
  filters?: {
    status?: string;
    approvalStatus?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  },
  page: number = 1,
  limit: number = 10,
  role?: 'vendor' | 'admin'
): Promise<ProductsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) params.append('status', filters.status);
  if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.brand) params.append('brand', filters.brand);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.search) params.append('search', filters.search);

  const token = role ? getAuthToken(role) : getAuthToken('vendor');
  const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, {
    method: 'GET',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
    throw new Error(error.message || 'Failed to fetch products');
  }

  return await response.json();
};

// Get single product by ID
export const getProductById = async (productId: string): Promise<{ success: boolean; data: Product }> => {
  const token = getAuthToken('vendor');
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'GET',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch product' }));
    throw new Error(error.message || 'Failed to fetch product');
  }

  return await response.json();
};

// Update product
export const updateProduct = async (productId: string, productData: Partial<ProductData> & { description?: string; price?: number }): Promise<ProductResponse> => {
  const token = getAuthToken('vendor');
  
  const formData = new FormData();
  
  if (productData.sku) formData.append('sku', productData.sku);
  if (productData.brand) formData.append('brand', productData.brand);
  if (productData.productName) formData.append('productName', productData.productName);
  if (productData.description) formData.append('description', productData.description);
  if (productData.price) formData.append('price', productData.price.toString());
  if (productData.weight) formData.append('weight', JSON.stringify(productData.weight));
  if (productData.dimensions) formData.append('dimensions', JSON.stringify(productData.dimensions));
  if (productData.color) formData.append('color', productData.color);
  if (productData.material) formData.append('material', productData.material);
  if (productData.packSize) formData.append('packSize', productData.packSize);
  if (productData.uom) formData.append('uom', productData.uom);
  if (productData.gstSlab) formData.append('gstSlab', productData.gstSlab.toString());
  if (productData.hsnCode) formData.append('hsnCode', productData.hsnCode);
  if (productData.categoryId) formData.append('categoryId', productData.categoryId);
  if (productData.subCategoryId) formData.append('subCategoryId', productData.subCategoryId);
  
  // Append images only if they are new files (not URLs)
  if (productData.images && Array.isArray(productData.images)) {
    productData.images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update product' }));
    throw new Error(error.message || 'Failed to update product');
  }

  return await response.json();
};

// Delete Product
export const deleteProduct = async (productId: string): Promise<{ success: boolean; message: string }> => {
  const token = getAuthToken('vendor');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete product' }));
    throw new Error(error.message || 'Failed to delete product');
  }

  return await response.json();
};

// Toggle Product Status
export const toggleProductStatus = async (productId: string): Promise<{ 
  success: boolean; 
  message: string; 
  data: { id: string; productName: string; status: string } 
}> => {
  const token = getAuthToken('vendor');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/toggle-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to toggle product status' }));
    throw new Error(error.message || 'Failed to toggle product status');
  }

  return await response.json();
};

// Approve Product (Admin only)
export const approveProduct = async (productId: string, adminCut?: number): Promise<{ success: boolean; message: string; data?: any }> => {
  const token = getAuthToken('admin');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({
      ...(adminCut !== undefined && { adminCut }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve product' }));
    throw new Error(error.message || 'Failed to approve product');
  }

  return await response.json();
};

// Reject Product (Admin only)
export const rejectProduct = async (productId: string, reason: string): Promise<{ success: boolean; message: string; data?: any }> => {
  const token = getAuthToken('admin');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject product' }));
    throw new Error(error.message || 'Failed to reject product');
  }

  return await response.json();
};

// Vendor Stats Interface
export interface VendorStatsResponse {
  success: boolean;
  userRole: string;
  stats: {
    totalProducts: number;
    approved: number;
    pending: number;
    rejected: number;
    active: number;
    inactive: number;
  };
  data: Product[];
}

// Get Vendor Stats
export const getVendorStats = async (): Promise<VendorStatsResponse> => {
  const token = getAuthToken('vendor');

  const response = await fetch(`${API_BASE_URL}/api/products/admin/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vendor stats' }));
    throw new Error(error.message || 'Failed to fetch vendor stats');
  }

  return await response.json();
};

// ===== MONTHLY LIMIT MANAGEMENT =====

export interface MonthlyLimitData {
  name: string;
  email: string;
  role: string;
  monthlyLimit: number | null;
  monthlySpent: number;
  remainingLimit: number | null;
  lastResetDate: string;
  hasUnlimitedAccess?: boolean;
}

export interface MyLimitResponse {
  success: boolean;
  data: MonthlyLimitData;
}

export interface UserLimitResponse {
  success: boolean;
  data: MonthlyLimitData;
}

export interface SetLimitResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      monthlyLimit: number;
      monthlySpent: number;
    };
  };
}

// Get current user's monthly limit
export const getMyLimit = async (): Promise<MyLimitResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/company/my-limit`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch monthly limit' }));
    throw new Error(error.message || 'Failed to fetch monthly limit');
  }

  return await response.json();
};

// Get user's monthly limit by ID
export const getUserLimit = async (userId: string): Promise<UserLimitResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/company/users/${userId}/limit`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user limit' }));
    throw new Error(error.message || 'Failed to fetch user limit');
  }

  return await response.json();
};

// Set monthly limit for a user
export const setUserLimit = async (userId: string, monthlyLimit: number): Promise<SetLimitResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/company/users/${userId}/set-limit`, {
    method: 'PUT',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({ monthlyLimit }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to set monthly limit' }));
    throw new Error(error.message || 'Failed to set monthly limit');
  }

  return await response.json();
};

// ===== CART MANAGEMENT =====

export interface CartProduct {
  _id: string;
  productName: string;
  sku: string;
  brand: string;
  price: number;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    name: string;
  };
  status: string;
  approvalStatus: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  price: number;
  addedAt: string;
  _id: string;
}

export interface CartData {
  _id: string;
  user: string;
  company: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: CartData;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  action: 'increment' | 'decrement' | 'set';
  quantity?: number;
}

// Get cart
export const getCart = async (): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch cart' }));
    throw new Error(error.message || 'Failed to fetch cart');
  }

  return await response.json();
};

// Add product to cart
export const addToCart = async (productId: string, quantity?: number): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({
      productId,
      ...(quantity && { quantity }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add product to cart' }));
    throw new Error(error.message || 'Failed to add product to cart');
  }

  return await response.json();
};

// Update cart item quantity
export const updateCartItem = async (productId: string, action: 'increment' | 'decrement' | 'set', quantity?: number): Promise<CartResponse> => {
  const body: UpdateCartItemRequest = { action };
  if (action === 'set' && quantity !== undefined) {
    body.quantity = quantity;
  }

  const response = await fetch(`${API_BASE_URL}/api/cart/update/${productId}`, {
    method: 'PATCH',
    headers: getAuthHeaders('company'),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update cart' }));
    throw new Error(error.message || 'Failed to update cart');
  }

  return await response.json();
};

// Remove product from cart
export const removeFromCart = async (productId: string): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/cart/remove/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove product from cart' }));
    throw new Error(error.message || 'Failed to remove product from cart');
  }

  return await response.json();
};

// Clear cart
export const clearCart = async (): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
    method: 'DELETE',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to clear cart' }));
    throw new Error(error.message || 'Failed to clear cart');
  }

  return await response.json();
};

// ===== ORDER MANAGEMENT =====

export interface OrderItem {
  product: string | CartProduct;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  _id?: string;
}

export interface OrderData {
  _id: string;
  orderNumber: string;
  company: {
    _id: string;
    name: string;
    email?: string;
  };
  orderedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  orderPlacedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  wasEscalated: boolean;
  escalationDetails?: {
    escalatedFrom: string;
    escalatedTo: string;
    escalationLevel: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LimitInfo {
  previousSpent: number;
  currentOrder: number;
  newTotalSpent: number;
  monthlyLimit: number;
  remainingLimit: number;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
  limitInfo?: LimitInfo;
  needsEscalation?: boolean;
  needsLimitSetup?: boolean;
  escalationInfo?: {
    canEscalateTo: string;
    escalateEndpoint: string;
  };
}

export interface OrdersListResponse {
  success: boolean;
  count: number;
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  data: OrderData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  data: OrderData;
}

// Place order
export const placeOrder = async (notes?: string): Promise<PlaceOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({
      ...(notes && { notes }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to place order' }));
    throw new Error(error.message || 'Failed to place order');
  }

  return await response.json();
};

// Get all orders
export const getAllOrders = async (
  filters?: {
    status?: string;
  },
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<OrdersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch orders' }));
    throw new Error(error.message || 'Failed to fetch orders');
  }

  return await response.json();
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<OrderDetailsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch order' }));
    throw new Error(error.message || 'Failed to fetch order');
  }

  return await response.json();
};

// ===== ORDER ESCALATION =====

export interface EscalationItem {
  product: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
  _id?: string;
}

export interface RequesterLimit {
  monthlyLimit: number;
  monthlySpent: number;
  remainingLimit: number;
}

export interface EscalationData {
  _id: string;
  escalationNumber: string;
  company: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  escalationType: 'user-to-admin' | 'admin-to-superadmin';
  items: EscalationItem[];
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestReason: string;
  requesterLimit: RequesterLimit;
  responseMessage?: string;
  respondedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEscalationResponse {
  success: boolean;
  message: string;
  data: EscalationData;
}

export interface EscalationsListResponse {
  success: boolean;
  count: number;
  totalEscalations: number;
  totalPages: number;
  currentPage: number;
  data: EscalationData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApproveEscalationResponse {
  success: boolean;
  message: string;
  data: {
    escalation: EscalationData;
    order: OrderData;
  };
  limitInfo?: LimitInfo;
  needsEscalation?: boolean;
  escalationInfo?: {
    canEscalateTo: string;
    currentEscalation: string;
  };
}

export interface RejectEscalationResponse {
  success: boolean;
  message: string;
  data: EscalationData;
}

// Create escalation
export const createEscalation = async (reason: string): Promise<CreateEscalationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/escalate`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create escalation' }));
    throw new Error(error.message || 'Failed to create escalation');
  }

  return await response.json();
};

// Get received escalations (for admins)
export const getReceivedEscalations = async (
  filters?: {
    status?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<EscalationsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/escalations/received?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch escalations' }));
    throw new Error(error.message || 'Failed to fetch escalations');
  }

  return await response.json();
};

// Get sent escalations
export const getSentEscalations = async (
  filters?: {
    status?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<EscalationsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/escalations/sent?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch escalations' }));
    throw new Error(error.message || 'Failed to fetch escalations');
  }

  return await response.json();
};

// Approve escalation
export const approveEscalation = async (escalationId: string, responseMessage?: string): Promise<ApproveEscalationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/escalations/${escalationId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({
      ...(responseMessage && { responseMessage }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve escalation' }));
    throw new Error(error.message || 'Failed to approve escalation');
  }

  return await response.json();
};

// Reject escalation
export const rejectEscalation = async (escalationId: string, responseMessage: string): Promise<RejectEscalationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/escalations/${escalationId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({ responseMessage }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject escalation' }));
    throw new Error(error.message || 'Failed to reject escalation');
  }

  return await response.json();
};
