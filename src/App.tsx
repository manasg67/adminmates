import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'

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
          <Route path="/admin/sub-admins" element={<SubAdminsPage />} />  
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
