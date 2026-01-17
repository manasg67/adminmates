
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import SignupPage from './pages/signup'
import ProductListingPage from './pages/products'

function App() {

  return (
    <>
      <BrowserRouter>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/products" element={<ProductListingPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
