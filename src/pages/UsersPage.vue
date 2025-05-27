<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
    if (auth.user?.role === 'Klient') {
        router.replace('/contracts')
    } else {
        fetchUsers()
    }
})

const users = ref([])
const selectedRole = ref('Vše')
const searchQuery = ref('')
const deleteModalVisible = ref(false)
const userToDelete = ref(null)

const editingId = ref(null)
const editedUser = ref({})

const fetchUsers = async () => {
    try {
        const data = await api('/api/Users')
        users.value = data.map(user => {
            const { age, gender } = getAgeAndGender(user.ssn)
            return {
                ...user,
                age,
                gender,
                role: user.role?.name ?? '-'
            }
        })
    } catch (err) {
        console.error('Chyba při načítání uživatelů:', err.message)
    }
}

const getAgeAndGender = (ssn) => {
    if (!ssn) return { age: '-', gender: '-' }
    const clean = ssn.replace('/', '')
    const year = parseInt(clean.substring(0, 2))
    let month = parseInt(clean.substring(2, 4))
    const day = parseInt(clean.substring(4, 6))
    const gender = month > 50 ? 'Žena' : 'Muž'
    if (month > 50) month -= 50
    const fullYear = year + (year < 50 ? 2000 : 1900)
    const birthDate = new Date(fullYear, month - 1, day)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return { age, gender }
}

const formatSSN = (ssn) => {
    if (!ssn || ssn.length < 7) return ssn
    return ssn.slice(0, 6) + '/' + ssn.slice(6)
}

const formatPhone = (code, number) => {
    if (!number) return ''
    return `${code} ${number.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim()}`
}

const filteredUsers = computed(() =>
    users.value.filter(user => {
        const roleMatch = selectedRole.value === 'Vše' || user.role === selectedRole.value
        const searchMatch = [user.username, user.firstName, user.lastName, user.email]
            .some(field => field?.toLowerCase().includes(searchQuery.value.toLowerCase()))
        return roleMatch && searchMatch
    })
)

const startEdit = (user) => {
    editingId.value = user.id
    editedUser.value = { ...user }
}

const cancelEdit = () => {
    editingId.value = null
    editedUser.value = {}
}

const saveEdit = async () => {
    try {
        const payload = {
            id: editedUser.value.id,
            username: editedUser.value.username,
            passwordHash: editedUser.value.passwordHash ?? '',
            firstName: editedUser.value.firstName,
            lastName: editedUser.value.lastName,
            email: editedUser.value.email,
            countryCode: editedUser.value.countryCode,
            number: editedUser.value.number,
            ssn: editedUser.value.ssn,
            roleId: editedUser.value.roleId
        }

        await api(`/api/Users/${editingId.value}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })

        cancelEdit()
        await fetchUsers()
    } catch (err) {
        console.error('Chyba při ukládání:', err.message)
    }
}

const confirmDelete = (user) => {
    userToDelete.value = user
    deleteModalVisible.value = true
}

const deleteUser = async () => {
    try {
        await api(`/api/Users/${userToDelete.value.id}`, {
            method: 'DELETE'
        })
        deleteModalVisible.value = false
        userToDelete.value = null
        await fetchUsers()
    } catch (err) {
        console.error('Chyba při mazání:', err.message)
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-[1400px] rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-700">
            <h2 class="text-4xl font-bold text-center mb-8">Seznam uživatelů</h2>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6 mb-10 py-6">
                <input v-model="searchQuery" type="text" placeholder="Vyhledat uživatele podle jména, e-mailu..."
                    class="px-6 py-4 w-full md:w-1/2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400 bg-white" />
                <select v-model="selectedRole"
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400 bg-white">
                    <option value="Vše">Všechny role</option>
                    <option value="Klient">Klient</option>
                    <option value="Poradce">Poradce</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full table-auto border border-cyan-200 rounded-xl shadow text-sm md:text-base">
                    <thead class="bg-cyan-100 text-cyan-800 uppercase">
                        <tr>
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Uživatel</th>
                            <th class="px-4 py-3">Jméno</th>
                            <th class="px-4 py-3">E-mail</th>
                            <th class="px-4 py-3">Telefon</th>
                            <th class="px-4 py-3">Rodné číslo</th>
                            <th class="px-4 py-3">Věk</th>
                            <th class="px-4 py-3">Pohlaví</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3 text-center">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filteredUsers" :key="user.id"
                            class="border-b border-cyan-100 hover:bg-cyan-50 bg-white transition">
                            <td class="px-4 py-3">{{ user.id }}</td>

                            <template v-if="editingId === user.id">
                                <td class="px-4 py-3">
                                    <input v-model="editedUser.username"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <input v-model="editedUser.firstName" placeholder="Jméno"
                                            class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                        <input v-model="editedUser.lastName" placeholder="Příjmení"
                                            class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <input v-model="editedUser.email"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <input v-model="editedUser.countryCode"
                                            class="w-20 px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                        <input v-model="editedUser.number"
                                            class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <input v-model="editedUser.ssn"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">–</td>
                                <td class="px-4 py-3">–</td>
                                <td class="px-4 py-3">
                                    <select v-model="editedUser.roleId"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white">
                                        <option :value="1">Klient</option>
                                        <option :value="2">Poradce</option>
                                        <option :value="3">Admin</option>
                                    </select>
                                </td>
                                <td class="px-4 py-3 flex justify-center gap-2">
                                    <button @click="saveEdit"
                                        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Uložit</button>
                                    <button @click="cancelEdit"
                                        class="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Zrušit</button>
                                </td>
                            </template>

                            <template v-else>
                                <td class="px-4 py-3 font-semibold">{{ user.username }}</td>
                                <td class="px-4 py-3">{{ user.firstName }} {{ user.lastName }}</td>
                                <td class="px-4 py-3">{{ user.email }}</td>
                                <td class="px-4 py-3">{{ formatPhone(user.countryCode, user.number) }}</td>
                                <td class="px-4 py-3">{{ formatSSN(user.ssn) }}</td>
                                <td class="px-4 py-3">{{ user.age }}</td>
                                <td class="px-4 py-3">{{ user.gender }}</td>
                                <td class="px-4 py-3">{{ user.role }}</td>
                                <td class="px-4 py-3 flex justify-center gap-2">
                                    <button @click="startEdit(user)"
                                        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Upravit</button>
                                    <button @click="confirmDelete(user)"
                                        class="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Smazat</button>
                                </td>
                            </template>
                        </tr>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="10" class="text-center py-6 text-gray-500">Žádní uživatelé nenalezeni.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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
    animation: slow-fade-in 1.2s ease-out forwards;
}
</style>
