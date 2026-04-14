import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import '../../Companies/Companies.css'
import '../Reports.css'
import '../ReportPreview.css'

const fmtEur = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

export default function SalesSummaryPreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        api.get('/reports/sales-summary/preview')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await api.get('/reports/sales-summary', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_ventas.pdf')
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

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    <h1 className="page-title">📊 Reporte de ventas</h1>
                    <p className="page-subtitle">Resumen general con top empresas y productos más vendidos</p>
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
                            <div className="preview-summary-label">Total compras</div>
                            <div className="preview-summary-value">{data.summary.total_purchases}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Ingresos totales</div>
                            <div className="preview-summary-value">{fmtEur(data.summary.total_revenue)}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Clientes</div>
                            <div className="preview-summary-value">{data.summary.total_customers}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Empresas</div>
                            <div className="preview-summary-value">{data.summary.total_companies}</div>
                        </div>
                    </div>

                    <h3 className="preview-section-title">Top empresas por ventas</h3>
                    <div className="table-card" style={{ marginBottom: 24 }}>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Empresa</th>
                                <th>Compras</th>
                                <th>Ventas totales</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.top_companies.map(r => (
                                <tr key={r.rank}>
                                    <td>{r.rank}</td>
                                    <td>{r.name}</td>
                                    <td>{r.total_purchases}</td>
                                    <td>{fmtEur(r.total_sales)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="preview-section-title">Top productos más vendidos</h3>
                    <div className="table-card">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Cantidad vendida</th>
                                <th>Ventas totales</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.top_products.map(r => (
                                <tr key={r.rank}>
                                    <td>{r.rank}</td>
                                    <td>{r.name}</td>
                                    <td>{r.total_quantity}</td>
                                    <td>{fmtEur(r.total_sales)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}