<script setup>
import { ref, computed } from 'vue'

const today = new Date('2025-05-27') // pevné datum pro testování

const searchName = ref('')
const searchInstitution = ref('')
const selectedStatus = ref('all') // 'all', 'active', 'future', 'ended'

const clientsWithContracts = ref([
    {
        id: 1,
        firstName: 'Tomáš',
        lastName: 'Novák',
        contracts: [
            { id: 101, number: 'S-2023-001', institution: 'ČSOB', dateSigned: '2023-01-01', dateValidFrom: '2023-01-01', dateValidTo: '2024-12-31' },
            { id: 102, number: 'S-2024-003', institution: 'Axa', dateSigned: '2024-03-15', dateValidFrom: '2025-06-15', dateValidTo: '2027-06-30' },
            { id: 103, number: 'S-2024-007', institution: 'UNIQA', dateSigned: '2024-04-12', dateValidFrom: '2024-04-12', dateValidTo: '2025-10-31' }
        ]
    },
    {
        id: 2,
        firstName: 'Jakub',
        lastName: 'Tvrdoň',
        contracts: [
            { id: 104, number: 'S-2023-012', institution: 'AEGON', dateSigned: '2023-05-12', dateValidFrom: '2023-05-12', dateValidTo: '2024-05-12' },
            { id: 105, number: 'S-2023-014', institution: 'Kooperativa', dateSigned: '2023-06-22', dateValidFrom: '2023-06-22', dateValidTo: '2024-06-22' },
            { id: 106, number: 'S-2023-016', institution: 'Allianz', dateSigned: '2023-07-01', dateValidFrom: '2023-07-01', dateValidTo: '2025-01-01' },
            { id: 107, number: 'S-2023-020', institution: 'ČSOB', dateSigned: '2023-08-15', dateValidFrom: '2023-08-15', dateValidTo: '2024-08-15' },
            { id: 108, number: 'S-2023-025', institution: 'Axa', dateSigned: '2023-09-10', dateValidFrom: '2023-09-10', dateValidTo: '2025-01-10' },
            { id: 109, number: 'S-2024-002', institution: 'ČPP', dateSigned: '2024-01-05', dateValidFrom: '2024-01-05', dateValidTo: '2026-01-05' },
            { id: 110, number: 'S-2024-004', institution: 'Generali', dateSigned: '2024-02-10', dateValidFrom: '2024-02-10', dateValidTo: '2025-02-10' }
        ]
    },
    {
        id: 3,
        firstName: 'Petra',
        lastName: 'Horáková',
        contracts: [
            { id: 111, number: 'S-2024-010', institution: 'Allianz', dateSigned: '2024-04-01', dateValidFrom: '2024-04-01', dateValidTo: '2026-04-01' }
        ]
    },
    {
        id: 4,
        firstName: 'Marek',
        lastName: 'Král',
        contracts: [
            { id: 112, number: 'S-2022-011', institution: 'Kooperativa', dateSigned: '2022-09-10', dateValidFrom: '2022-09-10', dateValidTo: '2023-09-10' },
            { id: 113, number: 'S-2023-005', institution: 'Generali', dateSigned: '2023-02-14', dateValidFrom: '2023-02-14', dateValidTo: '2024-02-14' },
            { id: 114, number: 'S-2023-018', institution: 'ČPP', dateSigned: '2023-06-20', dateValidFrom: '2023-06-20', dateValidTo: '2025-06-20' },
            { id: 115, number: 'S-2023-023', institution: 'UNIQA', dateSigned: '2023-08-03', dateValidFrom: '2023-08-03', dateValidTo: '2024-12-31' },
            { id: 116, number: 'S-2024-001', institution: 'ČSOB', dateSigned: '2024-01-10', dateValidFrom: '2024-01-10', dateValidTo: '2025-01-10' },
            { id: 117, number: 'S-2024-006', institution: 'Axa', dateSigned: '2024-02-18', dateValidFrom: '2024-02-18', dateValidTo: '2026-02-18' },
            { id: 118, number: 'S-2024-009', institution: 'Allianz', dateSigned: '2024-03-25', dateValidFrom: '2024-03-25', dateValidTo: '2025-09-25' }
        ]
    },
    {
        id: 5,
        firstName: 'Lukáš',
        lastName: 'Šmach',
        contracts: [
            { id: 119, number: 'S-2022-011', institution: 'Kooperativa', dateSigned: '2022-09-10', dateValidFrom: '2022-09-10', dateValidTo: '2023-09-10' },
            { id: 120, number: 'S-2023-016', institution: 'Allianz', dateSigned: '2023-07-01', dateValidFrom: '2023-07-01', dateValidTo: '2025-01-01' },
            { id: 121, number: 'S-2023-020', institution: 'ČSOB', dateSigned: '2023-08-15', dateValidFrom: '2023-08-15', dateValidTo: '2024-08-15' },
            { id: 122, number: 'S-2023-025', institution: 'Axa', dateSigned: '2023-09-10', dateValidFrom: '2023-09-10', dateValidTo: '2025-01-10' },
            { id: 123, number: 'S-2024-002', institution: 'ČPP', dateSigned: '2024-01-05', dateValidFrom: '2024-01-05', dateValidTo: '2026-01-05' },
            { id: 124, number: 'S-2024-004', institution: 'Generali', dateSigned: '2024-02-10', dateValidFrom: '2024-02-10', dateValidTo: '2025-02-10' }
        ]
    }
])


const filteredClients = computed(() => {
    return clientsWithContracts.value
        .map(client => {
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
            const nameMatch = fullName.includes(searchName.value.toLowerCase())

            const filteredContracts = client.contracts.filter(contract => {
                const validFrom = new Date(contract.dateValidFrom)
                const validTo = new Date(contract.dateValidTo)
                const institutionMatch = !searchInstitution.value || contract.institution.toLowerCase().includes(searchInstitution.value.toLowerCase())

                let statusMatch = true
                if (selectedStatus.value === 'active') {
                    statusMatch = validFrom <= today && today <= validTo
                } else if (selectedStatus.value === 'future') {
                    statusMatch = validFrom > today
                } else if (selectedStatus.value === 'ended') {
                    statusMatch = validTo < today
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
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">
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
                            <div class="text-sm text-gray-600">{{ contract.institution }}</div>
                            <div class="text-sm text-gray-500">Uzavřeno: {{ contract.dateSigned }}</div>
                            <div class="text-sm text-gray-500">Platnost od: {{ contract.dateValidFrom }}</div>
                            <div class="text-sm text-gray-500">Platnost do: {{ contract.dateValidTo }}</div>
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
