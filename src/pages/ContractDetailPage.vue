<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/auth'

const route = useRoute()
const router = useRouter()
const contractId = route.params.id

const auth = useAuthStore()
const contract = ref(null)
const loading = ref(true)
const error = ref(null)

const showConfirmDeleteModal = ref(false)
const showDeletedInfoModal = ref(false)

function formatDate(date) {
    if (!date || date === 'Nezadáno') return 'Nezadáno'
    const d = new Date(date)
    if (isNaN(d)) return date
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}. ${month}. ${year}`
}

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
    } catch (err) {
        error.value = 'Nepodařilo se načíst detail smlouvy.'
        console.error(err)
    } finally {
        loading.value = false
    }
})

const clients = computed(() => contract.value?.users.filter(u => u.roleName === 'Klient') || [])
const advisors = computed(() => contract.value?.users.filter(u => u.roleName === 'Poradce') || [])

const isAdmin = computed(() => auth.user?.role?.toLowerCase() === 'admin')
const isAdvisor = computed(() => auth.user?.role?.toLowerCase() === 'poradce')

function goToUserDetail(userId) {
    router.push(`/users/${userId}`)
}

const deleteContractConfirmed = async () => {
    try {
        await api(`/api/Contracts/${contractId}`, {
            method: 'DELETE'
        })
        showConfirmDeleteModal.value = false
        showDeletedInfoModal.value = true
    } catch (error) {
        alert('Nepodařilo se odstranit smlouvu: ' + error.message)
    }
}

const deleteContract = () => {
    showConfirmDeleteModal.value = true
}

const closeDeletedInfoModal = () => {
    showDeletedInfoModal.value = false
    router.push('/contracts')
}

const editContractDetails = () => {
    router.push(`/contracts/edit/${contractId}`)
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500 flex items-start justify-center pt-20 md:pt-24 px-4 md:px-12">
        <div
            class="bg-white/90 backdrop-blur-md w-full max-w-full md:max-w-4xl rounded-3xl shadow-2xl p-6 md:p-10 animate-slow-fade-in text-gray-800">
            <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 md:gap-0">
                <h2
                    class="text-3xl md:text-4xl font-bold text-center md:text-left text-cyan-800 pb-4 md:pb-8 w-full md:w-auto">
                    Detail smlouvy
                </h2>
                <div v-if="isAdmin || isAdvisor" class="flex gap-4">
                    <button @click="editContractDetails"
                        class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow hover:brightness-110 transition">
                        Upravit smlouvu
                    </button>
                    <button @click="deleteContract"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:brightness-110 transition">
                        Odstranit smlouvu
                    </button>
                </div>
            </div>

            <div v-if="loading" class="text-center text-gray-600 text-lg">
                Načítání dat...
            </div>

            <div v-else-if="error" class="text-center text-red-600 font-semibold text-lg">
                {{ error }}
            </div>

            <template v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-4 text-center">
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Evidenční číslo</p>
                        <p class="text-lg font-semibold break-words">{{ contract.reference_number }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Instituce</p>
                        <p class="text-lg font-semibold break-words">{{ contract.institution }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Datum uzavření</p>
                        <p class="text-lg font-semibold">{{ formatDate(contract.date_signed) }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Platnost od</p>
                        <p class="text-lg font-semibold">{{ formatDate(contract.date_valid_from) }}</p>
                    </div>
                    <div class="bg-white rounded-2xl border border-cyan-200 p-4">
                        <p class="text-sm text-gray-500">Platnost do</p>
                        <p class="text-lg font-semibold">{{ formatDate(contract.date_valid_to) }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pt-4">
                    <div class="h-full pb-6 flex flex-col">
                        <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">
                            Klienti
                        </h3>
                        <div v-if="clients.length"
                            class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200 overflow-auto max-h-96">
                            <div v-for="client in clients" :key="client.id" @click="goToUserDetail(client.id)"
                                class="mb-4 last:mb-0 cursor-pointer hover:bg-cyan-50 rounded transition p-3 select-none"
                                role="button" tabindex="0" @keydown.enter="goToUserDetail(client.id)">
                                <p class="font-semibold text-lg">
                                    {{ client.firstName }} {{ client.lastName }}
                                </p>
                                <p class="text-sm text-gray-600 break-words">{{ client.email }}</p>
                            </div>
                        </div>
                        <div class="text-gray-400 italic text-center" v-else>
                            Žádní klienti nenalezeni
                        </div>
                    </div>

                    <div class="h-full pb-6 flex flex-col">
                        <h3 class="text-xl font-semibold text-cyan-800 mb-3 text-center pb-2">
                            Poradci
                        </h3>
                        <div v-if="advisors.length"
                            class="bg-white rounded-2xl p-5 shadow-sm text-center h-full border border-cyan-200 overflow-auto max-h-96">
                            <div v-for="advisor in advisors" :key="advisor.id" @click="goToUserDetail(advisor.id)"
                                class="mb-4 last:mb-0 cursor-pointer hover:bg-cyan-50 rounded transition p-3 select-none"
                                role="button" tabindex="0" @keydown.enter="goToUserDetail(advisor.id)">
                                <p class="font-semibold text-lg">
                                    {{ advisor.firstName }} {{ advisor.lastName }}
                                </p>
                                <p class="text-sm text-gray-600 break-words">{{ advisor.email }}</p>
                            </div>
                        </div>
                        <div class="text-gray-400 italic text-center" v-else>
                            Žádní poradci nenalezeni
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Modal -->
        <div v-if="showConfirmDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog" aria-modal="true">
            <div
                class="bg-white rounded-2xl p-6 sm:p-8 max-w-full max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
                <h3 class="text-xl font-semibold mb-4 text-red-700">Opravdu chcete smlouvu smazat?</h3>
                <p class="text-gray-700 mb-6">
                    Tato akce je nevratná. Opravdu chcete smazat smlouvu
                    <strong>{{ contract.reference_number }}</strong>?
                </p>
                <div class="flex justify-center gap-4">
                    <button @click="deleteContractConfirmed"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:brightness-110">
                        Ano, smazat
                    </button>
                    <button @click="() => (showConfirmDeleteModal = false)"
                        class="px-6 py-2 bg-gray-300 rounded-lg shadow hover:bg-gray-400">
                        Zrušit
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDeletedInfoModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog" aria-modal="true">
            <div
                class="bg-white rounded-2xl p-6 sm:p-8 max-w-full max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
                <h3 class="text-xl font-semibold mb-4 text-green-700">Smlouva byla smazána</h3>
                <p class="text-gray-700 mb-6">
                    Smlouva <strong>{{ contract.reference_number }}</strong> byla úspěšně odstraněna.
                </p>
                <button @click="closeDeletedInfoModal"
                    class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    OK
                </button>
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
