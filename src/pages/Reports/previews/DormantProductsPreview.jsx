import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import Pagination from '../../../components/Pagination'
import '../../Companies/Companies.css'
import '../Reports.css'
import '../ReportPreview.css'

const PER_PAGE = 15

export default function DormantProductsPreview() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        api.get('/reports/dormant-products/preview')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await api.get('/reports/dormant-products', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_productos_dormidos.pdf')
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

    const paginated = data?.products.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    ) || []

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/reports')}>← Volver</button>
                    <h1 className="page-title">😴 Productos sin movimiento</h1>
                    <p className="page-subtitle">Productos que no tienen compras registradas</p>
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
                            <div className="preview-summary-label">Productos sin movimiento</div>
                            <div className="preview-summary-value" style={{ color: '#f59e0b' }}>
                                {data.total}
                            </div>
                        </div>
                    </div>

                    <div className="table-card">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Descripción</th>
                                <th>Creado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.map(r => (
                                <tr key={r.rank}>
                                    <td>{r.rank}</td>
                                    <td>{r.name}</td>
                                    <td>{r.description}</td>
                                    <td>{r.created_at}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <Pagination
                            total={data.products.length}
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