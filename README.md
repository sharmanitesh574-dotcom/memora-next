# Memora Next.js — Frontend v2

Modern React frontend for Memora, replacing the 388KB monolith `index.html`.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — the app proxies `/api/*` to your Express backend.

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (landing)/          # Public landing page (SSR)
│   ├── (auth)/             # Login & signup
│   ├── (app)/              # Authenticated app shell
│   │   ├── layout.jsx      # Sidebar + mobile nav + overlays
│   │   ├── dashboard/      # Home screen
│   │   ├── memories/       # All memories grid
│   │   ├── chat/           # AI chat
│   │   ├── goals/          # Goals & actions board
│   │   ├── insights/       # AI insights + stats
│   │   ├── search/         # Web + memory search
│   │   ├── timeline/       # Chronological view
│   │   ├── settings/       # User settings
│   │   └── billing/        # Plan & billing
│   └── share/[token]/      # Public shared memory page
│
├── components/
│   ├── ui/                 # Base UI components (Button, Input, Badge...)
│   ├── memory/             # MemoryCard, MemoryDrawer, MemoryGrid
│   ├── chat/               # ChatMessage, ChatInput, ContextPills
│   ├── capture/            # QuickCapture, MobileFab, BottomSheet
│   ├── voice/              # VoiceOverlay, Waveform
│   ├── insights/           # ActionItems, InsightCard, DigestCard
│   └── layout/             # Sidebar, MobileNav, TopBar
│
├── lib/
│   ├── api.js              # Centralized fetch wrapper
│   └── auth.js             # Token + user management
│
├── hooks/
│   └── index.js            # useTimeAgo, useGreeting, useVoiceRecorder, useIsMobile
│
├── stores/
│   └── index.js            # Zustand stores (memories, user, UI)
│
├── styles/
│   └── globals.css         # Tailwind + Memora design tokens
│
└── i18n/                   # Internationalization (next-intl)
    └── messages/
        ├── en.json
        ├── hi.json
        └── ...
```

## Migration strategy

The Express API stays unchanged. This frontend replaces only `public/index.html`.

### Phase 1: Deploy alongside (now)
1. Deploy this Next.js app on Vercel
2. Point your domain to Vercel
3. API calls proxy to your Render backend via `next.config.mjs` rewrites
4. Both the old monolith and new app work simultaneously

### Phase 2: Migrate pages (1-2 weeks)
Migrate one page at a time from the monolith:
- Dashboard ✅ (done)
- Login/Signup ✅ (done)
- Landing ✅ (done)
- Memories → use MemoryCard component, add filters
- Chat → migrate streaming logic from monolith
- Goals → migrate kanban board
- Settings → migrate all settings sections
- Each page is independent — ship as you go

### Phase 3: Remove monolith
Once all pages are migrated, remove `public/index.html` from the Express repo.
The Express backend becomes a pure API server.

## Key differences from monolith

| Monolith | Next.js |
|----------|---------|
| 388KB single file | Route-based code splitting (~40KB initial) |
| 215 global functions | Component-scoped logic |
| Vanilla CSS variables | Tailwind utilities + design tokens |
| DOM manipulation | React state + Zustand stores |
| No SSR | Landing page is server-rendered (SEO) |
| No i18n | next-intl ready |
| No type safety | Ready for TypeScript migration |

## Design system

Design tokens live in `src/styles/globals.css` as CSS custom properties.
They match the existing Memora palette so the transition is seamless.

Fonts: Bricolage Grotesque (display), DM Sans (body), Instrument Serif (reflections), JetBrains Mono (code).
