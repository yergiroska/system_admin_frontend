import api from './api'

export const login = async (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify({
        name: response.data.user_name,
        email: response.data.user_email
    }))

    return response.data
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
}

export const getUser = () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
    return !!localStorage.getItem('token')
}