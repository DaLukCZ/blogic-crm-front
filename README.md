# Blogic CRM – Frontend (Vue.js 3)

Tento repozitář slouží jako klientská část aplikace **Blogic CRM** – uživatelské rozhraní pro správu smluv, klientů a poradců.

Backendová část je dostupná v samostatném repozitáři: [blogic-crm-back](https://github.com/DaLukCZ/blogic-crm-back)

---

## 🌐 Použité technologie

- Vue 3 (Composition API)
- Vite
- Vue Router
- Axios (pro volání API)

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

3. V terminálu by měl být spuštěn následující příkaz pro instalaci závislostí V terminalu :
   ```bash
   npm install
   ```

4. Aplikace se spustí pomocí příkazu:
   ```bash
   npm run dev
   ```

Frontend bude dostupný na adrese `http://localhost:5173`.

⚠️ Backend API (`blogic-crm-back`) by mělo být spuštěno na `https://localhost:7046`. V případě potřeby lze upravit `baseURL` v konfiguraci Axiosu.

---

## 🧭 Funkce aplikace

- Seznam smluv, klientů a poradců
- Detailní pohled na každou entitu
- Prokliky mezi smlouvou a klientem/poradcem
- CRUD operace (vytváření, úprava, mazání záznamů)
- Formuláře s validací

---

## 📁 Struktura projektu

- `/src/components` – znovupoužitelné UI komponenty
- `/src/views` – jednotlivé stránky (Smlouvy, Klienti, Poradci)
- `/src/router` – konfigurace směrování
- `/src/services` – API volání pomocí Axios

---

## 🔗 Související repozitář

Backendová část aplikace je dostupná v samostatném repozitáři:  
➡️ [https://github.com/DaLukCZ/blogic-crm-back](https://github.com/DaLukCZ/blogic-crm-back)
