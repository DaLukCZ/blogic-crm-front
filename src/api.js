export async function api(path, options = {}) {
    const baseUrl = 'https://localhost:7046' // uprav dle potřeby

    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Nesprávné uživatelské jméno nebo heslo.')
    }

    if (response.status === 204) {
        return null
    }

    return await response.json()
}
