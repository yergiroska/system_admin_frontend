import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import '../../Companies/Companies.css'
import '../Reports.css'
import '../ReportPreview.css'

const fmtEur = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

export default function MonthlySummaryPreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        api.get('/reports/monthly-summary/preview')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await api.get('/reports/monthly-summary', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_mensual_empresas.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error(err)
        } finally {
            setDownloading(false)
        }
    }

    const filtered = data?.companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    ) || []

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    <h1 className="page-title">🏢 Resumen mensual por empresa</h1>
                    <p className="page-subtitle">Ventas desglosadas por mes para cada empresa</p>
                </div>
                <button className="btn-download" style={{ width: 'auto' }} onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Generando...' : '⬇ Descargar PDF'}
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando datos...</div>
            ) : (
                <>
                    <div className="preview-summary-grid">
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Empresas</div>
                            <div className="preview-summary-value">{data.companies.length}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Ingresos totales</div>
                            <div className="preview-summary-value">
                                {fmtEur(data.companies.reduce((acc, c) => acc + c.totals.total_sales, 0))}
                            </div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Compras totales</div>
                            <div className="preview-summary-value">
                                {data.companies.reduce((acc, c) => acc + c.totals.total_purchases, 0)}
                            </div>
                        </div>
                    </div>

                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar empresa..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {filtered.map(company => (
                        <div key={company.name} style={{ marginBottom: 24 }}>
                            <h3 className="preview-section-title">{company.name}</h3>
                            <div className="table-card">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Compras</th>
                                        <th>Ventas totales</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {company.months.map(m => (
                                        <tr key={m.month}>
                                            <td>{m.month}</td>
                                            <td>{m.total_purchases}</td>
                                            <td>{fmtEur(m.total_sales)}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                                        <td>TOTAL</td>
                                        <td>{company.totals.total_purchases}</td>
                                        <td>{fmtEur(company.totals.total_sales)}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="empty">No se encontraron empresas</div>
                    )}
                </>
            )}
        </div>
    )
}