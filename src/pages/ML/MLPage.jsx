import { useState, useEffect } from 'react'
import api from '../../services/api'
import '../Companies/Companies.css'
import './MLPage.css'

export default function MLPage() {
    const [products, setProducts] = useState([])
    const [prediction, setPrediction] = useState(null)
    const [predictionForm, setPredictionForm] = useState({
        unit_price: '',
        quantity: '',
        company_product_id: '',
    })
    const [companies, setCompanies] = useState([])
    const [companyProducts, setCompanyProducts] = useState([])
    const [selectedCompany, setSelectedCompany] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)

    const [predAnalysis, setPredAnalysis] = useState('')
    const [predLoading, setPredLoading] = useState(false)

    const [segments, setSegments] = useState(null)
    const [segmentRec, setSegmentRec] = useState('')
    const [segLoading, setSegLoading] = useState(false)

    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [chatLoading, setChatLoading] = useState(false)

    const [modelInfo, setModelInfo] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modelRes, segRes, companiesRes] = await Promise.all([
                    api.get('/ml/model-info'),
                    api.get('/ml/customer-segments'),
                    api.get('/companies/'),
                ])
                setModelInfo(modelRes.data)
                setSegments(segRes.data)
                setCompanies(companiesRes.data)
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [])

    const handleCompanyChange = async (companyId) => {
        setSelectedCompany(companyId)
        setSelectedProduct(null)
        setPredictionForm({ ...predictionForm, unit_price: '', company_product_id: '' })
        if (!companyId) return
        try {
            const res = await api.get(`/company-products/company/${companyId}`)
            setCompanyProducts(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleProductChange = (companyProductId) => {
        const product = companyProducts.find(p => p.company_product_id === parseInt(companyProductId))
        if (product) {
            setSelectedProduct(product)
            setPredictionForm({
                ...predictionForm,
                company_product_id: companyProductId,
                unit_price: product.price,
            })
        }
    }

    const handlePredict = async () => {
        if (!predictionForm.unit_price || !predictionForm.quantity || !predictionForm.company_product_id) return
        setPredLoading(true)
        setPredAnalysis('')
        try {
            const res = await api.post('/ml/predict', {
                unit_price: parseFloat(predictionForm.unit_price),
                quantity: parseInt(predictionForm.quantity),
                company_product_id: parseInt(predictionForm.company_product_id),
            })
            setPrediction(res.data)

            const analysisRes = await api.post(
                `/ai/analyze-prediction?unit_price=${predictionForm.unit_price}&quantity=${predictionForm.quantity}&predicted_total=${res.data.predicted_total}&product_name=Producto%20${predictionForm.company_product_id}`
            )
            setPredAnalysis(analysisRes.data.analysis)
        } catch (err) {
            console.error(err)
        } finally {
            setPredLoading(false)
        }
    }

    const handleAnalyzeSegments = async () => {
        if (!segments) return
        setSegLoading(true)
        try {
            const res = await api.post(
                `/ai/analyze-segments?vip_count=${segments.VIP.total_customers}&medio_count=${segments.Medio.total_customers}&dormido_count=${segments.Dormido.total_customers}`
            )
            setSegmentRec(res.data.recommendations)
        } catch (err) {
            console.error(err)
        } finally {
            setSegLoading(false)
        }
    }

    const handleChat = async () => {
        if (!chatMessage.trim()) return
        const userMsg = chatMessage
        setChatMessage('')
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
        setChatLoading(true)
        try {
            const res = await api.post('/ai/chat', { message: userMsg })
            setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.response }])
        } catch (err) {
            console.error(err)
        } finally {
            setChatLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ML & IA</h1>
                    <p className="page-subtitle">Machine Learning e Inteligencia Artificial</p>
                </div>
            </div>

            {/* Info del modelo */}
            {modelInfo && (
                <div className="ml-info-grid">
                    <div className="ml-info-card">
                        <div className="ml-info-label">Modelo</div>
                        <div className="ml-info-value">Regresión Lineal</div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">R² Score</div>
                        <div className="ml-info-value blue">{modelInfo.r2_score}</div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">Error promedio</div>
                        <div className="ml-info-value amber">€{modelInfo.mae}</div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">Features</div>
                        <div className="ml-info-value green">3 variables</div>
                    </div>
                </div>
            )}

            <div className="ml-grid">
                {/* Predicción */}
                <div className="ml-card">
                    <h2 className="ml-card-title">🔮 Predicción de compra</h2>
                    <div className="form-group">
                        <label>Empresa</label>
                        <select
                            value={selectedCompany}
                            onChange={(e) => handleCompanyChange(e.target.value)}
                        >
                            <option value="">Seleccionar empresa...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Producto</label>
                        <select
                            value={predictionForm.company_product_id}
                            onChange={(e) => handleProductChange(e.target.value)}
                            disabled={!selectedCompany}
                        >
                            <option value="">Seleccionar producto...</option>
                            {companyProducts.map(p => (
                                <option key={p.company_product_id} value={p.company_product_id}>
                                    {p.product_name} — €{p.price.toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Precio unitario (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Se autocompleta al seleccionar producto"
                            value={predictionForm.unit_price}
                            onChange={(e) => setPredictionForm({ ...predictionForm, unit_price: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Cantidad</label>
                        <input
                            type="number"
                            placeholder="Ej: 10"
                            value={predictionForm.quantity}
                            onChange={(e) => setPredictionForm({ ...predictionForm, quantity: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary" onClick={handlePredict} disabled={predLoading}>
                        {predLoading ? 'Calculando...' : 'Predecir total'}
                    </button>

                    {prediction && (
                        <div className="prediction-result">
                            <div className="prediction-value">€{prediction.predicted_total}</div>
                            <div className="prediction-sub">Total predicho — margen de error: ±€{prediction.model_mae}</div>
                        </div>
                    )}

                    {predAnalysis && (
                        <div className="ai-analysis">
                            <div className="ai-label">🤖 Análisis IA</div>
                            <p>{predAnalysis}</p>
                        </div>
                    )}
                </div>

                {/* Segmentación */}
                <div className="ml-card">
                    <h2 className="ml-card-title">👥 Segmentación de clientes</h2>
                    {segments && (
                        <>
                            <div className="segment-grid">
                                <div className="segment-item vip">
                                    <div className="segment-count">{segments.VIP.total_customers}</div>
                                    <div className="segment-label">VIP</div>
                                    <div className="segment-avg">€{segments.VIP.avg_spent} promedio</div>
                                </div>
                                <div className="segment-item medio">
                                    <div className="segment-count">{segments.Medio.total_customers}</div>
                                    <div className="segment-label">Medio</div>
                                    <div className="segment-avg">€{segments.Medio.avg_spent} promedio</div>
                                </div>
                                <div className="segment-item dormido">
                                    <div className="segment-count">{segments.Dormido.total_customers}</div>
                                    <div className="segment-label">Dormido</div>
                                    <div className="segment-avg">€{segments.Dormido.avg_spent} promedio</div>
                                </div>
                            </div>
                            <button className="btn-primary" onClick={handleAnalyzeSegments} disabled={segLoading}>
                                {segLoading ? 'Analizando...' : '🤖 Analizar con IA'}
                            </button>
                        </>
                    )}

                    {segmentRec && (
                        <div className="ai-analysis">
                            <div className="ai-label">🤖 Recomendaciones IA</div>
                            <p>{segmentRec}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat */}
            <div className="ml-card chat-card">
                <h2 className="ml-card-title">💬 Asistente de negocio</h2>
                <div className="chat-history">
                    {chatHistory.length === 0 && (
                        <div className="chat-empty">Pregúntame sobre el negocio — ventas, clientes, productos...</div>
                    )}
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.role}`}>
                            <div className="chat-bubble">{msg.content}</div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="chat-msg assistant">
                            <div className="chat-bubble typing">Escribiendo...</div>
                        </div>
                    )}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Ej: ¿Cuáles son los productos más vendidos?"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    />
                    <button className="btn-primary" onClick={handleChat} disabled={chatLoading}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}