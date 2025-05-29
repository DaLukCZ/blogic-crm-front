<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const clientId = ref(route.params.id)
const client = ref(null)
const contracts = ref([])

function formatDate(date) {
    if (!date || date === 'Nezadáno') return 'Nezadáno'
    const d = new Date(date)
    if (isNaN(d)) return date
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}. ${month}. ${year}`
}

const checkAccess = (id) => {
    if (auth.user.role.toLowerCase() === 'klient' && auth.user.id !== Number(id)) {
        router.replace(`/users/${auth.user.id}`)
    }
}

const formatSSN = ssn => {
    if (!ssn || ssn.length < 7) return 'Nezadáno'
    return ssn.slice(0, 6) + '/' + ssn.slice(6)
}

const getGenderFromSSN = ssn => {
    if (!ssn || ssn.length < 4) return 'Nezadáno'
    const monthPart = parseInt(ssn.slice(2, 4), 10)
    if (monthPart >= 1 && monthPart <= 12) return 'Muž'
    if (monthPart >= 51 && monthPart <= 62) return 'Žena'
    return 'Neznámé'
}

const formatPhone = (code, number) => {
    if (!code && !number) return 'Nezadáno'
    if (!number) return code || 'Nezadáno'
    return `${code ?? ''} ${number.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim()}`
}

const displayOrDefault = value => {
    return value && value !== '' ? value : 'Nezadáno'
}

const calculateAgeFromSSN = ssn => {
    if (!ssn || ssn.length < 6) return 'Nezadáno'
    const clean = ssn.replace('/', '')
    const year = parseInt(clean.slice(0, 2), 10)
    let month = parseInt(clean.slice(2, 4), 10)
    const day = parseInt(clean.slice(4, 6), 10)

    if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Nezadáno'
    if (month > 50) month -= 50

    const fullYear = year < 50 ? 2000 + year : 1900 + year
    const birthDate = new Date(fullYear, month - 1, day)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--

    return isNaN(age) ? 'Nezadáno' : age
}

const fetchClientDetail = async (id) => {
    checkAccess(id)
    try {
        const data = await api(`/api/Users/${id}`)
        client.value = data
    } catch (err) {
        console.error('Chyba při načítání detailu uživatele:', err)
    }
}

const fetchClientContracts = async (id) => {
    try {
        const data = await api(`/api/Contracts/byuser/${id}`)
        contracts.value = data.map(c => ({
            id: c.id,
            number: c.referenceNumber,
            institution: c.institutionName ?? 'Neznámá instituce',
            dateSigned: c.dateSigned?.slice(0, 10) ?? 'Nezadáno',
            dateValidFrom: c.dateValidFrom?.slice(0, 10) ?? 'Nezadáno',
            dateValidTo: c.dateValidTo?.slice(0, 10) ?? 'Nezadáno'
        }))
    } catch (err) {
        console.error('Nepodařilo se načíst smlouvy klienta:', err)
    }
}

onMounted(() => {
    fetchClientDetail(clientId.value)
    fetchClientContracts(clientId.value)
})

watch(() => route.params.id, (newId) => {
    clientId.value = newId
    fetchClientDetail(newId)
    fetchClientContracts(newId)
})

function goToContractDetail(contractId) {
    router.push(`/contracts/${contractId}`)
}

const showChangePasswordModal = ref(false)

function openChangePasswordModal() {
    showChangePasswordModal.value = true
}
function closeChangePasswordModal() {
    showChangePasswordModal.value = false
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-4xl rounded-3xl shadow-2xl p-6 md:p-10 animate-slow-fade-in text-gray-800">
            <h2 class="text-3xl md:text-4xl font-bold text-center text-cyan-800 mb-8 md:mb-10 pb-6">
                {{ displayOrDefault(client?.firstName) }} {{ displayOrDefault(client?.lastName) }}<br />
                {{ displayOrDefault(client?.role?.name) }}
            </h2>

            <!-- Kontaktní údaje -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                    <p class="text-sm text-gray-500">E-mail</p>
                    <p class="text-lg font-medium break-words">{{ displayOrDefault(client?.email) }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                    <p class="text-sm text-gray-500">Telefon</p>
                    <p class="text-lg font-medium break-words">{{ formatPhone(client?.countryCode, client?.number) }}
                    </p>
                </div>
            </div>

            <!-- Osobní údaje -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 pt-4 text-center">
                <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                    <p class="text-sm text-gray-500">Rodné číslo</p>
                    <p class="text-lg font-medium">{{ formatSSN(client?.ssn) }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                    <p class="text-sm text-gray-500">Pohlaví</p>
                    <p class="text-lg font-medium">{{ getGenderFromSSN(client?.ssn) }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                    <p class="text-sm text-gray-500">Věk</p>
                    <p class="text-lg font-medium">{{ calculateAgeFromSSN(client?.ssn) }}</p>
                </div>
            </div>

            <!-- Smlouvy klienta -->
            <div class="space-y-16 mt-10">
                <h3 class="text-2xl font-bold text-cyan-900 mb-6 border-b border-gray-300 pb-2 pt-2 text-center">
                    Smlouvy klienta
                </h3>

                <div v-if="contracts.length"
                    class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-3">
                    <div v-for="contract in contracts" :key="contract.id" @click="goToContractDetail(contract.id)"
                        class="bg-white rounded-2xl shadow-md border border-cyan-200 p-4 hover:shadow-lg transition cursor-pointer break-words max-w-full">
                        <div class="text-sm text-gray-500 mb-1">📄 Číslo smlouvy:</div>
                        <div class="text-md font-semibold text-gray-800 mb-2">{{ contract.number }}</div>
                        <div class="text-md font-semibold text-gray-800 break-words">{{ contract.institution }}</div>
                        <div class="text-sm text-gray-500">Uzavřeno: {{ formatDate(contract.dateSigned) }}</div>
                        <div class="text-sm text-gray-500">Platnost od: {{ formatDate(contract.dateValidFrom) }}</div>
                        <div class="text-sm text-gray-500">Platnost do: {{ formatDate(contract.dateValidTo) }}</div>
                    </div>
                </div>

                <p v-else class="text-gray-500 italic mt-4 text-center">Žádné smlouvy nejsou evidovány.</p>
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
