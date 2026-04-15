import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import '../Companies/Companies.css'
import './MLPage.css'

const Tooltip = ({ text, children }) => (
    <span className="tooltip-wrapper">
        {children}
        <span className="tooltip-box">{text}</span>
    </span>
)

const SEGMENT_META = {
    VIP: {
        emoji: '⭐',
        color: 'vip',
        action: 'Premia su fidelidad con descuentos exclusivos o acceso anticipado a nuevos productos.',
    },
    Medio: {
        emoji: '📈',
        color: 'medio',
        action: 'Tienen potencial sin explotar. Una campaña personalizada puede convertirlos en VIP.',
    },
    Dormido: {
        emoji: '💤',
        color: 'dormido',
        action: 'Reactívalos con una oferta especial o un recordatorio de su última compra.',
    },
}

export default function MLPage() {
    const [prediction, setPrediction] = useState(null)
    const [predictionForm, setPredictionForm] = useState({
        unit_price: '',
        quantity: '',
        company_product_id: '',
    })
    const [companies, setCompanies] = useState([])
    const [companyProducts, setCompanyProducts] = useState([])
    const [selectedCompany, setSelectedCompany] = useState('')

    const [predAnalysis, setPredAnalysis] = useState('')
    const [predLoading, setPredLoading] = useState(false)

    const [segments, setSegments] = useState(null)
    const [segmentRec, setSegmentRec] = useState('')
    const [segLoading, setSegLoading] = useState(false)
    const [activeSegment, setActiveSegment] = useState(null)

    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [chatLoading, setChatLoading] = useState(false)
    const chatEndRef = useRef(null)

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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatHistory])

    const handleCompanyChange = async (companyId) => {
        setSelectedCompany(companyId)
        setPredictionForm({ unit_price: '', quantity: '', company_product_id: '' })
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
                `/ai/analyze-prediction?unit_price=${predictionForm.unit_price}&quantity=${predictionForm.quantity}&predicted_total=${res.data.predicted_total}&company_product_id=${predictionForm.company_product_id}&mae=${res.data.model_mae}`
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
            const s = segments.segments
            const res = await api.post(
                `/ai/analyze-segments?vip_count=${s.VIP.total_customers}&medio_count=${s.Medio.total_customers}&dormido_count=${s.Dormido.total_customers}`
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

        const newHistory = [...chatHistory, { role: 'user', content: userMsg }]
        setChatHistory(newHistory)
        setChatLoading(true)

        try {
            const res = await api.post('/ai/chat', {
                message: userMsg,
                history: chatHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            })

            setChatHistory([...newHistory, { role: 'assistant', content: res.data.response }])
        } catch (err) {
            console.error(err)
        } finally {
            setChatLoading(false)
        }
    }

    const seg = segments?.segments

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ML & IA</h1>
                    <p className="page-subtitle">
                        Anticipa ventas y conoce a fondo el comportamiento de tus clientes con inteligencia artificial
                    </p>
                </div>
            </div>

            {/* Métricas del modelo en lenguaje humano */}
            {modelInfo && (
                <div className="ml-info-grid">
                    <div className="ml-info-card">
                        <div className="ml-info-label">
                            ¿Qué hace?
                        </div>
                        <div className="ml-info-value" style={{ fontSize: '15px' }}>
                            Predice el total de una compra antes de realizarla
                        </div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">
                            Precisión del modelo{' '}
                            <Tooltip text="De cada 100 predicciones, el modelo acierta aproximadamente en este porcentaje. Por encima del 80% se considera bueno.">
                                <span className="tooltip-icon">?</span>
                            </Tooltip>
                        </div>
                        <div className="ml-info-value blue">{Math.round(modelInfo.r2_score * 100)}%</div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">
                            Margen de error medio{' '}
                            <Tooltip text="En promedio, la predicción puede desviarse esta cantidad en euros respecto al total real.">
                                <span className="tooltip-icon">?</span>
                            </Tooltip>
                        </div>
                        <div className="ml-info-value amber">±€{modelInfo.mae}</div>
                    </div>
                    <div className="ml-info-card">
                        <div className="ml-info-label">
                            Variables que usa{' '}
                            <Tooltip text="El modelo analiza el precio unitario, la cantidad y el producto para calcular la predicción.">
                                <span className="tooltip-icon">?</span>
                            </Tooltip>
                        </div>
                        <div className="ml-info-value green">Precio · Cantidad · Producto</div>
                    </div>
                </div>
            )}

            <div className="ml-grid">
                {/* Predicción */}
                <div className="ml-card">
                    <h2 className="ml-card-title">🔮 Predicción de compra</h2>
                    <p className="ml-card-desc">
                        Selecciona una empresa, un producto y una cantidad para estimar el total antes de registrar la compra.
                    </p>
                    <div className="form-group">
                        <label>Empresa</label>
                        <select value={selectedCompany} onChange={(e) => handleCompanyChange(e.target.value)}>
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
                            <div className="prediction-sub">Total estimado — margen de error: ±€{prediction.model_mae}</div>
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
                    <p className="ml-card-desc" style={{ textAlign: 'left' }}>
                        Clasificación automática basada en:
                        <strong>frecuencia de compra</strong>,
                        <strong>gasto total</strong> y <strong>actividad reciente</strong>.
                        <br/>
                        <br/>
                        <Tooltip text="Usamos el método RFM (Recency, Frequency, Monetary): cuánto tiempo hace que compró, con qué frecuencia y cuánto ha gastado. Cada variable tiene un peso: gasto 40%, frecuencia 30%, recencia 30%.">
                            <strong style={{textAlign: 'center' }}>¿Cómo funciona?</strong>
                            <span className="tooltip-icon">?</span>
                        </Tooltip>
                    </p>

                    {seg && (
                        <>
                            <div className="segment-grid">
                                {['VIP', 'Medio', 'Dormido'].map(name => {
                                    const data = seg[name]
                                    const meta = SEGMENT_META[name]
                                    return (
                                        <div
                                            key={name}
                                            className={`segment-item ${meta.color} ${activeSegment === name ? 'active' : ''}`}
                                            onClick={() => setActiveSegment(activeSegment === name ? null : name)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="segment-emoji">{meta.emoji}</div>
                                            <div className="segment-count">{data.total_customers}</div>
                                            <div className="segment-label">{name}</div>
                                            <div className="segment-avg">€{data.avg_spent.toLocaleString()} promedio</div>
                                            <div className="segment-purchases">{data.avg_purchases} compras/cliente</div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Panel expandible por segmento */}
                            {activeSegment && (
                                <div className={`segment-detail ${SEGMENT_META[activeSegment].color}`}>
                                    <div className="segment-detail-header">
                                        <strong>{SEGMENT_META[activeSegment].emoji} {activeSegment}</strong>
                                        <span className="segment-criteria">{seg[activeSegment].criteria}</span>
                                    </div>
                                    <div className="segment-action">
                                        💡 <strong>Acción recomendada:</strong> {SEGMENT_META[activeSegment].action}
                                    </div>
                                    <div className="segment-customers-list">
                                        <div className="segment-customers-title">Top clientes de este segmento</div>
                                        {seg[activeSegment].customers.slice(0, 5).map(c => (
                                            <div key={c.id} className="segment-customer-row">
                                                <span className="customer-name">{c.name}</span>
                                                <span className="customer-meta">
                                                    {c.total_purchases} compras · €{c.total_spent.toLocaleString()}
                                                    {c.days_since_last_purchase !== undefined && (
                                                        <> · hace {c.days_since_last_purchase} días</>
                                                    )}
                                                </span>
                                                {c.rfm_score !== undefined && (
                                                    <span className="customer-score">Score: {c.rfm_score}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="btn-primary" onClick={handleAnalyzeSegments} disabled={segLoading} style={{ marginTop: '12px' }}>
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
                    <div ref={chatEndRef} />
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
