import { useState, useEffect } from 'react'
import api from '../../services/api'
import Pagination from '../../components/Pagination'
import '../Companies/Companies.css'
import './Purchases.css'

const PER_PAGE = 10

export default function Purchases() {
    const [summary, setSummary] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/orders/summary')
                setSummary(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSummary()
    }, [])

    const filtered = summary.filter(s =>
        s.customer.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    )

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    const totalRevenue = summary.reduce((acc, s) => acc + s.total, 0)

    if (loading) return <div className="loading">Cargando compras...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Compras</h1>
                    <p className="page-subtitle">{summary.length} clientes en total</p>
                </div>
                <div className="revenue-badge">
                    Total: €{totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar por cliente..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Cantidad productos</th>
                        <th>Total</th>
                        <th>Última compra</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.map((s, index) => (
                        <tr key={index}>
                            <td>{(currentPage - 1) * PER_PAGE + index + 1}</td>
                            <td>
                                <div className="company-name">
                                    <div className="avatar" style={{ background: '#f59e0b' }}>
                                        {s.customer.charAt(0)}
                                    </div>
                                    {s.customer}
                                </div>
                            </td>
                            <td className="text-muted">{s.total_products}</td>
                            <td>
                                    <span className="total-badge">
                                        €{s.total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
                                    </span>
                            </td>
                            <td className="text-muted">
                                {s.last_order
                                    ? new Date(s.last_order).toLocaleDateString('es-ES')
                                    : '—'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty">No se encontraron clientes</div>
                )}
                <Pagination
                    total={filtered.length}
                    perPage={PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    )
}