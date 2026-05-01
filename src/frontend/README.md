# Frontend

SPA React unificada (catalog + user).

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind 4 · React Router 7

## Documentação

- [`UI.md`](./UI.md) — mapa de telas, princípios de design, fluxos.

## Scripts

```bash
cd src/frontend
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc -b && vite build
npm run lint
npm run preview
```

## Estrutura

```
src/         shell de roteamento (main.tsx, App.tsx)
catalog/     páginas e componentes do catálogo (JSX legado)
user/        páginas, componentes, contexts e API de usuário (TSX)
```

`vite.config.ts` herda variáveis de ambiente de `src/.env` (raiz do monorepo).
