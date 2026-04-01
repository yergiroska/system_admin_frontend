import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'
import '../Companies/CompanyForm.css'
import './ProductForm.css'

export default function ProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [form, setForm] = useState({
        name: '',
        description: '',
        image_url: '',
    })
    const [companies, setCompanies] = useState([])
    const [associations, setAssociations] = useState([])
    const [newAssociation, setNewAssociation] = useState({
        company_id: '',
        price: '',
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditing)
    const [error, setError] = useState('')
    const [assocError, setAssocError] = useState('')
    const [assocSuccess, setAssocSuccess] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const companiesRes = await api.get('/companies/')
                setCompanies(companiesRes.data)

                if (isEditing) {
                    const [productRes, assocRes] = await Promise.all([
                        api.get(`/products/${id}`),
                        api.get(`/company-products/product/${id}`)
                    ])
                    setForm({
                        name: productRes.data.name,
                        description: productRes.data.description || '',
                        image_url: productRes.data.image_url || '',
                    })
                    setAssociations(assocRes.data)
                }
            } catch (err) {
                setError('No se pudo cargar la información')
            } finally {
                setFetching(false)
            }
        }
        fetchData()
    }, [id])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const payload = {
                name: form.name,
                description: form.description,
                image_url: form.image_url || null,
            }
            if (isEditing) {
                await api.put(`/products/${id}`, payload)
            } else {
                await api.post('/products/', payload)
            }
            navigate('/products')
        } catch (err) {
            setError('Error al guardar el producto')
        } finally {
            setLoading(false)
        }
    }

    const handleAddAssociation = async () => {
        setAssocError('')
        setAssocSuccess('')
        if (!newAssociation.company_id || !newAssociation.price) {
            setAssocError('Selecciona una empresa e ingresa un precio')
            return
        }
        try {
            await api.post('/company-products/', {
                product_id: parseInt(id),
                company_id: parseInt(newAssociation.company_id),
                price: parseFloat(newAssociation.price),
            })
            setAssocSuccess('Precio actualizado correctamente')
            setNewAssociation({ company_id: '', price: '' })
            const assocRes = await api.get(`/company-products/product/${id}`)
            setAssociations(assocRes.data)
        } catch (err) {
            setAssocError('Error al asociar la empresa')
        }
    }

    if (fetching) return <div className="loading">Cargando producto...</div>

    return (
        <div className="form-page">
            <div className="form-header">
                <button className="back-btn" onClick={() => navigate('/products')}>
                    ← Volver
                </button>
                <h1 className="page-title">
                    {isEditing ? 'Editar producto' : 'Nuevo producto'}
                </h1>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nombre del producto"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Descripción del producto"
                            rows={4}
                        />
                    </div>
                    <div className="form-group">
                        <label>URL de imagen</label>
                        <input
                            type="text"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/products')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>

            {isEditing && (
                <div className="form-card assoc-card">
                    <h2 className="assoc-title">Empresas y precios</h2>

                    {associations.length > 0 ? (
                        <table className="table assoc-table">
                            <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Precio actual</th>
                            </tr>
                            </thead>
                            <tbody>
                            {associations.map(a => (
                                <tr key={a.company_product_id}>
                                    <td>{a.company_name}</td>
                                    <td>€{a.price.toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">No hay empresas asociadas aún.</p>
                    )}

                    <div className="assoc-form">
                        <h3 className="assoc-subtitle">Agregar empresa</h3>
                        {assocError && <div className="form-error">{assocError}</div>}
                        {assocSuccess && <div className="form-success">{assocSuccess}</div>}
                        <div className="assoc-inputs">
                            <select
                                value={newAssociation.company_id}
                                onChange={(e) => setNewAssociation({ ...newAssociation, company_id: e.target.value })}
                            >
                                <option value="">Seleccionar empresa...</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Precio €"
                                value={newAssociation.price}
                                onChange={(e) => setNewAssociation({ ...newAssociation, price: e.target.value })}
                            />
                            <button className="btn-primary" onClick={handleAddAssociation}>
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}