import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/authService'
import Layout from './components/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Companies from './pages/Companies/Companies'
import CompanyForm from './pages/Companies/CompanyForm'
import ProductForm from './pages/Products/ProductForm'
import CustomerForm from './pages/Customers/CustomerForm'
import Products from './pages/Products/Products'
import Customers from './pages/Customers/Customers'
import Purchases from './pages/Purchases/Purchases'
import Reports from './pages/Reports/Reports'
import MLPage from './pages/ML/MLPage'

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? (
      <Layout>{children}</Layout>
  ) : (
      <Navigate to="/login" />
  )
}

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/companies" element={
          <PrivateRoute><Companies /></PrivateRoute>
        } />
        <Route path="/companies/create" element={
          <PrivateRoute><CompanyForm /></PrivateRoute>
        } />
        <Route path="/companies/:id/edit" element={
          <PrivateRoute><CompanyForm /></PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute><Products /></PrivateRoute>
        } />
        <Route path="/products/create" element={
           <PrivateRoute><ProductForm /></PrivateRoute>
        } />
        <Route path="/products/:id/edit" element={
           <PrivateRoute><ProductForm /></PrivateRoute>
        } />
        <Route path="/customers" element={
          <PrivateRoute><Customers /></PrivateRoute>
        } />
        <Route path="/customers/create" element={
          <PrivateRoute><CustomerForm /></PrivateRoute>
        } />
        <Route path="/customers/:id/edit" element={
          <PrivateRoute><CustomerForm /></PrivateRoute>
        } />  
        <Route path="/purchases" element={
          <PrivateRoute><Purchases /></PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute><Reports /></PrivateRoute>
        } />
        <Route path="/ml" element={
          <PrivateRoute><MLPage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
  )
}