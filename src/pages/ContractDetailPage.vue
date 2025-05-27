<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractId = route.params.id ?? 101

const contract = ref(null)

onMounted(() => {
    contract.value = {
        id: contractId,
        reference_number: 'S-2024-011',
        institution: 'Generali',
        date_signed: '2024-02-15',
        date_valid_from: '2024-03-01',
        date_valid_to: '2027-03-01',
        manager_id: 2,
        users: [
            {
                id: 1,
                username: 'sejtam',
                first_name: 'Tomáš',
                last_name: 'Novák',
                email: 'tomas@seznam.cz',
                country_code: '+420',
                number: '777123456',
                ssn: '8501011234',
                role: 'Klient'
            },
            {
                id: 2,
                username: 'jporadce',
                first_name: 'Jana',
                last_name: 'Poradkyně',
                email: 'jana@firma.cz',
                country_code: '+420',
                number: '602654321',
                ssn: '8403117890',
                role: 'Poradce'
            },
            {
                id: 5,
                username: 'mdlouhy',
                first_name: 'Milan',
                last_name: 'Dlouhý',
                email: 'milan@firma.cz',
                country_code: '+420',
                number: '602789456',
                ssn: '7903124567',
                role: 'Poradce'
            }
        ]
    }
})

// computed oddělí klienta a poradce
const client = computed(() =>
    contract.value?.users.find(u => u.role === 'Klient')
)

const advisors = computed(() =>
    contract.value?.users.filter(u => u.role === 'Poradce')
)
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">

        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-4xl rounded-3xl shadow-2xl p-10 animate-slow-fade-in text-gray-800">

            <h2 class="text-4xl font-bold text-center text-cyan-800 mb-10 pb-8">Detail smlouvy</h2>

            <!-- Základní informace -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-4 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Evidenční číslo</p>
                    <p class="text-lg font-semibold">{{ contract?.reference_number }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Instituce</p>
                    <p class="text-lg font-semibold">{{ contract?.institution }}</p>
                </div>
            </div>

            <!-- Datumy -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Datum uzavření</p>
                    <p class="text-lg font-semibold">{{ contract?.date_signed }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Platnost od</p>
                    <p class="text-lg font-semibold">{{ contract?.date_valid_from }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200">
                    <p class="text-sm text-gray-500">Platnost do</p>
                    <p class="text-lg font-semibold">{{ contract?.date_valid_to }}</p>
                </div>
            </div>

            <!-- Klient a Poradci v jednotném vzhledu, na jednom řádku -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pt-4">
                <!-- Klient -->
                <div v-if="client" class="h-full pb-6">
                    <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">Klient</h3>
                    <div class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200">
                        <p class="font-semibold text-lg">{{ client.first_name }} {{ client.last_name }}</p>
                        <p class="text-sm text-gray-600">{{ client.email }}</p>
                    </div>
                </div>
                <!-- Poradci -->
                <div class="h-full pb-6">
                    <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">Poradci</h3>
                    <div class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200">
                        <div v-for="advisor in advisors" :key="advisor.id" class="mb-4 last:mb-0">
                            <p class="font-semibold text-lg">{{ advisor.first_name }} {{ advisor.last_name }}</p>
                            <p class="text-sm text-gray-600">{{ advisor.email }}</p>
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
