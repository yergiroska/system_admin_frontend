import { useState, useEffect } from 'react'
import api from '../../services/api'
import Pagination from '../../components/Pagination'
import '../Companies/Companies.css'

const PER_PAGE = 10

export default function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products/')
                setProducts(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    )

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    if (loading) return <div className="loading">Cargando productos...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Productos</h1>
                    <p className="page-subtitle">{products.length} productos en total</p>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Creado</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.map((product, index) => (
                        <tr key={product.id}>
                            <td>{(currentPage - 1) * PER_PAGE + index + 1}</td>
                            <td>
                                <div className="company-name">
                                    <div className="avatar" style={{ background: '#06b6d4' }}>
                                        {product.name.charAt(0)}
                                    </div>
                                    {product.name}
                                </div>
                            </td>
                            <td className="text-muted">{product.description}</td>
                            <td className="text-muted">
                                {product.created_at
                                    ? new Date(product.created_at).toLocaleDateString('es-ES')
                                    : '—'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty">No se encontraron productos</div>
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