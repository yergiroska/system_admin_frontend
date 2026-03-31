import './Pagination.css'

export default function Pagination({ total, perPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(total / perPage)

    if (totalPages <= 1) return null

    const getPages = () => {
        const pages = []
        const delta = 2

        pages.push(1)

        const rangeStart = Math.max(2, currentPage - delta)
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

        if (rangeStart > 2) pages.push('...')

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i)
        }

        if (rangeEnd < totalPages - 1) pages.push('...')

        if (totalPages > 1) pages.push(totalPages)

        return pages
    }

    return (
        <div className="pagination">
            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ←
            </button>

            {getPages().map((page, index) =>
                page === '...' ? (
                    <span key={`dots-${index}`} className="page-dots">...</span>
                ) : (
                    <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                className="page-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                →
            </button>

            <span className="page-info">
                Página {currentPage} de {totalPages} — {total} registros
            </span>
        </div>
    )
}