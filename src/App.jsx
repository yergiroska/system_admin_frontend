import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './services/authService'
import Layout from './components/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Companies from './pages/Companies/Companies'
import Products from './pages/Products/Products'
import Customers from './pages/Customers/Customers'
import Purchases from './pages/Purchases/Purchases'

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
        <Route path="/products" element={
          <PrivateRoute><Products /></PrivateRoute>
        } />
        <Route path="/customers" element={
          <PrivateRoute><Customers /></PrivateRoute>
        } />
        <Route path="/purchases" element={
          <PrivateRoute><Purchases /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
  )
}