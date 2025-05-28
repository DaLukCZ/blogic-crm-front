<script setup>
import { ref, computed, onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { api } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const institutions = ref([])
const users = ref([])
const institutionSelect = ref('')
const newInstitutionName = ref('')

const today = new Date().toISOString().split('T')[0]
const form = ref({
    institutionId: null,
    clientIds: [],
    advisorIds: [],
    dateSigned: today,
    dateValidFrom: today,
    dateValidTo: ''
})

onMounted(async () => {
    institutions.value = await api('/api/Institutions')
    users.value = await api('/api/Users')
})

const formatSsn = ssn => {
    if (!ssn || ssn.length !== 10) return ssn
    return `${ssn.slice(0, 6)}/${ssn.slice(6)}`
}

const institutionOptions = computed(() => [
    ...institutions.value.map(i => ({ label: i.name, value: i.id })),
    { label: '+ Přidat novou instituci', value: '__new__' }
])

const clientOptions = computed(() =>
    users.value.filter(u => u.role?.name.toLowerCase() === 'klient').map(u => ({
        label: `${u.firstName} ${u.lastName} (${formatSsn(u.ssn)})`,
        value: u.id
    }))
)

const advisorOptions = computed(() =>
    users.value.filter(u => u.role?.name.toLowerCase() === 'poradce').map(u => ({
        label: `${u.firstName} ${u.lastName} (${formatSsn(u.ssn)})`,
        value: u.id
    }))
)

const submitForm = async () => {
    if (
        form.value.clientIds.length === 0 ||
        form.value.advisorIds.length === 0 ||
        (institutionSelect.value === '__new__' && !newInstitutionName.value.trim()) ||
        (institutionSelect.value !== '__new__' && !institutionSelect.value)
    ) {
        alert('Vyplňte všechna povinná pole.')
        return
    }

    let finalInstitutionId = institutionSelect.value

    if (institutionSelect.value === '__new__') {
        const name = newInstitutionName.value.trim()
        const newInst = await api('/api/Institutions', {
            method: 'POST',
            body: JSON.stringify({ name })
        })
        finalInstitutionId = newInst.id
    }

    const allUserIds = [...form.value.clientIds, ...form.value.advisorIds]

    const contract = await api('/api/Contracts', {
        method: 'POST',
        body: JSON.stringify({
            referenceNumber: `SML-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            institutionId: finalInstitutionId,
            dateSigned: form.value.dateSigned,
            dateValidFrom: form.value.dateValidFrom,
            dateValidTo: form.value.dateValidTo,
            userIds: allUserIds
        })
    })

    alert('Smlouva byla vytvořena.')
    router.push('/contracts')
}
</script>


<template>
    <div
        class="w-screen h-screen flex flex-col items-center justify-start p-24 bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500">
        <div
            class="max-w-3xl w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 animate-slow-fade-in text-gray-800">
            <h2 class="text-4xl font-bold text-center text-cyan-800 mb-10">Vytvořit novou smlouvu</h2>

            <form @submit.prevent="submitForm" class="space-y-10">
                <!-- Instituce -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Instituce</label>
                    <Multiselect v-model="institutionSelect" :options="institutionOptions"
                        placeholder="Vyberte instituci" searchable />
                    <div v-if="institutionSelect === '__new__'" class="mt-2 pt-2">
                        <input v-model="newInstitutionName" placeholder="Zadejte název nové instituce"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                    </div>
                </div>

                <!-- Klienti -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Klienti</label>
                    <Multiselect v-model="form.clientIds" :options="clientOptions" mode="multiple" searchable
                        placeholder="Vyberte klienty" />
                    <div v-if="form.clientIds.length" class="mt-2 space-y-1">
                        <div v-for="id in form.clientIds" :key="id"
                            class="flex justify-between items-center bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-md">
                            <span class="text-sm">
                                {{users.find(u => u.id === id)?.firstName}} {{users.find(u => u.id === id)?.lastName
                                }}
                                ({{formatSsn(users.find(u => u.id === id)?.ssn)}})
                            </span>
                            <button @click="form.clientIds = form.clientIds.filter(i => i !== id)"
                                class="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                        </div>
                    </div>
                </div>

                <!-- Poradci -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Poradci</label>
                    <Multiselect v-model="form.advisorIds" :options="advisorOptions" mode="multiple" searchable
                        placeholder="Vyberte poradce" />
                    <div v-if="form.advisorIds.length" class="mt-2 space-y-1">
                        <div v-for="id in form.advisorIds" :key="id"
                            class="flex justify-between items-center bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-md">
                            <span class="text-sm">
                                {{users.find(u => u.id === id)?.firstName}} {{users.find(u => u.id === id)?.lastName
                                }}
                                ({{formatSsn(users.find(u => u.id === id)?.ssn)}})
                            </span>
                            <button @click="form.advisorIds = form.advisorIds.filter(i => i !== id)"
                                class="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                        </div>
                    </div>
                </div>

                <!-- Datumy -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Datum podpisu</label>
                        <input v-model="form.dateSigned" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Platnost od</label>
                        <input v-model="form.dateValidFrom" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Platnost do</label>
                        <input v-model="form.dateValidTo" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                    </div>
                </div>

                <!-- Tlačítko -->
                <div class="pt-8">
                    <button type="submit"
                        class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition">
                        Uložit smlouvu
                    </button>
                </div>
            </form>
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
