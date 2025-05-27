<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const errors = ref({
    email: '',
    password: ''
})

const login = () => {
    errors.value.email = ''
    errors.value.password = ''

    let isValid = true

    if (!email.value.trim()) {
        errors.value.email = 'Zadejte prosím svůj e-mail.'
        isValid = false
    }

    if (!password.value.trim()) {
        errors.value.password = 'Heslo nesmí být prázdné.'
        isValid = false
    }

    if (!isValid) return

    console.log('Login', { email: email.value, password: password.value, remember: remember.value })
}
</script>

<template>
    <div
        class="w-screen h-screen flex flex-col items-center justify-start p-24 bg-gradient-to-tr from-cyan-300 via-sky-400 via-60% to-teal-500 transition-all duration-1000 ">


        <!-- Titulek s animací -->
        <h1 class="text-white font-extrabold text-6xl mb-24 py-8 tracking-wide typing-title"
            style="font-family: 'Poppins', sans-serif;">
            Blogic CRM
        </h1>

        <!-- Přihlašovací box -->
        <div
            class="bg-white/90 backdrop-blur-md py-8 px-12 rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slow-fade-in">
            <h2 class="text-3xl font-medium text-center text-gray-700 mb-10">Přihlášení</h2>

            <form @submit.prevent="login" class="space-y-6">

                <!-- E-mail -->
                <div class="py-2">
                    <label class="block text-sm font-semibold text-cyan-800">
                        E-mail<span class="text-red-500">*</span>
                    </label>
                    <input v-model="email" type="email" :class="[
                        'mt-1 w-full px-5 py-3 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 transition duration-200 bg-white',
                        errors.email
                            ? 'border border-red-400 focus:ring-red-400'
                            : 'border border-cyan-300 focus:ring-cyan-400'
                    ]" />
                    <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
                </div>

                <!-- Heslo -->
                <div class="py-2">
                    <label class="block text-sm font-semibold text-cyan-800">
                        Heslo<span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" :class="[
                            'mt-1 w-full px-5 py-3 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 transition duration-200 bg-white',
                            errors.password
                                ? 'border border-red-400 focus:ring-red-400'
                                : 'border border-cyan-300 focus:ring-cyan-400'
                        ]" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-4 flex items-center text-cyan-600 hover:text-cyan-800 transition duration-200">
                            <font-awesome-icon :icon="showPassword ? 'fa-eye-slash' : 'fa-eye'" />
                        </button>
                    </div>
                    <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
                </div>

                <!-- Submit -->
                <div class="flex items-center justify-between text-sm pt-2">
                    <button type="submit"
                        class="bg-gradient-to-r from-cyan-500 to-teal-500 text-white w-full py-3 rounded-xl shadow-md hover:brightness-110 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
                        PŘIHLÁSIT SE
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
        transform: translateY(30px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slow-fade-in {
    animation: slow-fade-in 1s ease-out forwards;
}

.typing-title {
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid white;
    width: 0;
    line-height: 0.8;
    animation: typing 1s steps(10, end) forwards;
}

@keyframes typing {
    0% {
        width: 0;
        border-right: 3px solid white;
    }

    99% {
        border-right: 3px solid white;
    }

    100% {
        width: 10ch;
        border-right: 0;
    }
}
</style>
