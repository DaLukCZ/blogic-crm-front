<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/auth'
import { onMounted, ref } from 'vue'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showChangePasswordModal = ref(false)
const passwordForm = ref({
    newPassword: '',
    confirmPassword: ''
})
const passwordError = ref('')
const showPasswordNew = ref(false)
const showPasswordConfirm = ref(false)
const showSuccessPasswordChangeModal = ref(false)

const showDropdown = ref(false)
const isTouch = ref(false)

onMounted(async () => {
    try {
        if (!auth.user) {
            await auth.fetchUser()
        }
        isTouch.value = window.matchMedia('(hover: none)').matches
    } catch (e) {
        console.error('Nepodařilo se načíst uživatele.', e)
        router.push('/login')
    }
})

function toggleDropdown() {
    if (isTouch.value) {
        showDropdown.value = !showDropdown.value
    }
}

const isActive = (path) => {
    if (path === '/contracts') return route.path.startsWith('/contracts')
    if (path === '/clients') return route.path.startsWith('/clients')
    return route.path === path
}

const logout = () => {
    auth.logout()
    window.location.href = '/login'
}

function openChangePasswordModal() {
    passwordError.value = ''
    passwordForm.value = { newPassword: '', confirmPassword: '' }
    showPasswordNew.value = false
    showPasswordConfirm.value = false
    showChangePasswordModal.value = true
    showDropdown.value = false
}

function closeChangePasswordModal() {
    showChangePasswordModal.value = false
}

function closeSuccessPasswordChangeModal() {
    showSuccessPasswordChangeModal.value = false
}

async function submitChangePassword() {
    passwordError.value = ''

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordError.value = 'Nová hesla se neshodují.'
        return
    }

    try {
        await api(`/api/Users/${auth.user.id}/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword: passwordForm.value.newPassword })
        })

        showSuccessPasswordChangeModal.value = true
        closeChangePasswordModal()
    } catch (e) {
        if (e.response?.status === 401) {
            passwordError.value = 'Nejste přihlášen/a.'
        } else if (e.response?.status === 403) {
            passwordError.value = 'Nemáte oprávnění měnit heslo tohoto uživatele.'
        } else if (e.response?.status === 404) {
            passwordError.value = 'Uživatel nebyl nalezen.'
        } else {
            passwordError.value = 'Nepodařilo se změnit heslo. Zkontrolujte údaje a zkuste to znovu.'
        }
        console.error(e)
    }
}
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 text-gray-800">
        <!-- Navigace -->
        <nav v-if="auth.user" class="bg-white/80 backdrop-blur-sm shadow-md border-b border-cyan-300">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 class="text-xl font-bold text-cyan-700 tracking-wide" style="font-family: 'Poppins', sans-serif;">
                    Blogic CRM
                </h1>

                <div class="flex-grow flex justify-center gap-8">
                    <router-link v-if="['Admin', 'Poradce'].includes(auth.user.role)" to="/users/list"
                        class="text-sm font-semibold text-cyan-800 hover:text-cyan-600 transition"
                        :class="{ 'text-cyan-600 font-semibold': isActive('/users/list') }">
                        Uživatelé
                    </router-link>

                    <router-link to="/contracts"
                        class="text-sm font-semibold text-cyan-800 hover:text-cyan-600 transition"
                        :class="{ 'text-cyan-600 font-semibold': isActive('/contracts') }">
                        Smlouvy
                    </router-link>
                </div>

                <!-- Dropdown -->
                <div class="relative z-100" @mouseenter="!isTouch && (showDropdown = true)"
                    @mouseleave="!isTouch && (showDropdown = false)">
                    <div class="text-sm font-medium text-cyan-800 hover:text-cyan-600 transition duration-200 cursor-pointer"
                        @click="toggleDropdown">
                        {{ auth.user.username }} - {{ auth.user.role }}
                    </div>

                    <div v-show="showDropdown"
                        class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg transition-all duration-200 z-100">
                        <router-link :to="`/users/${auth.user.id}`"
                            class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                            @click="showDropdown = false">
                            Detail
                        </router-link>

                        <div @click="openChangePasswordModal"
                            class="block px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-100 cursor-pointer transition">
                            Změnit heslo
                        </div>

                        <div @click="logout"
                            class="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 cursor-pointer transition">
                            Odhlásit
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Modal: změna hesla -->
        <div v-if="showChangePasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
                <h3 class="text-xl font-semibold mb-4 text-cyan-700">Změna hesla</h3>

                <form @submit.prevent="submitChangePassword" class="space-y-4 text-left">
                    <div class="relative">
                        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Nové heslo</label>
                        <input :type="showPasswordNew ? 'text' : 'password'" id="newPassword"
                            v-model="passwordForm.newPassword" required minlength="6" autocomplete="new-password"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <button type="button" @click="showPasswordNew = !showPasswordNew"
                            class="absolute top-1/2 right-4 -translate-y-1/2 flex items-center text-cyan-600 hover:text-cyan-800 transition duration-200 pt-5"
                            tabindex="-1" aria-label="Zobrazit nebo skrýt nové heslo">
                            <font-awesome-icon :icon="showPasswordNew ? 'fa-eye-slash' : 'fa-eye'" />
                        </button>
                    </div>

                    <div class="relative">
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Potvrzení
                            hesla</label>
                        <input :type="showPasswordConfirm ? 'text' : 'password'" id="confirmPassword"
                            v-model="passwordForm.confirmPassword" required minlength="6" autocomplete="new-password"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <button type="button" @click="showPasswordConfirm = !showPasswordConfirm"
                            class="absolute top-1/2 right-4 -translate-y-1/2 flex items-center text-cyan-600 hover:text-cyan-800 transition duration-200 pt-5"
                            tabindex="-1" aria-label="Zobrazit nebo skrýt potvrzení hesla">
                            <font-awesome-icon :icon="showPasswordConfirm ? 'fa-eye-slash' : 'fa-eye'" />
                        </button>
                    </div>

                    <div class="flex justify-between mt-6 pt-4">
                        <button type="button" @click="closeChangePasswordModal"
                            class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition">
                            Zrušit
                        </button>
                        <button type="submit"
                            class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow hover:brightness-110 transition">
                            Uložit
                        </button>
                    </div>
                </form>

                <p v-if="passwordError" class="mt-4 text-red-600 text-sm">{{ passwordError }}</p>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showSuccessPasswordChangeModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
                <h3 class="text-xl font-semibold mb-4 text-cyan-700">Změna hesla</h3>
                <p class="text-gray-600 mb-6">Vaše heslo bylo úspěšně změněno.</p>
                <button @click="closeSuccessPasswordChangeModal"
                    class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow hover:brightness-110">
                    OK
                </button>
            </div>
        </div>

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

<style scoped>
@keyframes slow-fade-in {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slow-fade-in {
    animation: slow-fade-in 0.8s ease-out forwards;
}
</style>
