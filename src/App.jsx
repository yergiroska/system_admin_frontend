import {Routes, Route, Navigate} from 'react-router-dom'
import {isAuthenticated} from './services/authService'
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
import CustomerBuy from './pages/Customers/CustomerBuy'
import CustomerHistory from './pages/Customers/CustomerHistory'
import OrderDetail from './pages/Orders/OrderDetail'
import TopCustomersPreview from './pages/Reports/previews/TopCustomersPreview'
import SalesSummaryPreview from './pages/Reports/previews/SalesSummaryPreview'
import AnomaliesPreview from './pages/Reports/previews/AnomaliesPreview.jsx'
import DormantProductsPreview from './pages/Reports/previews/DormantProductsPreview'
import MonthlySummaryPreview from './pages/Reports/previews/MonthlySummaryPreview'
import SalesByDatePreview from './pages/Reports/previews/SalesByDatePreview'


const PrivateRoute = ({children}) => {
    return isAuthenticated() ? (
        <Layout>{children}</Layout>
    ) : (
        <Navigate to="/login"/>
    )
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/dashboard" element={
                <PrivateRoute><Dashboard/></PrivateRoute>
            }/>
            <Route path="/companies" element={
                <PrivateRoute><Companies/></PrivateRoute>
            }/>
            <Route path="/companies/create" element={
                <PrivateRoute><CompanyForm/></PrivateRoute>
            }/>
            <Route path="/companies/:id/edit" element={
                <PrivateRoute><CompanyForm/></PrivateRoute>
            }/>
            <Route path="/products" element={
                <PrivateRoute><Products/></PrivateRoute>
            }/>
            <Route path="/products/create" element={
                <PrivateRoute><ProductForm/></PrivateRoute>
            }/>
            <Route path="/products/:id/edit" element={
                <PrivateRoute><ProductForm/></PrivateRoute>
            }/>
            <Route path="/customers" element={
                <PrivateRoute><Customers/></PrivateRoute>
            }/>
            <Route path="/customers/create" element={
                <PrivateRoute><CustomerForm/></PrivateRoute>
            }/>
            <Route path="/customers/:id/edit" element={
                <PrivateRoute><CustomerForm/></PrivateRoute>
            }/>
            <Route path="/customers/:id/buy" element={
                <PrivateRoute><CustomerBuy/></PrivateRoute>
            }/>
            <Route path="/customers/:id/history" element={
                <PrivateRoute><CustomerHistory/></PrivateRoute>
            }/>
            <Route path="/orders/:order_id" element={
                <PrivateRoute><OrderDetail/></PrivateRoute>
            }/>
            <Route path="/purchases" element={
                <PrivateRoute><Purchases/></PrivateRoute>
            }/>
            <Route path="/reports" element={
                <PrivateRoute><Reports/></PrivateRoute>
            }/>
            <Route path="/ml" element={
                <PrivateRoute><MLPage/></PrivateRoute>
            }/>
            <Route path="/reports/top-customers/preview" element={
                <PrivateRoute><TopCustomersPreview/></PrivateRoute>
            }/>
            <Route path="/reports/sales-summary/preview" element={
                <PrivateRoute><SalesSummaryPreview/></PrivateRoute>
            }/>
            <Route path="/reports/anomalies/preview" element={
                <PrivateRoute><AnomaliesPreview/></PrivateRoute>
            }/>
            <Route path="/reports/dormant-products/preview" element={
                <PrivateRoute><DormantProductsPreview/></PrivateRoute>
            }/>
            <Route path="/reports/monthly-summary/preview" element={
                <PrivateRoute><MonthlySummaryPreview /></PrivateRoute>
            }/>
            <Route path="/reports/sales-by-date/preview" element={
                <PrivateRoute><SalesByDatePreview /></PrivateRoute>
            }/>
            <Route path="*" element={<Navigate to="/login"/>}/>
        </Routes>
    )
}