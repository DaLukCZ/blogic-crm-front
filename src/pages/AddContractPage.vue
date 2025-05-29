<script setup>
import { ref, computed, onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { api } from '@/api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const contractId = route.params.id || null

const institutions = ref([])
const users = ref([])
const institutionSelect = ref(null)
const newInstitutionName = ref('')

const showSuccessModal = ref(false)
const modalMessage = ref('')

const today = new Date().toISOString().split('T')[0]
const form = ref({
    institutionId: null,
    clientIds: [],
    advisorIds: [],
    dateSigned: today,
    dateValidFrom: today,
    dateValidTo: ''
})

const loading = ref(false)
const error = ref(null)

const originalReferenceNumber = ref('')

const errors = ref({
    institution: '',
    newInstitutionName: '',
    clients: '',
    advisors: '',
    dateSigned: '',
    dateValidFrom: '',
    dateValidTo: ''
})

onMounted(async () => {
    if (auth.user?.role?.toLowerCase() === 'klient') {
        router.replace('/contracts')
    }
    try {
        institutions.value = await api('/api/Institutions')
        users.value = await api('/api/Users')

        if (contractId) {
            loading.value = true
            const data = await api(`/api/Contracts/${contractId}`)
            const inst = institutions.value.find(i => i.name === data.institutionName)
            institutionSelect.value = inst ? inst.id : '__new__'
            if (!inst) newInstitutionName.value = data.institutionName || ''

            form.value.dateSigned = data.dateSigned?.slice(0, 10) || today
            form.value.dateValidFrom = data.dateValidFrom?.slice(0, 10) || today
            form.value.dateValidTo = data.dateValidTo?.slice(0, 10) || ''

            form.value.clientIds = data.users
                .filter(u => u.roleName?.toLowerCase() === 'klient')
                .map(u => u.id)
            form.value.advisorIds = data.users
                .filter(u => u.roleName?.toLowerCase() === 'poradce')
                .map(u => u.id)

            originalReferenceNumber.value = data.referenceNumber || ''
        }
    } catch (err) {
        error.value = 'Nepodařilo se načíst data.'
        console.error(err)
    } finally {
        loading.value = false
    }
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
    users.value
        .filter(u => u.role?.name.toLowerCase() === 'klient')
        .map(u => ({
            label: `${u.firstName} ${u.lastName} (${formatSsn(u.ssn)})`,
            value: u.id
        }))
)

const advisorOptions = computed(() =>
    users.value
        .filter(u => u.role?.name.toLowerCase() === 'poradce')
        .map(u => ({
            label: `${u.firstName} ${u.lastName} (${formatSsn(u.ssn)})`,
            value: u.id
        }))
)

const isValidDate = d => d && !isNaN(Date.parse(d))

const validateForm = () => {
    let valid = true
    errors.value = {
        institution: '',
        newInstitutionName: '',
        clients: '',
        advisors: '',
        dateSigned: '',
        dateValidFrom: '',
        dateValidTo: ''
    }

    if (!institutionSelect.value) {
        errors.value.institution = 'Vyberte instituci.'
        valid = false
    }
    if (institutionSelect.value === '__new__' && !newInstitutionName.value.trim()) {
        errors.value.newInstitutionName = 'Zadejte název nové instituce.'
        valid = false
    }
    if (form.value.clientIds.length === 0) {
        errors.value.clients = 'Vyberte alespoň jednoho klienta.'
        valid = false
    }
    if (form.value.advisorIds.length === 0) {
        errors.value.advisors = 'Vyberte alespoň jednoho poradce.'
        valid = false
    }
    if (!form.value.dateSigned) {
        errors.value.dateSigned = 'Zadejte datum podpisu.'
        valid = false
    } else if (!isValidDate(form.value.dateSigned)) {
        errors.value.dateSigned = 'Datum podpisu není platné.'
        valid = false
    }
    if (!form.value.dateValidFrom) {
        errors.value.dateValidFrom = 'Zadejte datum platnosti od.'
        valid = false
    } else if (!isValidDate(form.value.dateValidFrom)) {
        errors.value.dateValidFrom = 'Datum platnosti od není platné.'
        valid = false
    }
    if (form.value.dateValidTo) {
        if (!isValidDate(form.value.dateValidTo)) {
            errors.value.dateValidTo = 'Datum platnosti do není platné.'
            valid = false
        } else if (form.value.dateValidTo < form.value.dateValidFrom) {
            errors.value.dateValidTo = 'Datum platnosti do musí být stejné nebo pozdější než platnost od.'
            valid = false
        }
    }

    return valid
}

const submitForm = async () => {
    if (!validateForm()) return

    if (contractId) {
        if (institutionSelect.value === '__new__') {
            try {
                await api('/api/Contracts/AddContractWithInstitution', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: Number(contractId),
                        referenceNumber: originalReferenceNumber.value,
                        institutionName: newInstitutionName.value.trim(),
                        dateSigned: form.value.dateSigned,
                        dateValidFrom: form.value.dateValidFrom,
                        dateValidTo: form.value.dateValidTo,
                        userIds: [...form.value.clientIds, ...form.value.advisorIds]
                    })
                })
                modalMessage.value = 'Smlouva byla úspěšně upravena s novou institucí.'
                showSuccessModal.value = true
            } catch (error) {
                alert('Nepodařilo se upravit smlouvu s novou institucí: ' + (error.message || error))
            }
            return
        }

        try {
            const contractToUpdate = {
                id: Number(contractId),
                referenceNumber: originalReferenceNumber.value,
                institutionId: institutionSelect.value,
                dateSigned: form.value.dateSigned,
                dateValidFrom: form.value.dateValidFrom,
                dateValidTo: form.value.dateValidTo,
                UserIds: [...form.value.clientIds, ...form.value.advisorIds]
            }
            await api(`/api/Contracts/${contractId}`, {
                method: 'PUT',
                body: JSON.stringify(contractToUpdate)
            })
            modalMessage.value = 'Smlouva byla úspěšně upravena.'
            showSuccessModal.value = true
        } catch (error) {
            alert('Nepodařilo se upravit smlouvu: ' + (error.message || error))
        }
    } else {
        if (institutionSelect.value === '__new__') {
            const name = newInstitutionName.value.trim()
            try {
                await api('/api/Contracts/AddContractWithInstitution', {
                    method: 'POST',
                    body: JSON.stringify({
                        referenceNumber: `SML-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                        institutionName: name,
                        dateSigned: form.value.dateSigned,
                        dateValidFrom: form.value.dateValidFrom,
                        dateValidTo: form.value.dateValidTo,
                        userIds: [...form.value.clientIds, ...form.value.advisorIds]
                    })
                })
                modalMessage.value = `Smlouva byla úspěšně vytvořena.\nByla také přidána nová instituce: ${name}.`
                showSuccessModal.value = true
            } catch (error) {
                alert('Nepodařilo se přidat instituci a vytvořit smlouvu: ' + (error.message || error))
            }
        } else {
            try {
                await api('/api/Contracts', {
                    method: 'POST',
                    body: JSON.stringify({
                        referenceNumber: `SML-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                        institutionId: institutionSelect.value,
                        dateSigned: form.value.dateSigned,
                        dateValidFrom: form.value.dateValidFrom,
                        dateValidTo: form.value.dateValidTo,
                        userIds: [...form.value.clientIds, ...form.value.advisorIds]
                    })
                })
                modalMessage.value = 'Smlouva byla úspěšně vytvořena.'
                showSuccessModal.value = true
            } catch (error) {
                alert('Nepodařilo se vytvořit smlouvu: ' + (error.message || error))
            }
        }
    }
}

const closeModal = () => {
    showSuccessModal.value = false
    router.push('/contracts')
}
</script>

<template>
    <div
        class="min-h-screen flex flex-col items-center justify-start p-6 sm:p-10 bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500">
        <div
            class="max-w-full sm:max-w-3xl w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-10 animate-slow-fade-in text-gray-800">
            <h2 class="text-3xl sm:text-4xl font-bold text-center text-cyan-800 mb-8 sm:mb-10">
                {{ contractId ? 'Upravit smlouvu' : 'Vytvořit novou smlouvu' }}
            </h2>

            <form @submit.prevent="submitForm" class="space-y-8 sm:space-y-10">
                <!-- Instituce -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                        Instituce
                    </label>
                    <Multiselect v-model="institutionSelect" :options="institutionOptions"
                        placeholder="Vyberte instituci" searchable />
                    <p v-if="errors.institution" class="text-red-600 text-sm mt-1">
                        {{ errors.institution }}
                    </p>

                    <div v-if="institutionSelect === '__new__'" class="mt-2 pt-2">
                        <input v-model="newInstitutionName" placeholder="Zadejte název nové instituce"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                        <p v-if="errors.newInstitutionName" class="text-red-600 text-sm mt-1">
                            {{ errors.newInstitutionName }}
                        </p>
                    </div>
                </div>

                <!-- Klienti -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                        Klienti
                    </label>
                    <Multiselect v-model="form.clientIds" :options="clientOptions" mode="multiple" searchable
                        placeholder="Vyberte klienty" />
                    <p v-if="errors.clients" class="text-red-600 text-sm mt-1">
                        {{ errors.clients }}
                    </p>
                    <div v-if="form.clientIds.length" class="mt-2 space-y-1 max-h-48 overflow-auto">
                        <div v-for="id in form.clientIds" :key="id"
                            class="flex justify-between items-center bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-md">
                            <span class="text-sm">
                                {{
                                    users.find((u) => u.id === id)?.firstName
                                }}
                                {{
                                    users.find((u) => u.id === id)?.lastName
                                }}
                                ({{formatSsn(users.find((u) => u.id === id)?.ssn)}})
                            </span>
                            <button @click.prevent="form.clientIds = form.clientIds.filter((i) => i !== id)"
                                class="text-red-500 hover:text-red-700 font-bold text-lg" aria-label="Odebrat klienta">
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Poradci -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                        Poradci
                    </label>
                    <Multiselect v-model="form.advisorIds" :options="advisorOptions" mode="multiple" searchable
                        placeholder="Vyberte poradce" />
                    <p v-if="errors.advisors" class="text-red-600 text-sm mt-1">
                        {{ errors.advisors }}
                    </p>
                    <div v-if="form.advisorIds.length" class="mt-2 space-y-1 max-h-48 overflow-auto">
                        <div v-for="id in form.advisorIds" :key="id"
                            class="flex justify-between items-center bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-md">
                            <span class="text-sm">
                                {{
                                    users.find((u) => u.id === id)?.firstName
                                }}
                                {{
                                    users.find((u) => u.id === id)?.lastName
                                }}
                                ({{formatSsn(users.find((u) => u.id === id)?.ssn)}})
                            </span>
                            <button @click.prevent="form.advisorIds = form.advisorIds.filter((i) => i !== id)"
                                class="text-red-500 hover:text-red-700 font-bold text-lg" aria-label="Odebrat poradce">
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Datumy -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                            Datum podpisu
                        </label>
                        <input v-model="form.dateSigned" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                        <p v-if="errors.dateSigned" class="text-red-600 text-sm mt-1">
                            {{ errors.dateSigned }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                            Platnost od
                        </label>
                        <input v-model="form.dateValidFrom" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                        <p v-if="errors.dateValidFrom" class="text-red-600 text-sm mt-1">
                            {{ errors.dateValidFrom }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">
                            Platnost do
                        </label>
                        <input v-model="form.dateValidTo" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white" />
                        <p v-if="errors.dateValidTo" class="text-red-600 text-sm mt-1">
                            {{ errors.dateValidTo }}
                        </p>
                    </div>
                </div>

                <!-- Tlačítko -->
                <div class="pt-6">
                    <button type="submit"
                        class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition">
                        Uložit smlouvu
                    </button>
                </div>
            </form>
        </div>

        <!-- Modal -->
        <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog" aria-modal="true">
            <div
                class="bg-white rounded-2xl p-6 sm:p-8 max-w-full max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
                <h3 class="text-xl sm:text-2xl font-semibold mb-4 text-cyan-700">
                    {{ contractId ? 'Smlouva upravena' : 'Smlouva vytvořena' }}
                </h3>
                <p class="text-gray-600 whitespace-pre-line mb-6">{{ modalMessage }}</p>
                <button @click="closeModal"
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
