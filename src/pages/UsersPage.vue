<script setup>
import { ref, computed, reactive } from 'vue'

const users = ref([
    {
        id: 1,
        username: 'sejtam',
        firstName: 'Tomáš',
        lastName: 'Novák',
        email: 'tomas@seznam.cz',
        countryCode: '+420',
        number: '777123456',
        ssn: '8501011234',
        role: 'Klient'
    },
    {
        id: 2,
        username: 'jporadce',
        firstName: 'Jana',
        lastName: 'Poradkyně',
        email: 'jana@firma.cz',
        countryCode: '+420',
        number: '602654321',
        ssn: '8403117890',
        role: 'Poradce'
    },
    {
        id: 3,
        username: 'admin1',
        firstName: 'Adam',
        lastName: 'Admin',
        email: 'admin@crm.cz',
        countryCode: '+421',
        number: '905123456',
        ssn: '8001019999',
        role: 'Admin'
    }
])

const selectedRole = ref('Vše')
const searchQuery = ref('')
const deleteModalVisible = ref(false)
const userToDelete = ref(null)

const editingId = ref(null)
const editedUser = reactive({})

const startEdit = (user) => {
    editingId.value = user.id
    Object.assign(editedUser, { ...user })
}

const cancelEdit = () => {
    editingId.value = null
    Object.keys(editedUser).forEach(k => delete editedUser[k])
}

const saveEdit = () => {
    const index = users.value.findIndex(u => u.id === editingId.value)
    if (index !== -1) {
        users.value[index] = { ...editedUser }
    }
    cancelEdit()
}

const confirmDelete = (user) => {
    userToDelete.value = user
    deleteModalVisible.value = true
}

const deleteUser = () => {
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    deleteModalVisible.value = false
    userToDelete.value = null
}

const filteredUsers = computed(() =>
    users.value.filter(user => {
        const roleMatch = selectedRole.value === 'Vše' || user.role === selectedRole.value
        const searchMatch = [user.username, user.firstName, user.lastName, user.email]
            .some(field => field.toLowerCase().includes(searchQuery.value.toLowerCase()))
        return roleMatch && searchMatch
    })
)

const formatSSN = (ssn) => {
    if (!ssn || ssn.length < 7) return ssn
    return ssn.slice(0, 6) + '/' + ssn.slice(6)
}

const formatPhone = (code, number) => {
    if (!number) return ''
    return `${code} ${number.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim()}`
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-7xl h-full max-h-screen overflow-y-auto rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-700">
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
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3 flex gap-2">
                                    <input v-model="editedUser.firstName"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                    <input v-model="editedUser.lastName"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">
                                    <input v-model="editedUser.email"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3 flex gap-2">
                                    <input v-model="editedUser.countryCode"
                                        class="w-20 px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                    <input v-model="editedUser.number"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">
                                    <input v-model="editedUser.ssn"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400" />
                                </td>
                                <td class="px-4 py-3">
                                    <select v-model="editedUser.role"
                                        class="w-full px-3 py-2 rounded-xl border border-cyan-300 shadow-sm focus:ring-2 focus:ring-cyan-400 bg-white">
                                        <option value="Klient">Klient</option>
                                        <option value="Poradce">Poradce</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </td>
                                <td class="px-4 py-3 flex justify-center gap-2">
                                    <button @click="saveEdit"
                                        class="px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:brightness-110">Uložit</button>
                                    <button @click="cancelEdit"
                                        class="px-4 py-2 bg-gray-400 text-white rounded-xl shadow hover:brightness-110">Zrušit</button>
                                </td>
                            </template>

                            <template v-else>
                                <td class="px-4 py-3 font-semibold">{{ user.username }}</td>
                                <td class="px-4 py-3">{{ user.firstName }} {{ user.lastName }}</td>
                                <td class="px-4 py-3">{{ user.email }}</td>
                                <td class="px-4 py-3">{{ formatPhone(user.countryCode, user.number) }}</td>
                                <td class="px-4 py-3">{{ formatSSN(user.ssn) }}</td>
                                <td class="px-4 py-3">{{ user.role }}</td>
                                <td class="px-4 py-3 flex justify-center gap-2">
                                    <button @click="startEdit(user)"
                                        class="px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:brightness-110">Editovat</button>
                                    <button @click="confirmDelete(user)"
                                        class="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:brightness-110">Smazat</button>
                                </td>
                            </template>
                        </tr>
                        <tr v-if="filteredUsers.length === 0">
                            <td colspan="8" class="text-center py-6 text-gray-500">Žádní uživatelé nenalezeni.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
            <h3 class="text-xl font-semibold mb-4">Opravdu chcete smazat uživatele?</h3>
            <p class="mb-6 text-gray-600">
                {{ userToDelete?.firstName }} {{ userToDelete?.lastName }} ({{ userToDelete?.email }})
            </p>
            <div class="flex justify-center gap-4">
                <button @click="deleteUser" class="px-5 py-2 bg-red-600 text-white rounded hover:brightness-110">Ano,
                    smazat</button>
                <button @click="deleteModalVisible = false"
                    class="px-5 py-2 bg-gray-300 rounded hover:brightness-110">Zrušit</button>
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
