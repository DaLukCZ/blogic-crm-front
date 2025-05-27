<template>
    <div
        class="w-screen h-screen flex flex-col items-center justify-start p-24 bg-gradient-to-tr from-cyan-300 via-sky-400 via-60% to-teal-500 transition-all duration-1000">

        <div
            class="max-w-3xl w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 animate-slow-fade-in text-gray-800">
            <h2 class="text-4xl font-bold text-center text-cyan-800 mb-10">Vytvořit novou smlouvu</h2>

            <form @submit.prevent="submitForm" class="space-y-10">

                <!-- Instituce -->
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Instituce</label>
                    <Multiselect v-model="form.institution" :options="institutionOptions" label="label"
                        valueProp="value" placeholder="Vyberte instituci" searchable class="text-black" />
                    <div v-if="form.institution === '__new__'" class="mt-2 pt-2">
                        <input v-model="newInstitution" placeholder="Zadejte název nové instituce"
                            class="w-full px-4 py-3 mt-2 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                        <button type="button" @click="addInstitution"
                            class="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-xl shadow transition">
                            Přidat instituci
                        </button>
                    </div>
                </div>


                <!-- Účastníci -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Klient</label>
                        <Multiselect v-model="form.clientId" :options="clientOptions" placeholder="Vyberte klienta"
                            searchable />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Poradce</label>
                        <Multiselect v-model="form.managerId" :options="advisorOptions" placeholder="Vyberte poradce"
                            searchable />
                    </div>
                </div>

                <!-- Datumové údaje -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Datum podpisu</label>
                        <input v-model="form.dateSigned" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Platnost od</label>
                        <input v-model="form.dateValidFrom" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1 pt-2">Platnost do</label>
                        <input v-model="form.dateValidTo" type="date"
                            class="w-full px-4 py-3 border border-cyan-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
                    </div>
                </div>


                <!-- Submit -->
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

<script setup>
import { ref, computed } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

// Data
const institutions = ref(['ČSOB', 'Axa', 'AEGON'])
const clients = ref([
    { id: 1, name: 'Tomáš Novák' },
    { id: 2, name: 'Jakub Tvrdoň' }
])
const advisors = ref([
    { id: 5, name: 'Jana Poradkyně' },
    { id: 6, name: 'Milan Dlouhý' }
])

// Options for searchable selects
const institutionOptions = computed(() => [
    ...institutions.value.map(inst => ({ label: inst, value: inst })),
    { label: '+ Přidat novou instituci', value: '__new__' }
])

const clientOptions = computed(() =>
    clients.value.map(c => ({ label: c.name, value: c.id }))
)

const advisorOptions = computed(() =>
    advisors.value.map(a => ({ label: a.name, value: a.id }))
)

// Datumy
const today = new Date().toISOString().split('T')[0]

// Formulář
const form = ref({
    number: '',
    institution: '',
    clientId: null,
    managerId: null,
    dateSigned: today,
    dateValidFrom: today,
    dateValidTo: ''
})

// Přidání nové instituce
const newInstitution = ref('')
const addInstitution = () => {
    const trimmed = newInstitution.value.trim()
    if (trimmed && !institutions.value.includes(trimmed)) {
        institutions.value.push(trimmed)
        form.value.institution = trimmed
        newInstitution.value = ''
    }
}

// Odeslání formuláře
const submitForm = () => {
    if (
        !form.value.number ||
        !form.value.institution ||
        !form.value.clientId ||
        !form.value.managerId
    ) {
        alert('Vyplňte všechna povinná pole.')
        return
    }

    console.log('Odesílám smlouvu:', form.value)
    alert('Smlouva byla vytvořena.')
}
</script>


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
