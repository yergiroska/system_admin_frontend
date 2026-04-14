import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'
import '../Companies/CompanyForm.css'

export default function CustomerBuy() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [customer, setCustomer] = useState(null)
    const [companyProducts, setCompanyProducts] = useState([])
    const [selected, setSelected] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customerRes, productsRes] = await Promise.all([
                    api.get(`/customers/${id}`),
                    api.get('/company-products/all')
                ])
                setCustomer(customerRes.data)
                setCompanyProducts(productsRes.data)
            } catch (err) {
                setError('No se pudo cargar la información')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleAddToCart = () => {
        if (!selected) {
            setError('Selecciona un producto')
            return
        }
        setError('')
        const exists = cart.find(item => item.id === selected.id)
        if (exists) {
            setCart(cart.map(item =>
                item.id === selected.id
                    ? { ...item, quantity: item.quantity + parseInt(quantity) }
                    : item
            ))
        } else {
            setCart([...cart, { ...selected, quantity: parseInt(quantity) }])
        }
        setSelected(null)
        setQuantity(1)
    }

    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId))
    }

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const handleSubmit = async () => {
        if (cart.length === 0) {
            setError('Agrega al menos un producto')
            return
        }
        setSubmitting(true)
        setError('')
        setSuccess(null)
        try {
            const res = await api.post('/orders/', {
                customer_id: parseInt(id),
                items: cart.map(item => ({
                    company_product_id: item.id,
                    unit_price: item.price,
                    quantity: item.quantity,
                }))
            })
            setSuccess({
                order_id: res.data.order_id,
                total: res.data.total,
                items: cart.map(item => ({
                    product: item.product_name,
                    company: item.company_name,
                    unit_price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                }))
            })
            setCart([])
        } catch (err) {
            setError('Error al registrar la compra')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="loading">Cargando...</div>

    return (
        <div className="form-page">
            <div className="form-header">
                <button className="back-btn" onClick={() => navigate('/customers')}>
                    Volver
                </button>
                <h1 className="page-title">
                    Compra - {customer?.first_name} {customer?.last_name}
                </h1>
            </div>

            {error && <div className="form-error">{error}</div>}

            {success && (
                <div className="form-success">
                    <strong>Compra registrada correctamente</strong>
                    <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={{ color: '#166534', textAlign: 'left', padding: '6px 0' }}>Producto</th>
                            <th style={{ color: '#166534', textAlign: 'left', padding: '6px 0' }}>Empresa</th>
                            <th style={{ color: '#166534', textAlign: 'right', padding: '6px 0' }}>Precio unit.</th>
                            <th style={{ color: '#166534', textAlign: 'right', padding: '6px 0' }}>Cantidad</th>
                            <th style={{ color: '#166534', textAlign: 'right', padding: '6px 0' }}>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {success.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ color: '#166534', padding: '6px 0' }}>{item.product}</td>
                                <td style={{ color: '#166534', padding: '6px 0' }}>{item.company}</td>
                                <td style={{ color: '#166534', padding: '6px 0', textAlign: 'right' }}>€{item.unit_price.toFixed(2)}</td>
                                <td style={{ color: '#166534', padding: '6px 0', textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ color: '#166534', padding: '6px 0', textAlign: 'right' }}>€{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={4} style={{ color: '#166534', fontWeight: 'bold', padding: '10px 0', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ color: '#166534', fontWeight: 'bold', padding: '10px 0', textAlign: 'right' }}>€{success.total.toFixed(2)}</td>
                        </tr>
                        </tfoot>
                    </table>
                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                        <a
                            href={`http://localhost:8000/orders/${success.order_id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#166534', fontWeight: 'bold', textDecoration: 'underline', fontSize: '14px' }}
                            >
                        Descargar factura completa
                        </a>
                    </div>
                </div>
            )}

<div className="form-card">
    <div className="form-group">
        <label>Producto *</label>
        <select
            value={selected?.id || ''}
            onChange={(e) => {
                const cp = companyProducts.find(p => p.id === parseInt(e.target.value))
                setSelected(cp || null)
            }}
        >
            <option value="">Seleccionar producto...</option>
            {companyProducts.map(cp => (
                <option key={cp.id} value={cp.id}>
                    {cp.product_name} - {cp.company_name} (€{cp.price.toFixed(2)})
                </option>
            ))}
        </select>
    </div>

    {selected && (
        <div className="form-group">
            <label>Precio unitario</label>
            <input type="text" value={`€${selected.price.toFixed(2)}`} disabled />
        </div>
    )}

    <div className="form-group">
        <label>Cantidad *</label>
        <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
        />
    </div>

    {selected && (
        <div className="form-group">
            <label>Subtotal</label>
            <input
                type="text"
                value={`€${(selected.price * quantity).toFixed(2)}`}
                disabled
            />
        </div>
    )}

    <div style={{ textAlign: 'right' }}>
        <button className="btn-primary" onClick={handleAddToCart}>
            + Agregar
        </button>
    </div>
</div>

{cart.length > 0 && (
    <div className="form-card">
        <h3 style={{ marginTop: 0 }}>Productos a comprar</h3>
        <table className="table">
            <thead>
            <tr>
                <th>Producto</th>
                <th>Empresa</th>
                <th>Precio unit.</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {cart.map(item => (
                <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td className="text-muted">{item.company_name}</td>
                    <td>€{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td><strong>€{(item.price * item.quantity).toFixed(2)}</strong></td>
                    <td>
                        <button
                            className="btn-delete"
                            onClick={() => handleRemoveFromCart(item.id)}
                        >
                            Quitar
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        <div style={{ textAlign: 'right', padding: '12px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
            <strong>Total: €{cartTotal.toFixed(2)}</strong>
        </div>
        <div className="form-actions">
            <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/customers')}
            >
                Cancelar
            </button>
            <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
            >
                {submitting ? 'Registrando...' : 'Confirmar compra'}
            </button>
        </div>
    </div>
)}
</div>
)
}