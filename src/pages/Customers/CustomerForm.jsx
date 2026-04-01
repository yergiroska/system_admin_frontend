import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import '../Companies/Companies.css'
import '../Companies/CompanyForm.css'

export default function CustomerForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        birth_date: '',
        identity_document: '',
        image_url: '',
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditing)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isEditing) {
            const fetchCustomer = async () => {
                try {
                    const res = await api.get(`/customers/${id}`)
                    setForm({
                        first_name: res.data.first_name,
                        last_name: res.data.last_name || '',
                        birth_date: res.data.birth_date || '',
                        identity_document: res.data.identity_document || '',
                        image_url: res.data.image_url || '',
                    })
                } catch (err) {
                    setError('No se pudo cargar el cliente')
                } finally {
                    setFetching(false)
                }
            }
            fetchCustomer()
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
                first_name: form.first_name,
                last_name: form.last_name || null,
                birth_date: form.birth_date || null,
                identity_document: form.identity_document || null,
                image_url: form.image_url || null,
            }
            if (isEditing) {
                await api.put(`/customers/${id}`, payload)
            } else {
                await api.post('/customers/', payload)
            }
            navigate('/customers')
        } catch (err) {
            setError('Error al guardar el cliente')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="loading">Cargando cliente...</div>

    return (
        <div className="form-page">
            <div className="form-header">
                <button className="back-btn" onClick={() => navigate('/customers')}>
                    ← Volver
                </button>
                <h1 className="page-title">
                    {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
                </h1>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            placeholder="Nombre del cliente"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Apellido</label>
                        <input
                            type="text"
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            placeholder="Apellido del cliente"
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha de nacimiento</label>
                        <input
                            type="date"
                            name="birth_date"
                            value={form.birth_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Documento de identidad</label>
                        <input
                            type="text"
                            name="identity_document"
                            value={form.identity_document}
                            onChange={handleChange}
                            placeholder="12345678A"
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
                            onClick={() => navigate('/customers')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}