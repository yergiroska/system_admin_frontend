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

export default function SalesByDatePreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [dateRange, setDateRange] = useState({ start: '', end: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async (start = null, end = null) => {
        setLoading(true)
        setCurrentPage(1)
        try {
            let url = '/reports/sales-by-date/preview'
            if (start && end) url += `?start_date=${start}&end_date=${end}`
            const res = await api.get(url)
            setData(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setDownloading(true)
        try {
            let url = '/reports/sales-by-date'
            if (dateRange.start && dateRange.end) {
                url += `?start_date=${dateRange.start}&end_date=${dateRange.end}`
            }
            const response = await api.get(url, { responseType: 'blob' })
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = blobUrl
            link.setAttribute('download', 'reporte_ventas_periodo.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error(err)
        } finally {
            setDownloading(false)
        }
    }

    const paginated = data?.companies.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    ) || []

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    <h1 className="page-title">📅 Ventas por período</h1>
                    <p className="page-subtitle">Reporte de ventas filtrado por rango de fechas</p>
                </div>
                <button className="btn-download" style={{ width: 'auto' }} onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Generando...' : '⬇ Descargar PDF'}
                </button>
            </div>

            <div className="preview-date-filter">
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span>—</span>
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                />
                <button
                    className="btn-preview"
                    style={{ width: 'auto', padding: '8px 16px' }}
                    onClick={() => fetchData(dateRange.start, dateRange.end)}
                >
                    Filtrar
                </button>
                {data?.period.start_date !== 'Todos' && (
                    <button
                        className="btn-back"
                        style={{ marginBottom: 0 }}
                        onClick={() => {
                            setDateRange({ start: '', end: '' })
                            fetchData()
                        }}
                    >
                        Limpiar filtro
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">Cargando datos...</div>
            ) : (
                <>
                    <div className="preview-summary-grid">
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Período</div>
                            <div className="preview-summary-value" style={{ fontSize: 14 }}>
                                {data.period.start_date === 'Todos'
                                    ? 'Todos los datos'
                                    : `${data.period.start_date} — ${data.period.end_date}`}
                            </div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Total compras</div>
                            <div className="preview-summary-value">{data.summary.total_purchases}</div>
                        </div>
                        <div className="preview-summary-card">
                            <div className="preview-summary-label">Ingresos totales</div>
                            <div className="preview-summary-value">{fmtEur(data.summary.total_revenue)}</div>
                        </div>
                    </div>

                    <div className="table-card">
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
                            {paginated.map(r => (
                                <tr key={r.rank}>
                                    <td>{r.rank}</td>
                                    <td>{r.name}</td>
                                    <td>{r.total_purchases}</td>
                                    <td>{fmtEur(r.total_sales)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <Pagination
                            total={data.companies.length}
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