# Teacher's Pet — Release Checklist

Target: **live by mid-August 2026**, maintenance-only by the time school
starts. Revised 2026-07 when Andrew accepted a full-time teaching position:
August is now classroom-setup season, so all launch work front-loads into
July. Launching *before* pre-service week also means the app is live when
teachers build their sub folders — the acquisition window — instead of
launching during it.

Legend: 🧑 = needs Andrew (accounts/money/decisions) · 🤖 = Claude can do it
· ✅ = done

---

## Phase 1 — Anytime before launch (no domain needed)

### Product
- [x] ✅ Mobile-responsive app nav (hamburger menu below the sm breakpoint)
- [ ] 🧑🤖 Full click-through test of every flow, desktop + phone:
      signup → onboard → build plan → hit free cap → subscribe (4242) →
      manage billing → cancel → seating chart → groups → worksheet → print all
- [ ] 🧑 Beta tester round 2: send both testers the current build, collect
      notes, fix what they hit
- [ ] 🤖 Fix bugs from beta round 2
- [ ] 🧑 Refresh the demo account with realistic content (a finalized plan,
      a class roster with attributes, a seating chart room config)
- [ ] 🤖 (Optional) Persist seating-chart room configs to DB instead of
      localStorage so layouts follow teachers across devices
- [ ] 🤖 (Optional) `?plan=basic|pro` on /signup carries through onboarding
      to a pre-selected Billing page

### Infrastructure & safety nets
- [ ] 🧑 Anthropic Console: enable auto-reload (below $5 → +$25) and set a
      $25/month spend limit — 5 minutes at console.anthropic.com
- [ ] 🧑 Decide on Supabase Pro ($25/mo): the free tier has no automated
      backups. Once strangers are paying, a database you can't restore is
      the biggest single risk. Recommended: upgrade during launch week.
- [ ] 🤖 Add uptime monitoring (UptimeRobot free tier pinging / and the
      Supabase health endpoint)
- [ ] 🧑 Enable Vercel Analytics (one toggle in the Vercel dashboard) so
      September conversion questions are answerable
- [ ] 🤖 Error boundary reporting: at minimum, log client errors somewhere
      visible (console-only today)

### Content & legal
- [ ] 🧑 Read Terms of Service and Privacy Policy start to finish once —
      they were AI-drafted; you're the one legally standing behind them
- [ ] 🤖 Social share image (og:image) — currently link previews are
      text-only; a simple branded card image improves clicks from FB groups

---

## Phase 2 — Domain day (THIS WEEK — waiting saves ~$2 and costs the timeline)

- [ ] 🧑 Buy the domain (teacherspet.app or similar, ~$12–20/yr)
- [ ] 🧑 Add domain to Vercel project (Settings → Domains; Vercel handles DNS
      config UI, ~10 min)
- [ ] 🧑 Set up email on the domain:
      1. Resend.com — verify the domain (SPF + DKIM records), then
      2. Supabase → Auth → SMTP: point at Resend so confirmation emails
         send reliably (the rate-limit problem from June disappears)
      3. Email forwarding for support@ → drew.kozikowski@gmail.com
         (Cloudflare Email Routing or ImprovMX, free) — Terms/Privacy/Contact
         already reference support@teacherspet.app
- [ ] 🧑 Supabase → Auth → URL Configuration: set Site URL to the new domain
      and add it to redirect allowlist (config.toml has a TODO(domain) marker)
- [ ] 🤖 Update og:url / twitter meta in index.html to the new domain
- [ ] 🤖 Re-enable email confirmation (if it was left off during beta)
- [ ] 🤖 Grep for TODO(domain) and resolve every marker
- [ ] 🧑🤖 Test signup end-to-end on the new domain including the
      confirmation email landing on /auth/callback

---

## Phase 3 — Stripe go-live (late July)

Follow SETUP_STRIPE.md step 8. In order:

- [ ] 🧑 Activate the Stripe account (sole proprietor: name, SSN, bank
      account for payouts — ~10 min)
- [ ] 🧑 Create the four prices in **live mode** (same $9/$79/$18/$158)
- [ ] 🧑 Create the live-mode webhook endpoint (same URL, same 4 events),
      capture the live signing secret
- [ ] 🧑 Create the FOUNDING50 promo code in live mode (50% off first year,
      limit 50 redemptions)
- [ ] 🤖 Swap the six Supabase secrets to live values, redeploy the three
      billing functions (Claude can run this with the live keys — never
      paste sk_live into chat; set it via `npx supabase secrets set` directly
      or the dashboard)
- [ ] 🧑 Purge test-mode subscriptions (SQL in SETUP_STRIPE.md step 8.6)
- [ ] 🧑 One real charge test: subscribe with a real card, confirm the tier
      appears, then refund yourself from the Stripe dashboard
- [ ] 🧑 Configure Stripe email receipts (Settings → Emails) so subscribers
      get proper receipts

---

## Phase 4 — Launch (Aug 1–15, BEFORE pre-service week)

New-teacher advantages to use:
- "I'm a classroom teacher and I built this" beats "I'm a sub" in every
  teacher group — and your own school's staff room is now a seed market.
- Dogfood your own classroom: build your real sub folder, roster, and
  seating chart in the app during setup week. That's your screenshots,
  your demo content, and your authenticity in one move.
- After school starts you get ~15 min/day for this. Design for it:
  support email forwarding to your phone, uptime alerts, nothing that
  needs daily hands-on attention.

- [ ] 🧑 Soft launch: HCPSS colleagues, the two beta testers' schools,
      personal network. Message: "set up your emergency sub folder in
      15 minutes" — not "AI plan generator"
- [ ] 🧑 Facebook: Maryland/HCPSS teacher groups (join early — some gate
      membership; post per group rules)
- [ ] 🧑 Reddit: r/SubstituteTeachers, r/Teachers (read self-promo rules
      first; personal-story posts outperform ads)
- [ ] 🧑 One-pager PDF to hand teachers whose classes you cover (🤖 can
      draft it)
- [ ] 🧑 Watch the admin dashboard + Stripe + function logs daily for the
      first two weeks; forward anything weird
- [ ] 🤖 Post-launch fixes as they surface

---

## Explicitly deferred (fine to skip for v1)

- Seating-chart DB persistence (if not done in Phase 1)
- Self-serve account deletion (ToS says email us — acceptable)
- DOCX export (landing page mentions PDF+DOCX for Basic — either ship it
  or soften the copy before launch ⚠️ check this)
- Stripe Tax (revisit at real revenue; sales-tax nexus unlikely relevant
  at launch scale)
- LLC formation (sole proprietor is fine to start; revisit at ~$1K/mo)
