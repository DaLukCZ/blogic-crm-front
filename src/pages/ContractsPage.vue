<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/auth'

const router = useRouter()
const auth = useAuthStore()

const today = new Date()
today.setHours(0, 0, 0, 0)

const searchName = ref('')
const searchInstitution = ref('')
const selectedStatus = ref('all')

const clientsWithContracts = ref([])

function formatDate(date) {
    if (!date || date === 'Nezadáno') return 'Nezadáno'
    const d = new Date(date)
    if (isNaN(d)) return date
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}. ${month}. ${year}`
}

const fetchClientsWithContracts = async () => {
    try {
        const data = await api('/api/Contracts')

        const clientMap = {}

        const isContractVisibleForUser = (contract) => {
            if (!auth.user) return false
            const userRole = auth.user.role.toLowerCase()
            const userId = auth.user.id

            if (userRole === 'admin') {
                return true
            } else if (userRole === 'poradce') {
                return contract.users.some(u => u.id === userId && u.roleName.toLowerCase() === 'poradce')
            } else if (userRole === 'klient') {
                return contract.users.some(u => u.id === userId && u.roleName.toLowerCase() === 'klient')
            }
            return false
        }

        for (const contract of data) {
            if (!isContractVisibleForUser(contract)) continue

            const cleanedContract = {
                id: contract.id,
                number: contract.referenceNumber,
                institution: contract.institutionName ?? 'Neznámá instituce',
                dateSigned: contract.dateSigned?.slice(0, 10) ?? 'Nezadáno',
                dateValidFrom: contract.dateValidFrom?.slice(0, 10) ?? 'Nezadáno',
                dateValidTo: contract.dateValidTo?.slice(0, 10) ?? 'Nezadáno'
            }

            const clients = contract.users.filter(u => u.roleName.toLowerCase() === 'klient')

            for (const client of clients) {
                const key = client.id
                if (!clientMap[key]) {
                    clientMap[key] = {
                        id: client.id,
                        firstName: client.firstName,
                        lastName: client.lastName,
                        contracts: []
                    }
                }
                clientMap[key].contracts.push(cleanedContract)
            }
        }

        if (auth.user?.role.toLowerCase() === 'klient') {
            const myClient = clientMap[auth.user.id]
            clientsWithContracts.value = myClient ? [myClient] : []
        } else {
            clientsWithContracts.value = Object.values(clientMap)
        }
    } catch (error) {
        console.error('Chyba při načítání klientů se smlouvami:', error)
    }
}

onMounted(() => {
    fetchClientsWithContracts()
})

const filteredClients = computed(() => {
    return clientsWithContracts.value
        .map(client => {
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
            const nameMatch = fullName.includes(searchName.value.toLowerCase())

            const filteredContracts = client.contracts.filter(contract => {
                const validFrom = contract.dateValidFrom !== 'Nezadáno' ? new Date(contract.dateValidFrom) : null
                const validTo = contract.dateValidTo !== 'Nezadáno' ? new Date(contract.dateValidTo) : null

                const institutionMatch = !searchInstitution.value || contract.institution.toLowerCase().includes(searchInstitution.value.toLowerCase())

                let statusMatch = true
                if (selectedStatus.value === 'active') {
                    statusMatch = validFrom && validTo && validFrom <= today && today <= validTo
                } else if (selectedStatus.value === 'future') {
                    statusMatch = validFrom && validFrom > today
                } else if (selectedStatus.value === 'ended') {
                    statusMatch = validTo && validTo < today
                }

                return institutionMatch && statusMatch
            })

            if (nameMatch && filteredContracts.length > 0) {
                return { ...client, contracts: filteredContracts }
            }
            return null
        })
        .filter(Boolean)
})

function goToContractDetail(contractId) {
    router.push(`/contracts/${contractId}`)
}

const exportContracts = async () => {
    try {
        const response = await api('/api/Contracts/export')
        const base64Csv = response.data?.base64Csv || response.base64Csv

        if (!base64Csv) {
            throw new Error('No CSV data received')
        }

        const byteCharacters = atob(base64Csv)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)

        const blob = new Blob([byteArray], { type: 'text/csv;charset=utf-8' })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'contracts_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        alert(error.message || 'Nepodařilo se exportovat smlouvy.')
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center p-6 md:p-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-full md:max-w-7xl rounded-3xl shadow-2xl p-6 md:p-10 animate-slow-fade-in text-gray-800">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 pb-6">
                Smlouvy podle klientů
            </h2>

            <!-- Filtrovací panel -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-10">
                <input v-model="searchName" type="text" placeholder="Hledat klienta podle jména"
                    class="px-6 py-4 flex-grow min-w-[200px] rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white" />
                <input v-model="searchInstitution" type="text" placeholder="Hledat podle instituce"
                    class="px-6 py-4 flex-grow min-w-[200px] rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white" />
                <select v-model="selectedStatus"
                    class="px-6 py-4 flex-grow min-w-[200px] rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white">
                    <option value="all">Všechny stavy</option>
                    <option value="active">Probíhající</option>
                    <option value="future">Nadcházející</option>
                    <option value="ended">Ukončené</option>
                </select>
                <div class="flex gap-4 flex-shrink-0">
                    <button
                        v-if="auth.user && (auth.user.role.toLowerCase() === 'admin' || auth.user.role.toLowerCase() === 'poradce')"
                        @click="router.push('/contracts/add')"
                        class="px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow transition whitespace-nowrap"
                        style="opacity: 0.9;" @mouseenter="event => event.currentTarget.style.opacity = '1'"
                        @mouseleave="event => event.currentTarget.style.opacity = '0.9'">
                        Přidat smlouvu
                    </button>
                    <button v-if="auth.user && auth.user.role.toLowerCase() === 'admin'" @click="exportContracts"
                        class="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow transition whitespace-nowrap"
                        style="opacity: 0.9;" @mouseenter="event => event.currentTarget.style.opacity = '1'"
                        @mouseleave="event => event.currentTarget.style.opacity = '0.9'">
                        Export smluv
                    </button>
                </div>
            </div>


            <div class="space-y-16 py-6">
                <div v-for="client in filteredClients" :key="client.id">
                    <h3 class="text-2xl font-bold text-cyan-900 mb-6 border-b border-gray-300 pb-2 break-words">
                        {{ client.firstName }} {{ client.lastName }}
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-3">
                        <div v-for="contract in client.contracts" :key="contract.id"
                            @click="goToContractDetail(contract.id)"
                            class="bg-white rounded-2xl shadow-md border border-cyan-200 p-4 hover:shadow-lg transition cursor-pointer break-words max-w-full">
                            <div class="text-sm text-gray-500 mb-1">📄 Číslo smlouvy:</div>
                            <div class="text-md font-semibold text-gray-800 mb-2">{{ contract.number }}</div>
                            <div class="text-md font-semibold text-gray-800 break-words">{{ contract.institution ||
                                'Neznámá' }}</div>
                            <div class="text-sm text-gray-500">
                                Uzavřeno: {{ formatDate(contract.dateSigned) || 'Nezadáno' }}
                            </div>
                            <div class="text-sm text-gray-500">
                                Platnost od: {{ formatDate(contract.dateValidFrom) || 'Nezadáno' }}
                            </div>
                            <div class="text-sm text-gray-500">
                                Platnost do: {{ formatDate(contract.dateValidTo) || 'Nezadáno' }}
                            </div>
                        </div>
                    </div>
                </div>
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
