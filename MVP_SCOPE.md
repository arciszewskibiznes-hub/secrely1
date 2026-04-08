# Secrely — MVP Scope

## What Is Included in This MVP

### Pages (16 total)
- [x] Welcome / Landing screen
- [x] Sign In page
- [x] Sign Up page
- [x] Home Feed (with tabs: Following / For You / Trending)
- [x] Explore Creators (search + category filters)
- [x] Creator Profile page (with stats, posts, follow action)
- [x] Post Detail page (with comments, unlock flow)
- [x] User Profile page (with saved/unlocked/liked tabs)
- [x] Wallet / Credits page (packages + transaction history)
- [x] Messages page (conversation list + chat view)
- [x] Notifications page (grouped unread/read)
- [x] Creator Dashboard (metrics, chart, top posts, quick actions)
- [x] New Post / Upload page (with locked/free toggle, category tags)
- [x] Settings page (appearance, account, notifications, privacy)
- [x] Admin Moderation page (review queue with approve/reject)
- [x] 404 Not Found page

### Core Functionality
- [x] Mock authentication flow (any email/password works)
- [x] Persistent session via localStorage
- [x] Credit balance system (starts at 500 credits)
- [x] Unlock post flow with credit deduction
- [x] Unlocked state persists across page refreshes
- [x] Creator follow/unfollow
- [x] Notification read/unread state
- [x] In-app messaging with send functionality
- [x] Dashboard metrics with animated bar chart
- [x] Moderation queue with approve/reject actions
- [x] Settings toggles (notifications, privacy)
- [x] Sign out with confirmation

### UI/UX
- [x] Mobile-first responsive layout
- [x] Desktop sidebar navigation
- [x] Mobile bottom navigation
- [x] Skeleton loaders on feed
- [x] Empty states
- [x] Toast notifications
- [x] Smooth page entrance animations (Motion)
- [x] Locked content blur + overlay
- [x] Unlock modal with balance check
- [x] Premium card hover effects
- [x] Polished typography hierarchy (DM Sans + Playfair Display)
- [x] Consistent design system with CSS variables

---

## What Is Intentionally Excluded

| Feature | Reason Excluded |
|---------|----------------|
| Real authentication | No backend in MVP — any credentials work |
| Payment processing | No Stripe or real payments — credits are fake |
| Real media upload | File input is UI-only, no actual upload |
| Video playback | Thumbnails only — no video player |
| Real-time messaging | Messages are local state only |
| Real-time notifications | Mock data only |
| Search functionality | Explore search filters mock data only |
| Creator verification flow | Displayed but not interactive |
| Subscription recurring billing | Subscribe is follow-only in MVP |
| Content delivery CDN | Images via Unsplash URLs |
| Email notifications | UI setting only |
| Two-factor authentication | UI setting only |
| Creator earnings payout | Dashboard shows fake data only |
| Content reporting | UI visible but no action |
| Push notifications | Not implemented |
| Mobile app | Web only |

---

## Recommended Next Implementation Steps

### Phase 1 — Backend Foundation
1. Set up authentication (NextAuth.js or Supabase Auth)
2. Create database schema (PostgreSQL via Prisma or Supabase)
3. Replace `/src/data/` files with API routes (`/app/api/`)
4. Add image upload to Cloudflare R2 or AWS S3

### Phase 2 — Payments & Monetisation
5. Integrate Stripe for credit purchases
6. Build credit transaction ledger
7. Implement real unlock flow with server-side verification
8. Add creator payout system (Stripe Connect)

### Phase 3 — Real-Time Features
9. Add WebSocket support for live messaging (Pusher or Ably)
10. Add push notifications (web push API)
11. Add real-time notification delivery

### Phase 4 — Creator Tools
12. Build video upload and transcoding pipeline (Mux or Cloudflare Stream)
13. Add detailed analytics dashboard (views, retention, revenue)
14. Build subscription management
15. Add creator verification workflow

### Phase 5 — Growth & Quality
16. Add SEO and Open Graph metadata per creator
17. Add content search with Algolia or Meilisearch
18. Add content moderation AI (automated + human queue)
19. Add mobile apps (React Native or Expo)
20. Add A/B testing infrastructure
