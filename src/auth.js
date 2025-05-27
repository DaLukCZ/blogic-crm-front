import { defineStore } from 'pinia'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
    }),

    actions: {
        async login(username, password) {
            const res = await api('/api/Auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            })

            this.token = res.token
            localStorage.setItem('token', res.token)

            this.user = await api('/api/Auth/me')
        },

        async fetchUser() {
            if (this.token && !this.user) {
                try {
                    this.user = await api('/api/Auth/me')
                } catch (err) {
                    this.logout()
                }
            }
        },

        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
        }
    }
})
