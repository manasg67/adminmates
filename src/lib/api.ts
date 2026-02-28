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
  if (normalized === 'sub-admin') return 'admin';
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
    case 'sub-admin':
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
export const getStats = async (role?: UserRole): Promise<StatsResponse> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/auth/stats`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
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
  limit: number = 10,
  role?: UserRole
): Promise<VendorsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/auth/vendors?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
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
  limit: number = 10,
  role?: UserRole
): Promise<UsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/auth/users?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
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
  limit: number = 10,
  role?: UserRole
): Promise<CompaniesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/auth/companies?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
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
  search?: string,
  role?: UserRole
): Promise<SubAdminsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/admin/sub-admins?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch sub-admins' }));
    throw new Error(error.message || 'Failed to fetch sub-admins');
  }

  return await response.json();
};

// Approve user/vendor
export const approveUser = async (id: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/auth/approve/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve' }));
    throw new Error(error.message || 'Failed to approve');
  }

  return await response.json();
};

// Reject user/vendor
export const rejectUser = async (id: string, reason?: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/auth/reject/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject' }));
    throw new Error(error.message || 'Failed to reject');
  }

  return await response.json();
};

// Bulk approve users/vendors
export const bulkApprove = async (userIds: string[], role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/auth/bulk-approve`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify({ userIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to bulk approve' }));
    throw new Error(error.message || 'Failed to bulk approve');
  }

  return await response.json();
};

// Bulk reject users/vendors
export const bulkReject = async (userIds: string[], reason?: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/auth/bulk-reject`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
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
export const createUser = async (data: { name: string; email: string; gstNumber: string; panCard: string; companyLocation: string } | FormData, role?: UserRole): Promise<{ success: boolean; message: string; data?: any }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const baseHeaders = getAuthHeaders(userRole);
  
  // If data is FormData, only include Authorization header
  const headers: Record<string, string> = data instanceof FormData 
    ? { ...(baseHeaders['Authorization'] && { 'Authorization': baseHeaders['Authorization'] }) }
    : baseHeaders as Record<string, string>;

  const response = await fetch(`${API_BASE_URL}/api/admin/create-company`, {
    method: 'POST',
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create company' }));
    throw new Error(error.message || 'Failed to create company');
  }

  return await response.json();
};

export const createCompanyAdmin = async (data: { name: string; email: string; branchId?: string }): Promise<{ success: boolean; message: string; data?: any }> => {
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
export const createVendor = async (data: { name: string; email: string; gstNumber: string; panCard: string } | FormData, role?: UserRole): Promise<{ success: boolean; message: string; data?: any }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const baseHeaders = getAuthHeaders(userRole);
  
  // If data is FormData, only include Authorization header
  const headers: Record<string, string> = data instanceof FormData 
    ? { ...(baseHeaders['Authorization'] && { 'Authorization': baseHeaders['Authorization'] }) }
    : baseHeaders as Record<string, string>;

  const response = await fetch(`${API_BASE_URL}/api/admin/create-vendor`, {
    method: 'POST',
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create vendor' }));
    throw new Error(error.message || 'Failed to create vendor');
  }

  return await response.json();
};

// Create sub-admin
export const createSubAdmin = async (data: { name: string; email: string }, role?: UserRole): Promise<{ success: boolean; message: string; data?: SubAdmin }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/create-sub-admin`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create sub-admin' }));
    throw new Error(error.message || 'Failed to create sub-admin');
  }

  return await response.json();
};

// Toggle sub-admin status
export const toggleSubAdminStatus = async (id: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/toggle-status/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
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
  limit: number = 10,
  role?: UserRole
): Promise<BranchesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/admin/branches?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch branches' }));
    throw new Error(error.message || 'Failed to fetch branches');
  }

  return await response.json();
};

// Approve branch
export const approveBranch = async (id: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/approve/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve branch' }));
    throw new Error(error.message || 'Failed to approve branch');
  }

  return await response.json();
};

// Reject branch
export const rejectBranch = async (id: string, reason?: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/reject/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject branch' }));
    throw new Error(error.message || 'Failed to reject branch');
  }

  return await response.json();
};

// Toggle branch status
export const toggleBranchStatus = async (branchId: string, role?: UserRole): Promise<{ success: boolean; message: string }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/branches/toggle-status/${branchId}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
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
export const createCategory = async (name: string, role?: UserRole): Promise<{ success: boolean; message: string; data?: Category }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
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
  categoryId: string,
  role?: UserRole
): Promise<{ success: boolean; message: string; data?: SubCategory }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/sub-categories`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
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
  product?: string | CartProduct | {
    _id?: string;
    name?: string;
  };
  productName?: string;
  name?: string;
  sku?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  totalPrice: number;
  _id?: string;
}

export interface OrderData {
  _id: string;
  id?: string; // Alias for _id
  orderNumber: string;
  company: {
    _id: string;
    name: string;
    email?: string;
  };
  vendor?: {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
  };
  branch?: {
    _id?: string;
    id?: string;
    name?: string;
    branchName?: string;
    location?: string;
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
  payment?: {
    razorpayOrderId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    amount: number;
    paymentId?: string;
    signature?: string;
  };
  deliveryPartner?: {
    _id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    rating?: number;
  };
  deliveryStatus?: 'not-assigned' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
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

export interface RazorpayOrderData {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: OrderData;
  };
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
  sortOrder: 'asc' | 'desc' = 'desc',
  role?: UserRole
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

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
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

// Vendor approve order
export interface VendorApproveOrderRequest {
  notes?: string;
}

export interface VendorApproveOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

export const approveVendorOrder = async (
  orderId: string,
  notes?: string
): Promise<VendorApproveOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/vendor/${orderId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders('vendor'),
    body: JSON.stringify({
      ...(notes && { notes }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve order' }));
    throw new Error(error.message || 'Failed to approve order');
  }

  return await response.json();
};

// Vendor reject order
export interface VendorRejectOrderRequest {
  notes: string;
}

export interface VendorRejectOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

export const rejectVendorOrder = async (
  orderId: string,
  notes: string
): Promise<VendorRejectOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/vendor/${orderId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders('vendor'),
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reject order' }));
    throw new Error(error.message || 'Failed to reject order');
  }

  return await response.json();
};

// Update order status (Vendor can approve orders)
export const updateOrder = async (orderId: string, updates: { status?: string; notes?: string }, role?: UserRole): Promise<{ success: boolean; data: OrderData }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'vendor';
  
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update order' }));
    throw new Error(error.message || 'Failed to update order');
  }

  return await response.json();
};

// Verify payment
export interface VerifyOrderPaymentResponse {
  success: boolean;
  message: string;
  data: {
    order: OrderData;
    paymentVerified: boolean;
  };
}

export const verifyPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  orderId: string
): Promise<VerifyOrderPaymentResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/verify-payment`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment verification failed' }));
    throw new Error(error.message || 'Payment verification failed');
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

// ===== DELIVERY PARTNERS =====

export interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  vehicleType: 'bike' | 'car' | 'van' | 'truck';
  vehicleNumber: string;
  drivingLicense: string;
  address: string;
  isActive: boolean;
  totalDeliveries: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartnersResponse {
  success: boolean;
  count: number;
  totalPartners: number;
  totalPages: number;
  currentPage: number;
  data: DeliveryPartner[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateDeliveryPartnerRequest {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  vehicleType: 'bike' | 'car' | 'van' | 'truck';
  vehicleNumber: string;
  drivingLicense: string;
  address: string;
}

// Create delivery partner
export const createDeliveryPartner = async (data: CreateDeliveryPartnerRequest, role?: UserRole): Promise<{ success: boolean; data: DeliveryPartner }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create delivery partner' }));
    throw new Error(error.message || 'Failed to create delivery partner');
  }

  return await response.json();
};

// Get all delivery partners
export const getAllDeliveryPartners = async (
  page: number = 1,
  limit: number = 10,
  filters?: { isActive?: boolean; vehicleType?: string }
): Promise<DeliveryPartnersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.isActive !== undefined) {
    params.append('isActive', filters.isActive.toString());
  }
  if (filters?.vehicleType) {
    params.append('vehicleType', filters.vehicleType);
  }

  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/delivery-partners?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch delivery partners' }));
    throw new Error(error.message || 'Failed to fetch delivery partners');
  }

  return await response.json();
};

// Get delivery partner by ID
export const getDeliveryPartnerById = async (partnerId: string, role?: UserRole): Promise<{ success: boolean; data: DeliveryPartner }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/${partnerId}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch delivery partner' }));
    throw new Error(error.message || 'Failed to fetch delivery partner');
  }

  return await response.json();
};

// Update delivery partner
export const updateDeliveryPartner = async (
  partnerId: string,
  data: Partial<CreateDeliveryPartnerRequest> & { isActive?: boolean; rating?: number },
  role?: UserRole
): Promise<{ success: boolean; data: DeliveryPartner }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/${partnerId}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update delivery partner' }));
    throw new Error(error.message || 'Failed to update delivery partner');
  }

  return await response.json();
};

// Delete delivery partner
export const deleteDeliveryPartner = async (partnerId: string, role?: UserRole): Promise<{ success: boolean }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/${partnerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete delivery partner' }));
    throw new Error(error.message || 'Failed to delete delivery partner');
  }

  return await response.json();
};

// Assign delivery partner to order
// Assign delivery partner to order
// NOTE: Backend must verify:
// 1. Invoice exists for this order
// 2. invoice.payment.paymentStatus === "completed"
// 3. Delivery partner is active
export const assignDeliveryPartner = async (orderId: string, deliveryPartnerId: string, role?: UserRole): Promise<{ success: boolean; data: OrderData }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/assign/${orderId}`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify({ deliveryPartnerId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to assign delivery partner' }));
    throw new Error(error.message || 'Failed to assign delivery partner');
  }

  return await response.json();
};

// Remove delivery partner from order
export const removeDeliveryPartner = async (orderId: string, role?: UserRole): Promise<{ success: boolean; data: OrderData }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/assign/${orderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove delivery partner' }));
    throw new Error(error.message || 'Failed to remove delivery partner');
  }

  return await response.json();
};

// Get orders assigned to delivery partner
export const getDeliveryPartnerOrders = async (
  partnerId: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  role?: UserRole
): Promise<OrdersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/delivery-partners/${partnerId}/orders?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch delivery partner orders' }));
    throw new Error(error.message || 'Failed to fetch delivery partner orders');
  }

  return await response.json();
};

// ===== ADMIN DASHBOARD =====

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalVendors: number;
    totalBranches: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalDeliveryPartners: number;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byApprovalStatus: Record<string, number>;
    recentRegistrations: Record<string, number>;
  };
  companyUsers: {
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  };
  branches: {
    total: number;
    byApprovalStatus: Record<string, number>;
    byStatus: Record<string, number>;
    recentBranches: Record<string, number>;
  };
  products: {
    total: number;
    byApprovalStatus: Record<string, number>;
    byStatus: Record<string, number>;
    recentProducts: Record<string, number>;
  };
  categories: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    totalSubCategories: number;
    activeSubCategories: number;
    inactiveSubCategories: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    recentOrders: Record<string, number>;
    withDeliveryPartner: number;
    withoutDeliveryPartner: number;
  };
  financial: {
    totalRevenue: number;
    averageOrderValue: number;
    completedOrdersCount: number;
    revenueByPeriod: Record<string, number>;
    pendingPaymentsValue: number;
  };
  deliveryPartners: {
    total: number;
    active: number;
    inactive: number;
    byVehicleType: Record<string, number>;
    totalDeliveries: number;
    averageRating: number;
  };
  carts: {
    totalCarts: number;
    activeCarts: number;
    emptyCarts: number;
    totalItemsInCarts: number;
  };
  topPerformers: {
    vendors: Array<{ vendorId: string; vendorName: string; vendorEmail: string; productCount: number }>;
    companies: Array<{ companyId: string; companyName: string; companyEmail: string; orderCount: number; totalSpent: number }>;
    deliveryPartners: DeliveryPartner[];
  };
  recentActivities: {
    orders: OrderData[];
    users: any[];
  };
  generatedAt: string;
}

// Get admin dashboard
export const getAdminDashboard = async (role?: UserRole): Promise<{ success: boolean; data: AdminDashboard }> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard' }));
    throw new Error(error.message || 'Failed to fetch dashboard');
  }

  return await response.json();
};

// Get company dashboard
export const getCompanyDashboard = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/company/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders('company'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch company dashboard' }));
    throw new Error(error.message || 'Failed to fetch company dashboard');
  }

  return await response.json();
};

// ============================================
// INVOICE API ENDPOINTS
// ============================================

export interface InvoicePayment {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount?: number; // in paise
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paidAt?: string;
}

export interface InvoiceItem {
  product?: {
    id?: string;
    _id?: string;
    name?: string;
    gstSlab?: number;
  } | string;
  productName: string;
  sku: string;
  quantity: number;
  pricePerUnit?: number;
  unitPrice?: number;
  totalPrice: number;
  gstRate?: number;
  gstAmount?: number;
  amount?: number;
  gst?: number;
}

export interface InvoiceData {
  id: string;
  _id?: string;
  invoiceNumber: string;
  orderId: string;
  order?: any;
  companyDetails?: any;
  companyId?: string;
  company?: any;
  branchId?: string;
  branch?: any;
  vendorId?: string;
  vendor?: any;
  items: InvoiceItem[];
  subtotal: number;
  totalGst?: number;
  totalGST?: number;
  grandTotal: number;
  status?: 'draft' | 'issued' | 'paid' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  payment?: InvoicePayment;
  deliveryChallans?: any[];
  deliveryChallan?: any;
  notes?: string;
  createdBy?: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== DELIVERY CHALLAN =====

export interface DeliveryChallanItem {
  _id?: string;
  product?: {
    _id?: string;
    sku?: string;
    brand?: string;
    productName?: string;
    images?: Array<{
      url: string;
      publicId?: string;
      _id?: string;
    }>;
    category?: string;
    subCategory?: string;
  } | string;
  productName: string;
  sku: string;
  quantity: number;
  pricePerUnit?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface DeliveryChallanData {
  _id?: string;
  id?: string;
  challanNumber: string;
  orderId: string;
  order?: {
    _id: string;
    totalAmount: number;
    status: string;
    vendorApprovalStatus?: string;
    createdAt: string;
    orderNumber: string;
  };
  company?: {
    _id?: string;
    name?: string;
    email?: string;
    companyLocation?: string;
  };
  vendor?: {
    _id?: string;
    name?: string;
    email?: string;
    vendorLocation?: string;
  };
  branch?: {
    _id?: string;
    branchName?: string;
    address?: string;
  };
  items: DeliveryChallanItem[];
  totalItems?: number;
  subtotal?: number;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: any;
}

export interface GetDeliveryChallansResponse {
  success: boolean;
  count: number;
  totalChallans: number;
  totalPages: number;
  currentPage: number;
  data: DeliveryChallanData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Get all delivery challans
export const getDeliveryChallans = async (
  page: number = 1,
  limit: number = 50
): Promise<GetDeliveryChallansResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/delivery-challan/all?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch delivery challans' }));
    throw new Error(error.message || 'Failed to fetch delivery challans');
  }

  return await response.json();
};

// Get vendor's delivery challans
export interface GetVendorChallansResponse {
  success: boolean;
  count: number;
  totalChallans: number;
  totalPages: number;
  currentPage: number;
  data: DeliveryChallanData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getVendorChallans = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<GetVendorChallansResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/api/delivery-challan/vendor/my-challans?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders('vendor'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vendor challans' }));
    throw new Error(error.message || 'Failed to fetch vendor challans');
  }

  return await response.json();
};

// Get delivery challan details
export interface GetChallanDetailsResponse {
  success: boolean;
  data: DeliveryChallanData;
}

export const getChallanDetails = async (
  orderId: string
): Promise<GetChallanDetailsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/delivery-challan/order/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders('vendor'),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch challan details' }));
    throw new Error(error.message || 'Failed to fetch challan details');
  }

  return await response.json();
};

// Create delivery challan
export interface CreateDeliveryChallanRequest {
  orderId: string;
}

export interface CreateDeliveryChallanResponse {
  success: boolean;
  message: string;
  data: DeliveryChallanData;
}

export const createDeliveryChallan = async (
  orderId: string
): Promise<CreateDeliveryChallanResponse> => {
  const userRole = normalizeRole(getUserData()?.role) || 'vendor';

  const response = await fetch(`${API_BASE_URL}/api/delivery-challan`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create delivery challan' }));
    throw new Error(error.message || 'Failed to create delivery challan');
  }

  return await response.json();
};

// ===== INVOICES =====

export interface CreateInvoiceRequest {
  orderId: string;
  notes?: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  data: InvoiceData;
}

export interface GetInvoicesResponse {
  success: boolean;
  count: number;
  totalInvoices: number;
  totalPages: number;
  currentPage: number;
  data: InvoiceData[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetInvoiceResponse {
  success: boolean;
  data: InvoiceData;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  invoiceId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: InvoiceData;
}

export interface CancelInvoiceRequest {
  reason: string;
}

export interface CancelInvoiceResponse {
  success: boolean;
  message: string;
  data: InvoiceData;
}

// Create Invoice (Admin/Sub-Admin only)
export const createInvoice = async (req: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create invoice' }));
    throw new Error(error.message || 'Failed to create invoice');
  }

  return await response.json();
};

// Get all invoices (with filters)
export const getInvoices = async (
  filters?: {
    status?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
  },
  page: number = 1,
  limit: number = 10,
  role?: UserRole
): Promise<GetInvoicesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) params.append('status', filters.status);
  if (filters?.companyId) params.append('companyId', filters.companyId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch invoices' }));
    throw new Error(error.message || 'Failed to fetch invoices');
  }

  return await response.json();
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId: string, role?: UserRole): Promise<GetInvoiceResponse> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch invoice' }));
    throw new Error(error.message || 'Failed to fetch invoice');
  }

  return await response.json();
};

// Get invoice by order ID
export const getInvoiceByOrderId = async (orderId: string, role?: UserRole): Promise<GetInvoiceResponse> => {
  const userRole = role || normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices/order/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch invoice' }));
    throw new Error(error.message || 'Failed to fetch invoice');
  }

  return await response.json();
};

// Verify payment (Company users only)
export const verifyInvoicePayment = async (req: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/invoices/verify-payment`, {
    method: 'POST',
    headers: getAuthHeaders('company'),
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to verify payment' }));
    throw new Error(error.message || 'Failed to verify payment');
  }

  return await response.json();
};

// Cancel invoice (Admin/Sub-Admin only)
export const cancelInvoice = async (invoiceId: string, req: CancelInvoiceRequest): Promise<CancelInvoiceResponse> => {
  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(userRole),
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to cancel invoice' }));
    throw new Error(error.message || 'Failed to cancel invoice');
  }

  return await response.json();
};

// Delete invoice (Admin/Sub-Admin only, only if unpaid)
export const deleteInvoice = async (invoiceId: string): Promise<{ success: boolean; message: string }> => {
  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete invoice' }));
    throw new Error(error.message || 'Failed to delete invoice');
  }

  return await response.json();
};

// Get approved orders for invoice creation
export const getApprovedOrders = async (
  page: number = 1,
  limit: number = 50
): Promise<OrdersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: 'approved',
  });

  const userRole = normalizeRole(getUserData()?.role) || 'admin';

  const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(userRole),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch approved orders' }));
    throw new Error(error.message || 'Failed to fetch approved orders');
  }

  return await response.json();
};

