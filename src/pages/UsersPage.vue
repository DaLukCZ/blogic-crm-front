<template>
    <h1>HOME PAGE TOTO</h1>
    <p>
        <strong>Current route path:</strong> {{ $route.fullPath }}
    </p>
    <nav>
        <RouterLink to="/">Go to Home</RouterLink>
        <RouterLink to="/login">Go to About</RouterLink>
    </nav>
</template>