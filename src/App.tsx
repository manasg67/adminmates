import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import ForgotPasswordPage from './pages/forgot-password'

// Dashboard pages
import AdminDashboard from './pages/admin/dashboard'
import VendorDashboard from './pages/vendor/dashboard'
import CompaniesDashboard from './pages/companies/dashboard'
import VendorsPage from './pages/admin/vendors'
import CompaniesPage from './pages/admin/companies'
import SubAdminsPage from './pages/admin/sub-admin'
import ProductApprovalPage from './pages/admin/product-approval'
import AddProductPage from './pages/vendor/add-product'
import EditProductPage from './pages/vendor/edit-product'
import VendorProductsPage from './pages/vendor/products'
import CompanyAdminsPage from './pages/companies/admins'
import BranchesPage from './pages/companies/branches'
import CompanyUsersPage from './pages/companies/users'
import CompanyProductsPage from './pages/companies/products'
import CartPage from './pages/companies/cart'
import OrdersPage from './pages/companies/orders'
import MonthlyLimitsPage from './pages/companies/limits'
import EscalationsPage from './pages/companies/escalations'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Home/Landing page */}
          <Route path="/home" element={<HomePage />} />

          {/* Unified Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboard Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vendors" element={<VendorsPage />} />
          <Route path="/admin/companies" element={<CompaniesPage />} />
          <Route path="/admin/product-approval" element={<ProductApprovalPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProductsPage />} />
          <Route path="/vendor/add-product" element={<AddProductPage />} />
          <Route path="/vendor/products/:productId/edit" element={<EditProductPage />} />
          <Route path="/companies/dashboard" element={<CompaniesDashboard />} />
          <Route path="/companies/admins" element={<CompanyAdminsPage />} />
          <Route path="/companies/branches" element={<BranchesPage />} />
          <Route path="/admin/sub-admins" element={<SubAdminsPage />} />  
          <Route path="/companies/users" element={<CompanyUsersPage />} />
          <Route path="/companies/products" element={<CompanyProductsPage />} />
          <Route path="/companies/cart" element={<CartPage />} />
          <Route path="/companies/orders" element={<OrdersPage />} />
          <Route path="/companies/limits" element={<MonthlyLimitsPage />} />
          <Route path="/companies/escalations" element={<EscalationsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
