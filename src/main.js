import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory, createRouter } from 'vue-router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import LoginPage from './pages/LoginPage.vue'
import UsersPage from './pages/UsersPage.vue'
import AddUserPage from './pages/AddUserPage.vue'

library.add(fas)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/user/add', component: AddUserPage },
    { path: '/user/list', component: UsersPage },
];


const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
