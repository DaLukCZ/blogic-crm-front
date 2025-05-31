# Blogic CRM – Frontend (Vue.js 3)

Tento repozitář slouží jako klientská část aplikace **Blogic CRM** – uživatelské rozhraní pro správu smluv, klientů a poradců.

Backendová část je dostupná v samostatném repozitáři: [blogic-crm-back](https://github.com/DaLukCZ/blogic-crm-back)

---

## 🌐 Použité technologie

- Vue 3 (Composition API)
- Vite
- Vue Router
- Tailwind CSS (styly a layout)
- Fetch API (pro volání backendu)

---

## 💻 Požadavky na prostředí

| Nástroj              | Verze    |
|----------------------|----------|
| Node.js              | 18+      |
| npm                  | 8+       |
| Visual Studio Code   | libovolná|

---

## 🚀 Spuštění frontendu

1. Repozitář je nejprve nutné naklonovat:

   ```bash
   git clone https://github.com/DaLukCZ/blogic-crm-front.git
   ```

2. Složka projektu by měla být otevřena v editoru (např. Visual Studio Code).

3. V terminálu by měl být spuštěn následující příkaz pro instalaci závislostí:
   ```bash
   npm install
   ```

4. Aplikace se spustí pomocí příkazu:
   ```bash
   npm run dev
   ```

Frontend bude dostupný na adrese `http://localhost:5173`.

⚠️ Backend API (`blogic-crm-back`) by mělo být spuštěno na `https://localhost:7046`. V případě potřeby lze upravit adresu `baseUrl` ve funkci `api()` ve složce `/src`.

---

## 🧭 Funkce aplikace

- Seznam smluv, klientů a poradců
- Detailní pohled na každou entitu
- Prokliky mezi smlouvou a klientem/poradcem
- CRUD operace (Create, Read, Update, Delete)
- Formuláře s validací
- Stylování pomocí Tailwind CSS

---

## 📁 Struktura projektu

- `/src/pages` – jednotlivé stránky (např. `ContractsPage.vue`, `UsersPage.vue`, `LoginPage.vue`)
- `/src/assets` – statické soubory (např. obrázky, styly)
- `/src/api.js` – funkce `api(path, options)` pro volání backendu přes `fetch`
- `/src/auth.js` – správa přihlášení a tokenu
- `/src/main.js` – vstupní bod aplikace
- `/src/App.vue` – kořenová komponenta aplikace