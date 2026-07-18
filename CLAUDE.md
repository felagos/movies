# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Netflix-style browsing UI for movies/TV shows built on the TMDB API. React 19 + TypeScript + Vite, no backend — all data comes directly from `api.themoviedb.org` via client-side fetch calls authenticated with a TMDB v3 API key.

## Commands

```
yarn dev       # start Vite dev server (HMR)
yarn build     # tsc -b (project references, no emit) then vite build
yarn lint      # oxlint
yarn preview   # preview the production build
```

There is no test suite configured. There is no single-file/single-test run command since no test runner is present.

## Environment

Requires `VITE_TMDB_TOKEN` in `.env` — a TMDB **v3 API key** (not the v4 JWT bearer token). It's sent as an `api_key` query param, not an `Authorization: Bearer` header (see `tmdbFetch` in `src/api/tmdb.ts`). `.env.example` documents the variable; `.env` is gitignored.

## Architecture

**Folder-per-component convention**: every component/page lives in its own directory with its `.tsx` and `.css` co-located (e.g. `src/components/Card/Card.tsx` + `Card.css`, `src/pages/Detail/Detail.tsx` + `Detail.css`). Each component imports its own CSS file directly — there is no CSS-in-JS or shared component stylesheet. `src/index.css` holds only truly global styles (CSS variables/theme, resets, the shared `.skeleton` shimmer class).

**Data flow — TanStack Query is the only state layer for server data**:
- `src/api/tmdb.ts` — pure fetch functions and TMDB response types. No caching, no React here. `tmdbFetch<T>()` is the single low-level client all calls go through. Language is hardcoded to `en-US`.
- `src/hooks/` — one hook per query, wraps an `api/tmdb.ts` function in `useQuery`. Components never call `api/tmdb.ts` directly except for pure helpers (`imageUrl`, `getBestTrailer`) — all data fetching goes through a hook. When adding a new data need, add the fetch function to `tmdb.ts` and a corresponding hook in `hooks/`, don't fetch inside components.
- `QueryClient` is constructed once in `main.tsx` (5 min `staleTime`).

**Routing** (`react-router-dom`, `createBrowserRouter` in `main.tsx`): `/` → `Home`, `/:mediaType/:id` → `Detail`, both nested under `App` (which renders the header + `<Outlet>`). `mediaType` is `'movie' | 'tv'` and is threaded through everywhere as a literal union type (`MediaType` in `api/tmdb.ts`), not a boolean flag — reuse that type rather than inventing string literals.

**Hover-preview card (`components/Card/Card.tsx`)** — the trickiest piece, don't casually restyle without understanding why it's built this way:
- On `mouseenter`, a 700ms timer delays setting `isHovering`, matching Netflix's hover-intent delay. `useVideos` is only `enabled` once `isHovering` is true (lazy-fetch trailer, not prefetched for every card).
- `.card__overlay` (the expanded info panel) is `position: absolute`, deliberately taken out of normal flex flow — it must **never** contribute to `.card`'s layout height, because `.carousel__track` is a flex row and letting the overlay affect height would grow/shift the entire row on hover.
- `.card__media` scales via `transform: scale(1.15)` with `transform-origin: center bottom` on hover — anchored at the bottom so growth goes only upward, avoiding overlap with the absolutely-positioned overlay below it.
- `.carousel__track` has `overflow-x: auto` for native horizontal scroll snapping. Per CSS spec, an element with `overflow-x` set to anything but `visible` forces `overflow-y` to compute as `auto` too — so any vertical overflow gets clipped. This is why the track reserves extra `padding-top`/`padding-bottom` (inside a `@media (hover: hover)` block, so touch devices don't pay for it) sized to fit the worst-case expanded card. If you change the hover scale factor, overlay height, or transform-origin, you must recompute and adjust this padding (and the carousel arrow `top`/`bottom` offsets, which are pinned to match the same box) or hover previews will get silently clipped again.
- Hover/expand behavior is gated behind `@media (hover: hover)` throughout — touch devices get a flat tap-to-navigate card with no expansion.

**Skeletons**: loading states are hand-built per screen (`CardSkeleton`, `DetailSkeleton`), not a generic placeholder — they mirror the exact layout of the real content so there's no layout shift on load. `TrailerEmbed.tsx` shows a shimmer over each trailer iframe individually until its own `onLoad` fires (YouTube iframes load independently).

**Images**: always go through `imageUrl(path, size)` from `api/tmdb.ts`, never construct `image.tmdb.org` URLs by hand. Pick the TMDB size (`w300`/`w500`/`w1280`/`original`) close to the actual rendered dimensions — cards render at ~200px wide, so oversized image sizes are a real bandwidth cost here.
