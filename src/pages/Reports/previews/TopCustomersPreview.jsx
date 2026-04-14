import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import '../../Companies/Companies.css'
import '../Reports.css'
import '../ReportPreview.css'

const fmtEur = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

export default function TopCustomersPreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        api.get('/reports/top-customers/preview')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await api.get('/reports/top-customers', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_top_clientes.pdf')
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
                    <h1 className="page-title">👥 Top 10 clientes VIP</h1>
                    <p className="page-subtitle">Clientes con mayor volumen de compras y gasto total</p>
                </div>
                <button className="btn-download" style={{ width: 'auto' }} onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Generando...' : '⬇ Descargar PDF'}
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando datos...</div>
            ) : (
                <div className="table-card">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Documento</th>
                            <th>Compras</th>
                            <th>Total gastado</th>
                            <th>Ticket medio</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data?.customers.map(r => (
                            <tr key={r.rank}>
                                <td>{r.rank}</td>
                                <td>{r.name}</td>
                                <td>{r.identity_document}</td>
                                <td>{r.total_purchases}</td>
                                <td>{fmtEur(r.total_spent)}</td>
                                <td>{fmtEur(r.avg_order)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}