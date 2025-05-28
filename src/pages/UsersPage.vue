<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/auth'

const router = useRouter()
const auth = useAuthStore()

const users = ref([])
const roles = ref([])
const selectedRole = ref('Vše')
const searchQuery = ref('')
const deleteModalVisible = ref(false)
const userToDelete = ref(null)
const editingId = ref(null)
const editedUser = ref({})
const errorsEdit = ref({})

onMounted(() => {
    if (auth.user?.role === 'klient') {
        router.replace('/contracts')
    } else {
        fetchUsers()
        fetchRoles()
    }
})

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

const fetchRoles = async () => {
    try {
        roles.value = await api('/api/Roles')
    } catch (err) {
        console.error('Chyba při načítání rolí:', err.message)
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
    errorsEdit.value = {}
}

const cancelEdit = () => {
    editingId.value = null
    editedUser.value = {}
    errorsEdit.value = {}
}

function isValidSsnFormat(ssn) {
    return /^\d{6}\/?\d{3,4}$/.test(ssn)
}

function isDivisibleBy11Rule(ssn) {
    const clean = ssn.replace('/', '')
    if (!/^\d+$/.test(clean)) return false
    return parseInt(clean) % 11 === 0
}

const saveEdit = async () => {
    const u = editedUser.value
    const err = {}

    if (!u.username?.trim()) err.username = 'Uživatelské jméno je povinné.'
    if (!u.firstName?.trim()) err.firstName = 'Jméno je povinné.'
    if (!u.lastName?.trim()) err.lastName = 'Příjmení je povinné.'
    if (!u.email?.trim()) err.email = 'E-mail je povinný.'
    if (!u.countryCode?.trim() || u.countryCode.length > 5) err.countryCode = 'Kód země max 5 znaků.'
    if (!u.number?.trim() || u.number.length > 15) err.number = 'Telefon max 15 znaků.'
    if (!u.ssn?.trim()) err.ssn = 'Rodné číslo je povinné.'
    else if (!isValidSsnFormat(u.ssn)) err.ssn = 'Formát rodného čísla je neplatný.'
    else if (!isDivisibleBy11Rule(u.ssn)) err.ssn = 'Rodné číslo není dělitelné 11.'

    errorsEdit.value = err
    if (Object.keys(err).length > 0) return

    const payload = {
        id: u.id,
        username: u.username,
        passwordHash: u.passwordHash ?? '',
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        countryCode: u.countryCode,
        number: u.number,
        ssn: u.ssn.replace('/', ''),
        roleId: u.roleId
    }

    try {
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
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center p-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-[1600px] rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-700">
            <h2 class="text-4xl font-bold text-center mb-8">Seznam uživatelů</h2>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6 mb-10 py-6">
                <input v-model="searchQuery" type="text" placeholder="Vyhledat uživatele podle jména, e-mailu..."
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400 bg-white" />
                <select v-model="selectedRole"
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400 bg-white">
                    <option value="Vše">Všechny role</option>
                    <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
                </select>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full table-auto border border-cyan-200 rounded-xl shadow text-sm md:text-base">
                    <thead class="bg-cyan-100 text-cyan-800 uppercase">
                        <tr class="text-xs md:text-sm text-cyan-900 whitespace-nowrap">
                            <th class="px-2 py-3 w-8">ID</th>
                            <th class="px-2 py-3 w-28">Uživatel</th>
                            <th class="px-2 py-3 w-32">Jméno</th>
                            <th class="px-2 py-3 w-32">Příjmení</th>
                            <th class="px-2 py-3 w-56">E-mail</th>
                            <th class="px-2 py-3 w-44">Telefon</th>
                            <th class="px-2 py-3 w-36">Rodné číslo</th>
                            <th class="px-2 py-3 w-16">Věk</th>
                            <th class="px-2 py-3 w-20">Pohlaví</th>
                            <th class="px-2 py-3 w-24">Role</th>
                            <th class="px-2 py-3 text-center w-32">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filteredUsers" :key="user.id"
                            class="border-b border-cyan-100 hover:bg-cyan-50 bg-white transition">
                            <td class="px-2 py-3">{{ user.id }}</td>

                            <template v-if="editingId === user.id">
                                <td class="px-2 py-3">
                                    <input v-model="editedUser.username" :title="errorsEdit.username || ''"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                        :class="{ 'border-red-500': errorsEdit.username }" />
                                </td>
                                <td class="px-2 py-3">
                                    <input v-model="editedUser.firstName" placeholder="Jméno"
                                        :title="errorsEdit.firstName || ''"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                        :class="{ 'border-red-500': errorsEdit.firstName }" />
                                </td>
                                <td class="px-2 py-3">
                                    <input v-model="editedUser.lastName" placeholder="Příjmení"
                                        :title="errorsEdit.lastName || ''"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                        :class="{ 'border-red-500': errorsEdit.lastName }" />
                                </td>
                                <td class="px-2 py-3">
                                    <input v-model="editedUser.email" :title="errorsEdit.email || ''"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                        :class="{ 'border-red-500': errorsEdit.email }" />
                                </td>
                                <td class="px-2 py-3">
                                    <div class="flex gap-2">
                                        <input v-model="editedUser.countryCode" :title="errorsEdit.countryCode || ''"
                                            class="w-20 px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                            :class="{ 'border-red-500': errorsEdit.countryCode }" />
                                        <input v-model="editedUser.number" :title="errorsEdit.number || ''"
                                            class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                            :class="{ 'border-red-500': errorsEdit.number }" />
                                    </div>
                                </td>
                                <td class="px-2 py-3">
                                    <input v-model="editedUser.ssn" :title="errorsEdit.ssn || ''"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2"
                                        :class="{ 'border-red-500': errorsEdit.ssn }" />
                                </td>
                                <td class="px-2 py-3">–</td>
                                <td class="px-2 py-3">–</td>
                                <td class="px-2 py-3">
                                    <select v-model="editedUser.roleId"
                                        class="w-full px-3 py-2 rounded-md border border-cyan-300 focus:outline-none focus:ring-2 bg-white">
                                        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}
                                        </option>
                                    </select>
                                </td>
                                <td class="px-2 py-3 flex justify-center gap-2">
                                    <button @click="saveEdit"
                                        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Uložit
                                    </button>
                                    <button @click="cancelEdit"
                                        class="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Zrušit
                                    </button>
                                </td>
                            </template>

                            <template v-else>
                                <td class="px-2 py-3 font-semibold">{{ user.username }}</td>
                                <td class="px-2 py-3">{{ user.firstName }}</td>
                                <td class="px-2 py-3">{{ user.lastName }}</td>
                                <td class="px-2 py-3">{{ user.email }}</td>
                                <td class="px-2 py-3">{{ formatPhone(user.countryCode, user.number) }}</td>
                                <td class="px-2 py-3">{{ formatSSN(user.ssn) }}</td>
                                <td class="px-2 py-3">{{ user.age }}</td>
                                <td class="px-2 py-3">{{ user.gender }}</td>
                                <td class="px-2 py-3">{{ user.role }}</td>
                                <td class="px-2 py-3 flex justify-center gap-2">
                                    <button @click="startEdit(user)"
                                        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Upravit
                                    </button>
                                    <button @click="confirmDelete(user)"
                                        class="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:brightness-110 transition">
                                        Smazat
                                    </button>
                                </td>
                            </template>
                        </tr>

                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="11" class="text-center py-6 text-gray-500">Žádní uživatelé nenalezeni.</td>
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
