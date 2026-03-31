import { useState, useEffect } from 'react'
import api from '../../services/api'
import Pagination from '../../components/Pagination'
import '../Companies/Companies.css'
import './Purchases.css'

const PER_PAGE = 10

export default function Purchases() {
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const res = await api.get('/purchases/')
                setPurchases(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPurchases()
    }, [])

    const filtered = purchases.filter(p =>
        p.customer.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    )

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    const totalRevenue = purchases.reduce((acc, p) => acc + p.total, 0)

    if (loading) return <div className="loading">Cargando compras...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Compras</h1>
                    <p className="page-subtitle">{purchases.length} transacciones en total</p>
                </div>
                <div className="revenue-badge">
                    Total: €{totalRevenue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
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
                        <th>Precio unitario</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.map((purchase, index) => (
                        <tr key={purchase.id}>
                            <td>{(currentPage - 1) * PER_PAGE + index + 1}</td>
                            <td>
                                <div className="company-name">
                                    <div className="avatar" style={{ background: '#f59e0b' }}>
                                        {purchase.customer.charAt(0)}
                                    </div>
                                    {purchase.customer}
                                </div>
                            </td>
                            <td className="text-muted">€{purchase.unit_price.toFixed(2)}</td>
                            <td className="text-muted">{purchase.quantity}</td>
                            <td>
                                    <span className="total-badge">
                                        €{purchase.total.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
                                    </span>
                            </td>
                            <td className="text-muted">
                                {purchase.created_at
                                    ? new Date(purchase.created_at).toLocaleDateString('es-ES')
                                    : '—'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty">No se encontraron compras</div>
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