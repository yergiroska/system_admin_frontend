import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from "../../services/api"
import './Companies.css'
import './CompanyForm.css'

export default function CompanyForm() {
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
            const fetchCompany = async () => {
                try {
                    const res = await api.get(`/companies/${id}`)
                    setForm({
                        name: res.data.name,
                        description: res.data.description,
                        image_url: res.data.image_url || '',
                    })
                } catch (err) {
                    setError('No se pudo cargar la empresa')
                } finally {
                    setFetching(false)
                }
            }
            fetchCompany()
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
                await api.put(`/companies/${id}`, payload)
            } else {
                await api.post('/companies/', payload)
            }
            navigate('/companies')
        } catch (err) {
            setError('Error al guardar la empresa')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="loading">Cargando empresa...</div>

    return (
        <div className="form-page">
            <div className="form-header">
                <button className="back-btn" onClick={() => navigate('/companies')}>
                    ← Volver
                </button>
                <h1 className="page-title">
                    {isEditing ? 'Editar empresa' : 'Nueva empresa'}
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
                            placeholder="Nombre de la empresa"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción *</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Descripción de la empresa"
                            rows={4}
                            required
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
                            onClick={() => navigate('/companies')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}