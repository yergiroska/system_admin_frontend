import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'
import '../Companies/CompanyForm.css'

export default function ProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [form, setForm] = useState({
        name: '',
        description: '',
        image_url: '',
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditing)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isEditing) {
            const fetchProduct = async () => {
                try {
                    const res = await api.get(`/products/${id}`)
                    setForm({
                        name: res.data.name,
                        description: res.data.description || '',
                        image_url: res.data.image_url || '',
                    })
                } catch (err) {
                    setError('No se pudo cargar el producto')
                } finally {
                    setFetching(false)
                }
            }
            fetchProduct()
        }
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
        </div>
    )
}