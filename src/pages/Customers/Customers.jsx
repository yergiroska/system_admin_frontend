import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Pagination from '../../components/Pagination'
import '../Companies/Companies.css'

const PER_PAGE = 10

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [segments, setSegments] = useState({})
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            const [customersRes, segmentsRes] = await Promise.all([
                api.get('/customers/'),
                api.get('/ml/customer-segments'),
            ])
            setCustomers(customersRes.data)

            const segmentMap = {}
            for (const [segment, data] of Object.entries(segmentsRes.data.segments)) {
                data.customers.forEach(c => {
                    segmentMap[c.id] = segment
                })
            }
            setSegments(segmentMap)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Eliminar el cliente "${name}"?`)) return
        try {
            await api.delete(`/customers/${id}`)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const filtered = customers.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    )

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    const segmentBadge = (id) => {
        const segment = segments[id]
        if (!segment) return null
        const styles = {
            VIP:     { background: '#dcfce7', color: '#16a34a' },
            Medio:   { background: '#fef9c3', color: '#ca8a04' },
            Dormido: { background: '#fee2e2', color: '#dc2626' },
        }
        return (
            <span className="badge" style={styles[segment]}>
                {segment}
            </span>
        )
    }

    if (loading) return <div className="loading">Cargando clientes...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">{customers.length} clientes en total</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/customers/create')}>
                    + Nuevo cliente
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Segmento</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.map((customer, index) => (
                        <tr key={customer.id}>
                            <td>{(currentPage - 1) * PER_PAGE + index + 1}</td>
                            <td>
                                <div className="company-name">
                                    <div className="avatar" style={{ background: '#10b981' }}>
                                        {customer.first_name.charAt(0)}
                                    </div>
                                    {customer.first_name} {customer.last_name}
                                </div>
                            </td>
                            <td className="text-muted">{customer.identity_document || '—'}</td>
                            <td>{segmentBadge(customer.id)}</td>
                            <td className="text-muted">
                                {customer.created_at
                                    ? new Date(customer.created_at).toLocaleDateString('es-ES')
                                    : '—'}
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/customers/${customer.id}/history`)}
                                    >
                                        Ver
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/customers/${customer.id}/buy`)}
                                    >
                                        Comprar
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/customers/${customer.id}/edit`)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(customer.id, `${customer.first_name} ${customer.last_name}`)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
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