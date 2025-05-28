<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const contractId = route.params.id

const contract = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    try {
        const data = await api(`/api/Contracts/${contractId}`)

        contract.value = {
            id: data.id,
            reference_number: data.referenceNumber,
            institution: data.institutionName ?? 'Neznámá instituce',
            date_signed: data.dateSigned?.slice(0, 10) ?? 'Nezadáno',
            date_valid_from: data.dateValidFrom?.slice(0, 10) ?? 'Nezadáno',
            date_valid_to: data.dateValidTo?.slice(0, 10) ?? 'Nezadáno',
            users: data.users || []
        }

        console.log('Načtení uživatelé:', contract.value.users)
    } catch (err) {
        error.value = 'Nepodařilo se načíst detail smlouvy.'
        console.error(err)
    } finally {
        loading.value = false
    }
})

const client = computed(() => {
    const result = contract.value?.users.find(u => u.roleName === 'Klient')
    console.log('Klient nalezen:', result)
    return result
})

const advisors = computed(() => {
    const result = contract.value?.users.filter(u => u.roleName === 'Poradce')
    console.log('Poradci nalezeni:', result)
    return result
})
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-4xl rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-800">

            <h2 class="text-4xl font-bold text-center text-cyan-800 mb-10 pb-8">Detail smlouvy</h2>

            <!-- Loading -->
            <div v-if="loading" class="text-center text-gray-600 text-lg">Načítání dat...</div>

            <!-- Chyba -->
            <div v-else-if="error" class="text-center text-red-600 font-semibold text-lg">{{ error }}</div>

            <!-- Obsah smlouvy -->
            <template v-else>
                <!-- Základní informace -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-4 text-center">
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Evidenční číslo</p>
                        <p class="text-lg font-semibold">{{ contract.reference_number }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Instituce</p>
                        <p class="text-lg font-semibold">{{ contract.institution }}</p>
                    </div>
                </div>

                <!-- Datumové údaje -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Datum uzavření</p>
                        <p class="text-lg font-semibold">{{ contract.date_signed }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Platnost od</p>
                        <p class="text-lg font-semibold">{{ contract.date_valid_from }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Platnost do</p>
                        <p class="text-lg font-semibold">{{ contract.date_valid_to }}</p>
                    </div>
                </div>

                <!-- Klient a Poradci -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pt-4">
                    <!-- Klient -->
                    <div class="h-full pb-6">
                        <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">Klient</h3>
                        <div
                            v-if="client"
                            class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200"
                        >
                            <p class="font-semibold text-lg">{{ client.firstName }} {{ client.lastName }}</p>
                            <p class="text-sm text-gray-600">{{ client.email }}</p>
                        </div>
                        <div v-else class="text-gray-400 italic text-center">Žádný klient nenalezen</div>
                    </div>

                    <!-- Poradci -->
                    <div class="h-full pb-6">
                        <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">Poradci</h3>
                        <div
                            v-if="advisors.length"
                            class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200"
                        >
                            <div v-for="advisor in advisors" :key="advisor.id" class="mb-4 last:mb-0">
                                <p class="font-semibold text-lg">{{ advisor.firstName }} {{ advisor.lastName }}</p>
                                <p class="text-sm text-gray-600">{{ advisor.email }}</p>
                            </div>
                        </div>
                        <div v-else class="text-gray-400 italic text-center">Žádní poradci nenalezeni</div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
@keyframes slow-fade-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
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
