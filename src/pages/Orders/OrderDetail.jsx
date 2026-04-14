import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'

export default function OrderDetail() {
    const { order_id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${order_id}`)
                setOrder(res.data)
            } catch (err) {
                setError('No se pudo cargar la orden')
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [order_id])

    if (loading) return <div className="loading">Cargando orden...</div>
    if (error) return <div className="form-error">{error}</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Orden #{String(order.id).padStart(6, '0')}
                    </h1>
                    <p className="page-subtitle">{order.customer}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                <a
                    href={`http://localhost:8000/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: 'none', padding: '8px 16px' }}
                    >
                    Descargar factura
                </a>
                <button
                    className="btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>
            </div>
        </div>

    <div className="table-card">
        <table className="table">
            <thead>
            <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Empresa</th>
                <th>Precio unit.</th>
                <th>Cantidad</th>
                <th>Total</th>
            </tr>
            </thead>
            <tbody>
            {order.items.map((item, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.product}</td>
                    <td className="text-muted">{item.company}</td>
                    <td>€{item.unit_price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td><strong>€{item.total.toFixed(2)}</strong></td>
                </tr>
            ))}
            </tbody>
        </table>
        <div style={{ textAlign: 'right', padding: '16px 12px', borderTop: '2px solid #e5e7eb' }}>
            <strong>Total: €{order.total.toFixed(2)}</strong>
        </div>
    </div>
</div>
)
}