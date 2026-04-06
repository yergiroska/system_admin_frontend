import {NavLink} from 'react-router-dom'
import {getUser, logout} from '../services/authService'
import './Sidebar.css'

export default function Sidebar() {
    const user = getUser()

    const links = [
        {to: '/dashboard', label: 'Dashboard', icon: '📊'},
        {to: '/companies', label: 'Empresas', icon: '🏢'},
        {to: '/products', label: 'Productos', icon: '📦'},
        {to: '/customers', label: 'Clientes', icon: '👥'},
        {to: '/purchases', label: 'Compras', icon: '🛒'},
        {to: '/reports', label: 'Reportes', icon: '📄'},
        {to: '/ml', label: 'ML & IA', icon: '🤖'},
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Sistema Compra de Productos</h2>
            </div>
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({isActive}) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout}>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}