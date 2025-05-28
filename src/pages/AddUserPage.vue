<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { api } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '',
    phoneNumber: '',
    ssn: '',
    roleId: 1
})

const showPassword = ref(false)
const showSuccessModal = ref(false)
const addedUserName = ref('')
const backendError = ref('')

const errors = ref({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '',
    phoneNumber: '',
    ssn: '',
    roleId: ''
})

function isValidSsnFormat(ssn) {
    return /^\d{6}\/?\d{3,4}$/.test(ssn)
}

function isDivisibleBy11Rule(ssn) {
    const clean = ssn.replace('/', '')
    if (!/^\d+$/.test(clean)) return false
    return parseInt(clean) % 11 === 0
}


const submitUser = async () => {
    Object.keys(errors.value).forEach(key => (errors.value[key] = ''))
    backendError.value = ''
    let isValid = true

    if (!form.value.username.trim()) {
        errors.value.username = 'Zadejte uživatelské jméno.'
        isValid = false
    }
    if (!form.value.password.trim()) {
        errors.value.password = 'Heslo je povinné.'
        isValid = false
    }
    if (!form.value.firstName.trim()) {
        errors.value.firstName = 'Zadejte jméno.'
        isValid = false
    }
    if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Zadejte příjmení.'
        isValid = false
    }
    if (!form.value.email.trim()) {
        errors.value.email = 'Zadejte e-mail.'
        isValid = false
    }
    if (!form.value.countryCode.trim() || form.value.countryCode.length > 5) {
        errors.value.countryCode = 'Zadejte platný kód země (max 6 znaků).'
        isValid = false
    }
    if (!form.value.phoneNumber.trim() || form.value.phoneNumber.length > 15) {
        errors.value.phoneNumber = 'Zadejte telefonní číslo (max 15 znaků).'
        isValid = false
    }
    if (!form.value.ssn.trim()) {
        errors.value.ssn = 'Rodné číslo je povinné.'
        isValid = false
    } else if (!isValidSsnFormat(form.value.ssn)) {
        errors.value.ssn = 'Zadejte správný formát (např. 850101/1234).'
        isValid = false
    } else if (!isDivisibleBy11Rule(form.value.ssn)) {
        errors.value.ssn = 'Rodné číslo nesplňuje pravidlo dělitelnosti 11.'
        isValid = false
    }

    if (!isValid) return

    const payload = {
        username: form.value.username,
        passwordHash: form.value.password,
        roleId: form.value.roleId,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        countryCode: form.value.countryCode,
        number: form.value.phoneNumber,
        ssn: form.value.ssn.replace('/', '')
    }

    try {
        await api('/api/Users', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        addedUserName.value = `${form.value.firstName} ${form.value.lastName}`
        showSuccessModal.value = true
    } catch (err) {
        console.error('Chyba při odesílání:', err)
        backendError.value = err.message || 'Došlo k chybě při vytváření uživatele.'
    }
}

const closeModal = () => {
    showSuccessModal.value = false
    router.push('/user/list')
}
</script>

<template>
    <div
        class="w-screen h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-tr from-cyan-300 via-sky-400 to-teal-500">
        <div
            class="bg-white/90 backdrop-blur-md px-12 py-8 rounded-3xl shadow-2xl w-full max-w-3xl mx-4 animate-slow-fade-in">
            <h2 class="text-3xl font-bold text-center text-gray-700 mb-3">Přidat uživatele</h2>

            <form @submit.prevent="submitUser" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Username -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Uživatelské jméno <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.username" type="text" placeholder="Sejtam" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.username ? 'border border-red-400' : 'border border-cyan-300'
                    ]" />
                    <p v-if="errors.username" class="text-sm text-red-600 mt-1">{{ errors.username }}</p>
                </div>

                <!-- Password -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Heslo <span
                            class="text-red-500">*</span></label>
                    <div class="relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="form.password"
                            placeholder="Heslo@123" :class="[
                                'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                                errors.password ? 'border border-red-400' : 'border border-cyan-300'
                            ]" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-4 flex items-center text-cyan-600 hover:text-cyan-800">
                            <font-awesome-icon :icon="showPassword ? 'fa-eye-slash' : 'fa-eye'" />
                        </button>
                    </div>
                    <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
                </div>

                <!-- First name -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Jméno <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.firstName" type="text" placeholder="Tomáš" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.firstName ? 'border border-red-400' : 'border border-cyan-300'
                    ]" />
                    <p v-if="errors.firstName" class="text-sm text-red-600 mt-1">{{ errors.firstName }}</p>
                </div>

                <!-- Last name -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Příjmení <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.lastName" type="text" placeholder="Novák" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.lastName ? 'border border-red-400' : 'border border-cyan-300'
                    ]" />
                    <p v-if="errors.lastName" class="text-sm text-red-600 mt-1">{{ errors.lastName }}</p>
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">E-mail <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.email" type="email" placeholder="tomas.novak@seznam.cz" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.email ? 'border border-red-400' : 'border border-cyan-300'
                    ]" />
                    <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
                </div>

                <!-- Phone -->
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm font-semibold text-cyan-800">Kód země <span
                                class="text-red-500">*</span></label>
                        <input v-model="form.countryCode" type="text" maxlength="6" placeholder="+420" :class="[
                            'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                            errors.countryCode ? 'border border-red-400' : 'border border-cyan-300'
                        ]" />
                        <p v-if="errors.countryCode" class="text-sm text-red-600 mt-1">{{ errors.countryCode }}</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-cyan-800">Telefon <span
                                class="text-red-500">*</span></label>
                        <input v-model="form.phoneNumber" type="text" maxlength="15" placeholder="789543213" :class="[
                            'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                            errors.phoneNumber ? 'border border-red-400' : 'border border-cyan-300'
                        ]" />
                        <p v-if="errors.phoneNumber" class="text-sm text-red-600 mt-1">{{ errors.phoneNumber }}</p>
                    </div>
                </div>

                <!-- SSN -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Rodné číslo <span
                            class="text-red-500">*</span></label>
                    <input v-model="form.ssn" type="text" maxlength="11" placeholder="850101/1234" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.ssn ? 'border border-red-400' : 'border border-cyan-300'
                    ]" />
                    <p v-if="errors.ssn" class="text-sm text-red-600 mt-1">{{ errors.ssn }}</p>
                </div>

                <!-- Role -->
                <div>
                    <label class="block text-sm font-semibold text-cyan-800">Role <span
                            class="text-red-500">*</span></label>
                    <select v-model="form.roleId" :class="[
                        'mt-1 w-full px-4 py-3 rounded-lg shadow-sm text-gray-700 bg-white',
                        errors.roleId ? 'border border-red-400' : 'border border-cyan-300'
                    ]">
                        <option :value="1">Klient</option>
                        <option :value="2">Poradce</option>
                        <option :value="3">Admin</option>
                    </select>
                    <p v-if="errors.roleId" class="text-sm text-red-600 mt-1">{{ errors.roleId }}</p>
                </div>

                <!-- Submit button -->
                <div class="md:col-span-2">
                    <button type="submit"
                        class="bg-gradient-to-r from-cyan-500 to-teal-500 text-white w-full py-3 rounded-xl shadow-md hover:brightness-110 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
                        PŘIDAT UŽIVATELE
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center animate-slow-fade-in">
            <h3 class="text-xl font-semibold mb-4 text-cyan-700">Uživatel přidán</h3>
            <p class="text-gray-600 mb-6">Uživatel <strong>{{ addedUserName }}</strong> byl úspěšně přidán.</p>
            <button @click="closeModal" class="px-6 py-2 bg-cyan-600 text-white rounded-lg shadow hover:brightness-110">
                OK
            </button>
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
