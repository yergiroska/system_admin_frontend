import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Pagination from '../../components/Pagination'
import './Companies.css'

const PER_PAGE = 10

export default function Companies() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies/')
            setCompanies(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
    }, [])

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Eliminar la empresa "${name}"?`)) return
        try {
            await api.delete(`/companies/${id}`)
            fetchCompanies()
        } catch (err) {
            console.error(err)
        }
    }

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const paginated = filtered.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    )

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    if (loading) return <div className="loading">Cargando empresas...</div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Empresas</h1>
                    <p className="page-subtitle">{companies.length} empresas en total</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/companies/create')}>
                    + Nueva empresa
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar empresa..."
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
                        <th>Descripción</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.map((company, index) => (
                        <tr key={company.id}>
                            <td>{(currentPage - 1) * PER_PAGE + index + 1}</td>
                            <td>
                                <div className="company-name">
                                    <div className="avatar">
                                        {company.name.charAt(0)}
                                    </div>
                                    {company.name}
                                </div>
                            </td>
                            <td className="text-muted">{company.description}</td>
                            <td className="text-muted">
                                {company.created_at
                                    ? new Date(company.created_at).toLocaleDateString('es-ES')
                                    : '—'}
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button
                                        className="btn-edit"
                                        onClick={() => navigate(`/companies/${company.id}/edit`)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(company.id, company.name)}
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
                    <div className="empty">No se encontraron empresas</div>
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