import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'

export default function CustomerHistory() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [customer, setCustomer] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customerRes, ordersRes] = await Promise.all([
                    api.get(`/customers/${id}`),
                    api.get(`/orders/customer/${id}`)
                ])
                setCustomer(customerRes.data)
                setOrders(ordersRes.data)
            } catch (err) {
                setError('No se pudo cargar el historial')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="loading">Cargando historial...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Historial - {customer?.first_name} {customer?.last_name}
                    </h1>
                    <p className="page-subtitle">{orders.length} órdenes en total</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-primary"
                        onClick={() => navigate(`/customers/${id}/buy`)}
                    >
                        + Nueva compra
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/customers')}
                    >
                        Volver
                    </button>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                {orders.length === 0 ? (
                    <div className="empty">Este cliente no tiene órdenes registradas</div>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Orden</th>
                            <th>Cantidad productos</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Factura</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>
                                    <span
                                        style={{ color: '#0f3460', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate(`/orders/${o.id}`)}
                                    >
                                        #{String(o.id).padStart(6, '0')}
                                    </span>
                                </td>
                                <td>{o.total_products}</td>
                                <td><strong>€{o.total.toFixed(2)}</strong></td>
                                <td className="text-muted">
                                    {new Date(o.created_at).toLocaleDateString('es-ES')}
                                </td>
                                <td>
                                <a
                                    href={`http://localhost:8000/orders/${o.id}/invoice`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#0f3460', fontWeight: 'bold', textDecoration: 'underline' }}
                                    >
                                    Descargar
                                </a>
                            </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
            </div>
        </div>
    )
}