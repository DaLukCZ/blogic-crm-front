<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const clientId = route.params.id ?? 1

const client = ref(null)

const formatSSN = ssn => {
    if (!ssn || ssn.length < 7) return ssn
    return ssn.slice(0, 6) + '/' + ssn.slice(6)
}

const getGenderFromSSN = ssn => {
    if (!ssn || ssn.length < 4) return 'Neznámé'
    const monthPart = parseInt(ssn.slice(2, 4), 10)
    if (monthPart >= 1 && monthPart <= 12) return 'Muž'
    if (monthPart >= 51 && monthPart <= 62) return 'Žena'
    return 'Neznámé'
}


const formatPhone = (code, number) => {
    if (!number) return ''
    return `${code} ${number.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim()}`
}

onMounted(() => {
    // Simulace dat – nahraď API voláním
    client.value = {
        id: clientId,
        firstName: 'Tomáš',
        lastName: 'Novák',
        email: 'tomas@seznam.cz',
        countryCode: '+420',
        number: '777123456',
        ssn: '8501011234',
        age: 39,
        contracts: [
            {
                id: 101,
                number: 'S-2023-001',
                institution: 'ČSOB',
                dateSigned: '2023-01-01',
                dateValidFrom: '2023-01-01',
                dateValidTo: '2026-01-01'
            },
            {
                id: 102,
                number: 'S-2024-003',
                institution: 'Axa',
                dateSigned: '2024-03-15',
                dateValidFrom: '2024-03-15',
                dateValidTo: '2029-03-15'
            }
        ]
    }
})
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 fa-10xpx-4 md:px-12">

        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-4xl rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-800">

            <h2 class="text-4xl font-bold text-center text-cyan-800 mb-10 pb-8">
                {{ client?.firstName }} {{ client?.lastName }}
            </h2>

            <!-- Řádek 1: E-mail a Telefon -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">E-mail</p>
                    <p class="text-lg font-medium">{{ client?.email }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Telefon</p>
                    <p class="text-lg font-medium">{{ formatPhone(client?.countryCode, client?.number) }}</p>
                </div>
            </div>

            <!-- Řádek 2: Rodné číslo, Pohlaví, Věk -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 pt-4 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Rodné číslo</p>
                    <p class="text-lg font-medium">{{ formatSSN(client?.ssn) }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Pohlaví</p>
                    <p class="text-lg font-medium">{{ getGenderFromSSN(client?.ssn) }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Věk</p>
                    <p class="text-lg font-medium">{{ client?.age }}</p>
                </div>
            </div>

            <div>
                <h3 class="text-2xl font-semibold text-cyan-800 mb-4 pt-4">Smlouvy klienta</h3>

                <div v-if="client?.contracts.length"
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

                <p v-else class="text-gray-500 italic mt-4">Žádné smlouvy nejsou evidovány.</p>
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
