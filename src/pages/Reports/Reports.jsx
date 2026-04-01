import { useState } from 'react'
import api from '../../services/api'
import '../Companies/Companies.css'
import './Reports.css'

const reports = [
    {
        id: 'sales-summary',
        title: 'Reporte de ventas',
        description: 'Resumen general con top 10 empresas y productos más vendidos.',
        icon: '📊',
        endpoint: '/reports/sales-summary',
        filename: 'reporte_ventas.pdf',
        hasDateRange: false,
    },
    {
        id: 'top-customers',
        title: 'Top 10 clientes VIP',
        description: 'Clientes con mayor volumen de compras y gasto total.',
        icon: '👥',
        endpoint: '/reports/top-customers',
        filename: 'reporte_top_clientes.pdf',
        hasDateRange: false,
    },
    {
        id: 'anomalies',
        title: 'Anomalías de precios',
        description: 'Precios que se salen del patrón normal detectados por ML.',
        icon: '⚠️',
        endpoint: '/reports/anomalies',
        filename: 'reporte_anomalias.pdf',
        hasDateRange: false,
    },
    {
        id: 'dormant-products',
        title: 'Productos sin movimiento',
        description: 'Productos que no tienen compras registradas.',
        icon: '😴',
        endpoint: '/reports/dormant-products',
        filename: 'reporte_productos_dormidos.pdf',
        hasDateRange: false,
    },
    {
        id: 'monthly-summary',
        title: 'Resumen mensual por empresa',
        description: 'Ventas desglosadas por mes para cada empresa.',
        icon: '🏢',
        endpoint: '/reports/monthly-summary',
        filename: 'reporte_mensual_empresas.pdf',
        hasDateRange: false,
    },
    {
        id: 'sales-by-date',
        title: 'Ventas por período',
        description: 'Reporte de ventas filtrado por rango de fechas.',
        icon: '📅',
        endpoint: '/reports/sales-by-date',
        filename: 'reporte_ventas_periodo.pdf',
        hasDateRange: true,
    },
]

export default function Reports() {
    const [loading, setLoading] = useState({})
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [error, setError] = useState('')

    const handleDownload = async (report) => {
        setError('')
        setLoading(prev => ({ ...prev, [report.id]: true }))

        try {
            let endpoint = report.endpoint
            if (report.hasDateRange) {
                if (!dateRange.start || !dateRange.end) {
                    setError('Selecciona un rango de fechas para este reporte')
                    setLoading(prev => ({ ...prev, [report.id]: false }))
                    return
                }
                endpoint += `?start_date=${dateRange.start}&end_date=${dateRange.end}`
            }

            const response = await api.get(endpoint, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', report.filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError(`Error al generar el reporte: ${report.title}`)
        } finally {
            setLoading(prev => ({ ...prev, [report.id]: false }))
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-subtitle">Descarga reportes PDF generados en tiempo real</p>
                </div>
            </div>

            {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="reports-grid">
                {reports.map(report => (
                    <div key={report.id} className="report-card">
                        <div className="report-icon">{report.icon}</div>
                        <div className="report-info">
                            <h3 className="report-title">{report.title}</h3>
                            <p className="report-description">{report.description}</p>
                        </div>

                        {report.hasDateRange && (
                            <div className="date-range">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                />
                                <span>—</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                />
                            </div>
                        )}

                        <button
                            className="btn-download"
                            onClick={() => handleDownload(report)}
                            disabled={loading[report.id]}
                        >
                            {loading[report.id] ? 'Generando...' : '⬇ Descargar PDF'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}