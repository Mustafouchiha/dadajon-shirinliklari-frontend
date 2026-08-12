# Dadajon Tort -- Frontend

Telegram Mini App (React + Vite + Tailwind CSS).

## Lokal ishga tushirish

```bash
npm install
npm run dev
```

Vite dev-server `/api` so'rovlarini avtomatik `localhost:5000` (backend)ga proksi qiladi -- `.env` bo'sh qoldirilsa bo'ldi.

## Vercel'ga deploy qilish

1. [vercel.com](https://vercel.com) -> New Project -> GitHub repo, Root Directory = `frontend`
2. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_BOT_USERNAME=DadajonTortBot
   ```
3. Deploy -> domenni Render backend'dagi `MINI_APP_URL`/`CLIENT_URL` ga qo'ying, botga Menu Button sifatida bering.
