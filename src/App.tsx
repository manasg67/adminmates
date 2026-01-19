import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import ProductListingPage from './pages/products'

// Dashboard pages
import AdminDashboard from './pages/admin/dashboard'
import VendorDashboard from './pages/vendor/dashboard'
import CompaniesDashboard from './pages/companies/dashboard'
import VendorsPage from './pages/admin/vendors'
import CompaniesPage from './pages/admin/companies'

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
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/companies/dashboard" element={<CompaniesDashboard />} />

          {/* Products page (can be accessed by any user type) */}
          <Route path="/products" element={<ProductListingPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
