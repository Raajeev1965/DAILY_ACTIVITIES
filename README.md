# Daily Log

Mobile-first, local-first app for quick notes and habit tracking.
Next.js (App Router) + TypeScript + Tailwind CSS + Lucide.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Data is stored in your browser (`localStorage`, key `dailylog:v1`).

## Deploy

```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then import the repo at https://vercel.com/new. No environment variables or settings are needed; Vercel detects Next.js automatically.

## Structure

- `app/` layout, global styles, and the single page that switches tabs
- `components/` QuickInput, Timeline, HabitList, SearchArchive, Analytics, BottomNav, ThemeToggle
- `hooks/` `useLocalStorage` and the `StoreProvider` (all state and actions)
- `lib/` types, sample data, helpers

## Next steps

Swap `useLocalStorage` for an API or database (Supabase, Vercel Postgres) while keeping the `useStore` actions unchanged. Replace the mic simulation in `QuickInput` with the Web Speech API.
