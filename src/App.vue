<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/auth'
import { onMounted } from 'vue'

const route = useRoute()
const auth = useAuthStore()

onMounted(() => {
    auth.fetchUser()
})

const isActive = (path) => {
    if (path === '/contracts') return route.path.startsWith('/contracts')
    if (path === '/clients') return route.path.startsWith('/clients')
    return route.path === path
}

const logout = () => {
    auth.logout()
    window.location.href = '/login'
}
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 text-gray-800">

        <nav v-if="auth.user" class="bg-white/80 backdrop-blur-sm shadow-md border-b border-cyan-300">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <!-- Logo -->
                <h1 class="text-xl font-bold text-cyan-700 tracking-wide" style="font-family: 'Poppins', sans-serif;">
                    Blogic CRM
                </h1>

                <!-- Navigace -->
                <div class="flex items-center gap-8">
                    <RouterLink to="/user/list"
                        :class="['text-sm font-semibold transition duration-200', isActive('/user/list') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Uživatelé
                    </RouterLink>
                    <RouterLink to="/user/add"
                        :class="['text-sm font-semibold transition duration-200', isActive('/user/add') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Přidat uživatele
                    </RouterLink>
                    <RouterLink to="/contracts"
                        :class="['text-sm font-semibold transition duration-200', isActive('/contracts') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Smlouvy
                    </RouterLink>
                    <RouterLink to="/contracts/add"
                        :class="['text-sm font-semibold transition duration-200', isActive('/contracts/add') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Přidat smlouvu
                    </RouterLink>
                    <RouterLink to="/clients/id"
                        :class="['text-sm font-semibold transition duration-200', isActive('/clients/id') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Klient detail
                    </RouterLink>
                    <RouterLink to="/contracts/id"
                        :class="['text-sm font-semibold transition duration-200', isActive('/contracts/id') ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-600']">
                        Smlouva detail
                    </RouterLink>
                </div>

                <!-- Uživatelský dropdown -->
                <div class="relative group cursor-pointer z-100">
                    <div class="text-sm font-medium text-cyan-800 hover:text-cyan-600 transition duration-200">
                        {{ auth.user.username }} - {{ auth.user.role }}
                    </div>
                    <div
                        class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-100">
                        <div class="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer">
                            Detail
                        </div>
                        <div @click="logout"
                            class="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition duration-150 cursor-pointer">
                            Odhlásit
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Obsah -->
        <main class="flex-grow">
            <RouterView />
        </main>

        <!-- Footer -->
        <footer
            class="bg-white/80 backdrop-blur-sm border-t border-cyan-300 text-center text-sm text-cyan-800 py-6 shadow-inner">
            © {{ new Date().getFullYear() }} Blogic CRM
        </footer>
    </div>
</template>
