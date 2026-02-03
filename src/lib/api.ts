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
    const role = normalizeRole(data.data.user.role) || 'vendor';
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
    const role = normalizeRole(data.data.user.role) || 'vendor';
    setAuthToken(data.data.token, role);
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
export const approveProduct = async (productId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  const token = getAuthToken('admin');

  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
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
