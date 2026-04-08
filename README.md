# Secrely — Premium Creator Platform MVP

A polished, investor-demo-ready creator platform frontend built with Next.js 14, TypeScript, Tailwind CSS, Zustand, and Motion. Users browse creators, view teaser content, and unlock premium posts using in-app credits.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Primitives | Radix UI (via custom components) |
| Animation | Motion (Framer Motion v11) |
| State | Zustand (with localStorage persistence) |
| Icons | Lucide React |
| Fonts | DM Sans + Playfair Display (Google Fonts) |

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/            # Unauthenticated routes (sign-in, sign-up)
│   ├── (main)/            # Authenticated app routes
│   │   ├── feed/          # Home feed
│   │   ├── explore/       # Creator discovery
│   │   ├── wallet/        # Credits & transactions
│   │   ├── messages/      # DM conversations
│   │   ├── notifications/ # Activity feed
│   │   ├── dashboard/     # Creator dashboard
│   │   │   └── new-post/  # Upload flow
│   │   ├── profile/       # User profile
│   │   ├── settings/      # App settings
│   │   └── admin/         # Moderation queue
│   ├── creator/[username] # Creator profile pages
│   ├── post/[id]/         # Post detail
│   ├── page.tsx           # Landing page
│   ├── not-found.tsx      # 404
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Design tokens + global styles
├── components/
│   ├── ui/                # Primitive UI components
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Desktop sidebar
│   ├── BottomNav.tsx      # Mobile bottom navigation
│   ├── PostCard.tsx       # Feed post card
│   ├── CreatorCard.tsx    # Creator discovery card
│   ├── UnlockModal.tsx    # Credit unlock flow
│   ├── StatCard.tsx       # Dashboard metric card
│   ├── SkeletonPost.tsx   # Loading skeletons
│   └── EmptyState.tsx     # Empty state display
├── data/                  # All mock data (replace with API calls)
│   ├── users.ts           # Creators & current user
│   ├── posts.ts           # Posts with teaser/locked content
│   ├── notifications.ts   # Notification items
│   ├── messages.ts        # Conversations & messages
│   ├── credits.ts         # Packages, transactions, chart data
│   └── moderation.ts      # Moderation queue items
├── store/                 # Zustand state stores
│   ├── authStore.ts       # Auth / current user session
│   ├── creditsStore.ts    # Credit balance & transactions
│   ├── unlockedStore.ts   # Unlocked posts & subscriptions
│   ├── notificationsStore.ts
│   └── index.ts           # Barrel export
├── hooks/
│   └── useToast.ts        # Toast notification hook
├── lib/
│   ├── utils.ts           # cn(), formatNumber(), timeAgo(), etc.
│   └── localStorage.ts    # localStorage helpers
└── types/
    └── index.ts           # Shared TypeScript types
```

---

## Installation

```bash
# Clone or copy the project
cd secrely

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Locally

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint check
```

---

## What Is Mocked

Everything in the `/src/data/` directory is mock data:

- **Users & Creators** — 6 fully fleshed-out creator profiles with avatars (Unsplash URLs), bios, stats
- **Posts** — 12 posts across 6 creators, mix of locked/unlocked, with realistic captions and teasers
- **Notifications** — 8 realistic notification items
- **Messages** — 6 conversations with message threads
- **Credits** — 4 credit packages, transaction history, dashboard chart data
- **Moderation** — 6 moderation queue items (pending/approved/rejected)

**Authentication** is fully simulated — any email/password combination works. The session is persisted in localStorage.

**Credits** start at 500. Purchasing packages in the Wallet page adds credits instantly (no payment processor).

---

## localStorage Usage

Zustand stores use `persist` middleware to save to localStorage under the `secrely_` prefix:

| Key | Contents |
|-----|----------|
| `secrely_auth` | Authenticated user object |
| `secrely_credits` | Credit balance + transaction history |
| `secrely_unlocked` | Unlocked post IDs + subscriptions |
| `secrely_notifications` | Notification read state |

This means unlocked posts remain unlocked across page refreshes, and credit balances persist.

---

## What Should Be Connected Later

| Feature | Integration Point |
|---------|------------------|
| Auth | Replace `authStore.signIn/signUp` with real API calls (e.g., NextAuth, Supabase Auth) |
| Creators/Posts | Replace `/src/data/users.ts` and `/src/data/posts.ts` with API fetches |
| Credits/Payments | Add Stripe integration in `creditsStore.addCredits` |
| Content unlock | Replace `unlockPost()` with `POST /api/posts/:id/unlock` |
| Notifications | Replace mock data with WebSocket or polling |
| Messages | Replace with real-time messaging (e.g., Pusher, Ably) |
| Media upload | Connect new-post page file input to S3 or Cloudflare R2 |
| Moderation | Connect admin page to a real content moderation API |
| Image hosting | Replace Unsplash URLs with your own CDN |

---

## Design System

- **Colors:** Soft white background, purple (`hsl(270, 75%, 60%)`) as primary accent
- **Typography:** DM Sans (body) + Playfair Display (headings)
- **Radius:** `0.875rem` base, rounded-2xl for cards
- **Shadows:** Soft, layered — `card` and `card-hover` variants
- **Motion:** Entrance animations via Motion library, subtle scale on interaction

---

## Pages

| Route | Page |
|-------|------|
| `/` | Landing / Welcome |
| `/sign-in` | Sign In |
| `/sign-up` | Sign Up |
| `/feed` | Home Feed |
| `/explore` | Explore Creators |
| `/creator/[username]` | Creator Profile |
| `/post/[id]` | Post Detail |
| `/wallet` | Credits & Wallet |
| `/messages` | Direct Messages |
| `/notifications` | Notifications |
| `/dashboard` | Creator Dashboard |
| `/dashboard/new-post` | Create New Post |
| `/profile` | User Profile |
| `/settings` | Settings |
| `/admin` | Moderation Queue |
| `*` | 404 Not Found |
