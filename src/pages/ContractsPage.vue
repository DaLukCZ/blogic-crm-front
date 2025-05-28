<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'

const today = new Date()
today.setHours(0, 0, 0, 0) // důležité pro správné porovnání dat

const searchName = ref('')
const searchInstitution = ref('')
const selectedStatus = ref('all') // 'all', 'active', 'future', 'ended'

const clientsWithContracts = ref([])

const fetchClientsWithContracts = async () => {
    try {
        const data = await api('/api/Contracts')

        const clientMap = {}

        for (const contract of data) {
            const cleanedContract = {
                id: contract.id,
                number: contract.referenceNumber,
                institution: contract.institutionName ?? 'Neznámá instituce',
                dateSigned: contract.dateSigned?.slice(0, 10) ?? 'Nezadáno',
                dateValidFrom: contract.dateValidFrom?.slice(0, 10) ?? 'Nezadáno',
                dateValidTo: contract.dateValidTo?.slice(0, 10) ?? 'Nezadáno'
            }

            const clients = contract.users.filter(u => u.roleName === 'Klient')

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

        clientsWithContracts.value = Object.values(clientMap)
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
                // selectedStatus === 'all' => statusMatch zůstává true

                return institutionMatch && statusMatch
            })

            if (nameMatch && filteredContracts.length > 0) {
                return { ...client, contracts: filteredContracts }
            }
            return null
        })
        .filter(Boolean)
})
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center p-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-7xl rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-800">

            <h2 class="text-4xl font-bold text-center mb-10">Smlouvy podle klientů</h2>

            <!-- Filtrovací panel -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 gap-y-6 mt-6 mb-10 py-6">
                <input v-model="searchName" type="text" placeholder="Hledat klienta podle jména"
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white" />
                <input v-model="searchInstitution" type="text" placeholder="Hledat podle instituce"
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white" />
                <select v-model="selectedStatus"
                    class="px-6 py-4 w-full md:w-1/3 rounded-xl border border-cyan-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-700 text-base bg-white">
                    <option value="all">Všechny stavy</option>
                    <option value="active">Probíhající</option>
                    <option value="future">Nadcházející</option>
                    <option value="ended">Ukončené</option>
                </select>
            </div>

            <div class="space-y-16">
                <div v-for="client in filteredClients" :key="client.id">
                    <h3 class="text-2xl font-bold text-cyan-900 mb-6 border-b border-gray-300 pb-2">
                        {{ client.firstName }} {{ client.lastName }}
                    </h3>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-3">
                        <div v-for="contract in client.contracts" :key="contract.id"
                            class="bg-white rounded-2xl shadow-md border border-cyan-200 p-4 hover:shadow-lg transition">
                            <div class="text-sm text-gray-500 mb-1">📄 Číslo smlouvy:</div>
                            <div class="text-md font-semibold text-gray-800 mb-2">{{ contract.number }}</div>
                            <div class="text-sm text-gray-600">{{ contract.institution?.name || 'Neznámá instituce' }}
                            </div>
                            <div class="text-sm text-gray-500">Uzavřeno: {{ contract.dateSigned || 'Nezadáno' }}</div>
                            <div class="text-sm text-gray-500">Platnost od: {{ contract.dateValidFrom || 'Nezadáno' }}
                            </div>
                            <div class="text-sm text-gray-500">Platnost do: {{ contract.dateValidTo || 'Nezadáno' }}
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
