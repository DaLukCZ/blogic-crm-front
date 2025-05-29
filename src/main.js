import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'

import { createPinia } from 'pinia'
import { useAuthStore } from '@/auth'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import LoginPage from './pages/LoginPage.vue'
import UsersPage from './pages/UsersPage.vue'
import AddUserPage from './pages/AddUserPage.vue'
import ContractsPage from './pages/ContractsPage.vue'
import AddContractPage from './pages/AddContractPage.vue'
import ContractDetailPage from './pages/ContractDetailPage.vue'
import ClientDetailPage from './pages/UserDetailPage.vue'

library.add(fas)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/users/add', component: AddUserPage },
    { path: '/users/list', component: UsersPage },
    { path: '/contracts', component: ContractsPage },
    { path: '/contracts/add', component: AddContractPage },
    { path: '/contracts/edit/:id', component: AddContractPage, props: true },
    { path: '/contracts/:id', component: ContractDetailPage, props: true },
    { path: '/users/:id', component: ClientDetailPage, props: true },
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

router.beforeEach(async (to, from, next) => {
    const publicPages = ['/login']
    const auth = useAuthStore()

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
