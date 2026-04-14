import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import Pagination from '../../../components/Pagination'
import '../../Companies/Companies.css'
import '../Reports.css'
import '../ReportPreview.css'

const fmtEur = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

const PER_PAGE = 15

export default function AnomaliesPreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        api.get('/reports/anomalies/preview')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await api.get('/reports/anomalies', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_anomalias.pdf')
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

    const paginated = data?.anomalies.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    ) || []

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    <h1 className="page-title">⚠️ Anomalías de precios</h1>
                    <p className="page-subtitle">Precios que se salen del patrón normal detectados por ML</p>
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
                            <div className="preview-summary-label">Precios analizados</div>
                            <div className="preview-summary-value">{data.summary.total_analyzed}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Anomalías encontradas</div>
                            <div className="preview-summary-value" style={{ color: '#dc2626' }}>
                                {data.summary.total_anomalies}
                            </div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Tasa de anomalías</div>
                            <div className="preview-summary-value" style={{ color: '#f59e0b' }}>
                                {data.summary.anomaly_rate}
                            </div>
                        </div>
                    </div>

                    <div className="table-card">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Empresa</th>
                                <th>Precio</th>
                                <th>Score</th>
                                <th>Fecha</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.map(r => (
                                <tr key={r.rank}>
                                    <td>{r.rank}</td>
                                    <td>{r.product}</td>
                                    <td>{r.company}</td>
                                    <td>{fmtEur(r.price)}</td>
                                    <td>{r.score}</td>
                                    <td>{r.date}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <Pagination
                            total={data.anomalies.length}
                            perPage={PER_PAGE}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )}
        </div>
    )
}