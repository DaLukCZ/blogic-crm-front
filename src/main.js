import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'

import { createPinia } from 'pinia'
import { useAuthStore } from '@/auth'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Pages
import LoginPage from './pages/LoginPage.vue'
import UsersPage from './pages/UsersPage.vue'
import AddUserPage from './pages/AddUserPage.vue'
import ContractsPage from './pages/ContractsPage.vue'
import AddContractPage from './pages/AddContractPage.vue'
import ContractDetailPage from './pages/ContractDetailPage.vue'
import ClientDetailPage from './pages/ClientDetailPage.vue'

library.add(fas)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/user/add', component: AddUserPage },
    { path: '/user/list', component: UsersPage },
    { path: '/contracts', component: ContractsPage },
    { path: '/contracts/add', component: AddContractPage },
    { path: '/contracts/id', component: ContractDetailPage, props: true },
    { path: '/clients/id', component: ClientDetailPage, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')

// 🔒 Route Guard
router.beforeEach(async (to, from, next) => {
    const publicPages = ['/login']
    const auth = useAuthStore()

    // Pokud máme token ale nemáme načteného uživatele
    await auth.fetchUser()

    const authRequired = !publicPages.includes(to.path)

    if (authRequired && !auth.user) {
        return next('/login')
    }

    if (to.path === '/login' && auth.user) {
        return next('/contracts')
    }

    next()
})
