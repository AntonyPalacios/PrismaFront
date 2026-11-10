# PrismaFront — frontend de Sistema Prisma v2

> Acuerdos del proyecto (fuente de verdad): [`docs/AGREEMENTS.md`](docs/AGREEMENTS.md).
> Es una copia de `prisma-v2/CLAUDE.md`; si cambia la maestra, se actualiza esta copia y la de PrismaBack.
> Este archivo solo agrega lo propio de este repo y no repite las reglas.

## Qué es
SPA de Prisma: React 19 · Vite · MUI · RTK Query · React Router · JavaScript.
La v1 (hecha sin IA) vive en la rama `legacy`.

## Cómo correrlo
```bash
npm install
npm run dev        # http://localhost:5173 — necesita el backend en :8080 (proxy de /api)
npm test           # Vitest
npm run lint
npm run build
```

## Convenciones clave de este repo
- Carpetas por módulo de negocio, igual que el backend (`src/users/`, `src/catalog/`…); `src/app/` tiene store, tema, rutas y el `baseApi` compartido.
- Todo endpoint se agrega con `baseApi.injectEndpoints`: así comparte el `baseQuery` (cookies, header `X-XSRF-TOKEN`, manejo de 401).
- El estado del servidor vive solo en RTK Query; nunca se copia a otro slice. El JWT nunca se lee desde JavaScript.
- Cada pantalla sigue el prototipo de Claude Design (enlace en los acuerdos); los cambios de diseño se acuerdan en la rebanada.
- Textos visibles en español; código en inglés. Personas siempre como "Apellidos, Nombres".

## Flujo de trabajo
Antes de tocar código: tarjeta → issue en inglés → rama ligada (`gh issue develop`) → código → PR. Ver la skill `prisma-flow` en `prisma-v2/.claude/skills/`.
