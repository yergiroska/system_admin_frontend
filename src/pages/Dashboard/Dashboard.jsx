import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [salesByCompany, setSalesByCompany] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [purchasesByMonth, setPurchasesByMonth] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState('all')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companiesRes, productsRes, monthsRes] = await Promise.all([
                    api.get('/stats/sales-by-company'),
                    api.get('/stats/top-products'),
                    api.get('/stats/purchases-by-month'),
                ])

                setSalesByCompany(companiesRes.data.slice(0, 8))
                setTopProducts(productsRes.data.slice(0, 8))
                setPurchasesByMonth(monthsRes.data)

                const totalSales = companiesRes.data.reduce((acc, c) => acc + c.total_sales, 0)
                const totalPurchases = companiesRes.data.reduce((acc, c) => acc + c.total_purchases, 0)

                setStats({
                    total_sales: totalSales,
                    total_purchases: totalPurchases,
                    total_companies: companiesRes.data.length,
                    total_products: productsRes.data.length,
                })
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredMonthData = useMemo(() => {
        if (selectedMonth === 'all') return purchasesByMonth
        return purchasesByMonth.filter(p => p.month === selectedMonth)
    }, [selectedMonth, purchasesByMonth])

    const filteredStats = useMemo(() => {
        if (!stats) return null
        if (selectedMonth === 'all') return stats
        const filtered = filteredMonthData
        return {
            ...stats,
            total_sales: filtered.reduce((acc, p) => acc + p.total_sales, 0),
            total_purchases: filtered.reduce((acc, p) => acc + p.total_purchases, 0),
        }
    }, [selectedMonth, filteredMonthData, stats])

    if (loading) return <div className="loading">Cargando dashboard...</div>

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <p className="page-subtitle">Análisis de ventas en tiempo real</p>
                <div className="filter-bar">
                    <label>Filtrar por mes:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="all">Todos los meses</option>
                        {purchasesByMonth.map(p => (
                            <option key={p.month} value={p.month}>{p.month}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Métricas */}
            <div className="metrics-grid">
                <div className="metric-card blue">
                    <div className="metric-label">Ingresos totales</div>
                    <div className="metric-value">€{filteredStats.total_sales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</div>
                    <div className="metric-sub">{selectedMonth === 'all' ? 'Todas las compras' : selectedMonth}</div>
                </div>
                <div className="metric-card cyan">
                    <div className="metric-label">Total compras</div>
                    <div className="metric-value">{filteredStats.total_purchases}</div>
                    <div className="metric-sub">Transacciones</div>
                </div>
                <div className="metric-card green">
                    <div className="metric-label">Empresas</div>
                    <div className="metric-value">{stats.total_companies}</div>
                    <div className="metric-sub">Proveedores activos</div>
                </div>
                <div className="metric-card amber">
                    <div className="metric-label">Productos</div>
                    <div className="metric-value">{stats.total_products}</div>
                    <div className="metric-sub">En catálogo</div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="charts-grid">
                <div className="chart-card full">
                    <h2>Ventas por mes {selectedMonth !== 'all' && `— ${selectedMonth}`}</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={filteredMonthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => `€${val.toLocaleString('es-ES')}`} />
                            <Line type="monotone" dataKey="total_sales" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h2>Top empresas por ventas</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={salesByCompany} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} width={120} />
                            <Tooltip formatter={(val) => `€${val.toLocaleString('es-ES')}`} />
                            <Bar dataKey="total_sales" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h2>Top productos más vendidos</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topProducts}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="product" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="total_quantity" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}