# NikahConnect Intro Screen Implementation Workflow

## Objective

Design and implement an intro/onboarding entry experience that feels premium, trustworthy, and Islamic-friendly while keeping performance strong on low-end devices.

Primary outcomes:
- Explain app value in under 8 seconds.
- Guide users to the first action (`Continue with Google` or `Continue with Email`).
- Keep first render fast and stable on older Android devices.

---

## Product Decision: Should We Use Images?

Short answer: **Yes, but minimally and intentionally.**

Recommended approach:
- Use **1 strong hero visual per slide** (not busy backgrounds).
- Prefer **clean illustrations or UI mockups** over heavy stock photography.
- If real people are used, ensure modest, culturally appropriate imagery and consistent art direction.
- Avoid auto-playing videos on intro; they hurt load time and battery.

Why this is best:
- Visuals improve trust and retention.
- Too many/large images reduce performance.
- One focused image + short copy creates a premium feel without clutter.

---

## Intro Flow Structure (3 Screens Max)

Keep intro concise. Do not exceed 3 slides before auth options.

### Slide 1 - Core Promise
- Headline: Find meaningful Muslim matches
- Supporting text: Serious intentions, values-first profiles, and respectful interactions.
- Visual: Branded illustration (couple silhouette, abstract Islamic geometry, soft gradients)

### Slide 2 - Safety and Privacy
- Headline: Built with privacy in mind
- Supporting text: Verification, reporting, controls for visibility, and profile protection.
- Visual: Privacy-themed illustration/UI mockup card

### Slide 3 - Start Journey
- Headline: Start your Nikah journey
- Supporting text: Create your profile and discover compatible proposals.
- Visual: Real app UI preview (profile + match card)
- CTA area appears here and can also be sticky across all slides.

---

## Image and Asset Guidelines

### Image Style
- Soft premium palette aligned with brand (teal/green + neutral background).
- Avoid over-saturated or loud visuals.
- Keep composition centered so all devices crop safely.

### Technical Specs
- Format: `webp` for hero images.
- Resolution target: `1080x1920` (portrait baseline).
- Max file size per hero: `<= 180 KB` (ideal `120-160 KB`).
- Export 2x variants only if needed; avoid excessive local asset variants.

### Suggested Asset Set
- `assets/intro/intro-1.webp`
- `assets/intro/intro-2.webp`
- `assets/intro/intro-3.webp`
- Optional fallback background gradient generated in code (no image).

### Do Not
- Do not use random stock photos with mixed visual styles.
- Do not ship heavy Lottie/video for first load.
- Do not place text inside images (keep text in UI for localization/accessibility).

---

## UX Rules for the Intro Screen

- Keep each headline under 42 characters.
- Body copy max 2 lines (around 90 characters total).
- Add visible progress indicator (`1/3`, `2/3`, `3/3`).
- Include `Skip` action top-right.
- Primary CTA on final slide: `Continue with Google`.
- Secondary CTA: `Continue with Email`.
- Add legal links near footer: `Terms` and `Privacy Policy`.

Micro-interactions:
- Horizontal paging with snap.
- Subtle fade/slide animation only (`180-260ms`).
- Haptic feedback on slide change and primary CTA (native only).

---

## Accessibility and Inclusivity

- Minimum text contrast ratio 4.5:1.
- Dynamic type support for headline/body.
- All CTA touch targets at least 44x44.
- Screen reader labels for all buttons and pagination dots.
- RTL-ready layout planning for future Arabic/Urdu expansion.

---

## Implementation Plan (Expo + React Native)

### 1) Route and Screen Setup
- Keep intro in `src/app/index.tsx` as first entry.
- Build local components in `src/app/intro/components/` (not global yet).
- Use Expo Router navigation to move to auth after completion.

### 2) Data-Driven Slide Config
- Create a local `slides` array:
  - `id`
  - `title`
  - `description`
  - `image`
- Render using `FlatList` horizontal paging for performance.

### 3) Rendering Strategy
- Use `expo-image` with:
  - `contentFit="cover"`
  - lightweight placeholder while loading
  - memory-safe rendering
- Keep top section fixed height to avoid layout jumps.

### 4) State and Navigation
- Track active index from scroll position.
- `Skip` jumps to final slide or directly to auth (product choice).
- On final CTA, persist intro completion flag and navigate to auth.

### 5) Persistence
- Store `hasSeenIntro=true` in local storage.
- On app start, if seen, bypass intro and open auth flow directly.

### 6) Analytics
- Track:
  - `intro_viewed`
  - `intro_slide_changed`
  - `intro_skipped`
  - `intro_continue_google`
  - `intro_continue_email`

---

## Performance Guardrails

- Total intro asset weight budget: `<= 550 KB`.
- Time to interactive target: under 2.0s on mid-range device.
- Avoid nested animated components in list items.
- Preload only next slide image, not all at once.

---

## Acceptance Criteria

- Intro loads with no dropped frames during swipe.
- Layout looks correct on small and large phones.
- Dark/light mode supported with token-based colors.
- CTA actions work and route correctly.
- Returning users who completed intro do not see it again.

---

## Open Decisions (Need Product Confirmation)

1. Should `Skip` go to final intro slide or directly to auth?
2. Do we want real-person photos in intro, or illustration-only for v1?
3. Is social module (`Jamaa`) mentioned in intro now, or later in onboarding?
4. Primary auth order: Google first (recommended) or Email first?

---

# Marriage Screen (Home Tab) Implementation Workflow

## Goal

Build the `Marriage` tab as a proposal-first profile viewing experience where users evaluate one recommended person at a time, then take one of three primary actions: `Pass`, `Like`, `Compliment`.

This screen is content-heavy, so the implementation must keep:
- high readability
- quick actionability
- smooth performance on low-end devices
- persistent conversion actions (sticky action bar)

---

## Why This Structure (Reasoning)

The profile screen has many sections. If we do not impose strong hierarchy, users will feel overwhelmed and skip without reading.

Design reasoning:
- Keep **decision context above the fold** (hero image, identity, key badges/chips).
- Keep **deep compatibility context below the fold** (similarities, values, plans, lifestyle).
- Keep **decision actions always available** via sticky buttons so users never need to scroll back.
- Use **information grouping** to reduce cognitive load (each section answers one question).

---

## Screen Information Architecture

### 1) Header (Sticky at top)

Two zones:

1. Left zone:
   - `Sort` button
   - `Filter` button (opens dedicated bottom sheet with advanced filters)

2. Right zone:
   - `Boost` button
   - `Notifications` button (navigates to stub notifications screen)

Header behavior:
- remains visible while scrolling
- has subtle bottom border/elevation for separation

### 2) Proposal Hero Card (Top content block)

- Profile photo carousel (horizontal slider)
- Overlay identity row:
  - name
  - age
  - verification badge
- Quick chips:
  - country
  - occupation
  - religious practice level (`Do not practice`, `Occasionally practicing`, `Actively practicing`, `Strictly practicing`)

### 3) Compatibility and Detail Sections (Vertical stack)

Order and intent:

1. `Your Similarities`
   - shared interests/traits/values

2. `About Me`
   - short summary from owner

3. `Core Facts`
   - height
   - age
   - marital status
   - children count
   - format when none: `Doesn't have children`

4. `Plan of Marriage`
   - preferred chat phase duration
   - family meeting preference/timing
   - intended marriage timeline (`4-12 months`, etc.)

5. `Future Plan`
   - wants children
   - relocation preference (`Global`, `Home country only`, `Open to discuss`)

6. `Interests`
   - capsule chips

7. `Personality`
   - personality traits chips/list

8. `Education & Career`
   - qualification
   - occupation/profession
   - employment details (optional)

9. `Languages & Ethnicity`
   - spoken languages
   - ethnicity/background

10. `Bio`
    - full paragraph

11. `Compliment`
    - non-expandable text area prompt for compliment drafting

12. Footer utility actions:
    - Share profile
    - Mark favorite
    - Block user
    - Report user

### 4) Sticky Bottom Action Bar (Always visible)

Primary proposal actions:
- `Pass` -> skip to next recommendation
- `Like` -> like current profile
- `Compliment` -> opens compliment bottom sheet

Why sticky:
- creates fast decision loop
- avoids long-scroll friction
- increases profile interaction rate

---

## Interaction Model

### Proposal flow
- App loads one recommended profile.
- User can:
  - swipe profile images
  - scroll profile details
  - use sticky actions at any time
- On `Pass`, animate out + fetch next profile.
- On `Like`, optimistic update + next profile (or stay briefly with toast).
- On `Compliment`, open sheet -> send message -> persist action.

### Bottom sheets
1. `Filters` sheet:
   - age range
   - ethnicity
   - height
   - marital status
   - children preference
   - location radius
   - religious practice
2. `Compliment` sheet:
   - message input
   - send/cancel

### Notifications
- icon tap routes to `notifications` screen (stub initially).

---

## Component Plan (Expo Router + React Native)

### Route structure (proposed)
- `src/app/(tabs)/marriage.tsx` (screen container)
- `src/app/notifications.tsx` (stub)

### Local components for this feature
- `src/app/marriage/components/marriage-header.tsx`
- `src/app/marriage/components/profile-hero-carousel.tsx`
- `src/app/marriage/components/profile-overlay.tsx`
- `src/app/marriage/components/section-card.tsx`
- `src/app/marriage/components/chip-list.tsx`
- `src/app/marriage/components/compliment-preview.tsx`
- `src/app/marriage/components/profile-footer-actions.tsx`
- `src/app/marriage/components/sticky-proposal-actions.tsx`
- `src/app/marriage/components/filter-sheet.tsx`
- `src/app/marriage/components/compliment-sheet.tsx`

Reasoning:
- keep components local to feature until reused
- avoids premature global abstractions
- aligns with project rule for pragmatic splitting

---

## Data Contract (Frontend View Model)

Use one normalized object for current proposal:

- `id`
- `name`
- `age`
- `isVerified`
- `photos[]`
- `country`
- `occupation`
- `religiousPractice`
- `similarities[]`
- `aboutMe`
- `height`
- `maritalStatus`
- `childrenCount`
- `marriagePlan`:
  - `chatDuration`
  - `familyInvolvement`
  - `marriageTimeline`
- `futurePlan`:
  - `wantsChildren`
  - `relocationPreference`
- `interests[]`
- `personalityTraits[]`
- `educationCareer`:
  - `qualification`
  - `occupation`
- `languages[]`
- `ethnicity`
- `bio`

---

## UI/UX Quality Rules for This Screen

- Keep section cards with consistent vertical rhythm.
- Use chips for short categorical data (interests, personality, language).
- Limit line length for long text sections to improve readability.
- Avoid over-animation; only use meaningful transitions (sheet open/close, pass/like state).
- Preserve touch targets >= 44x44 for all action buttons.

---

## Performance Plan

- Use a single vertical `FlatList` for section rendering.
- Use horizontal `FlatList` for hero image slider.
- Use stable keys and `getItemLayout` where possible.
- Preload only next profile's first image.
- Keep bottom sheets lazy-mounted.

---

## Delivery Phases

### Phase 1 - Structural MVP
- Header with 4 actions wired
- Hero carousel + overlay identity
- All required sections as static/mock data
- Sticky action bar with pass/like/compliment taps
- Notifications stub screen

### Phase 2 - Interaction depth
- Filter sheet fields + apply/reset behavior
- Compliment sheet submit flow
- Pass/Like optimistic transitions

### Phase 3 - Data integration
- Replace mock data with API payloads
- persist profile actions
- analytics events on key actions

---

## Confirmed Product Decisions (Locked)

1. `Like` behavior:
   - No alert/toast.
   - Immediately move to next profile.

2. `Compliment` behavior:
   - Minimum message length is `10` characters.
   - Submit disabled until valid length reached.

3. `Block` and `Report` behavior (UI phase):
   - Remove that person from recommendation list immediately.
   - Show next profile right away.
   - Reporting backend/email flow will be integrated later; currently UI-only.

4. Religious practice labels (final):
   - `Do not practice`
   - `Occasionally practicing`
   - `Actively practicing`
   - `Strictly practicing`

5. `Sort`:
   - Use dedicated bottom sheet.

---

## Filter Experience Decision (UX Recommendation)

Requirement added:
- Filter button should open a large filter surface with all fields.

Recommended approach:
- Use `@gorhom/bottom-sheet` in near full-height mode (90-95% snap point), not a separate pushed screen.

Why this is better for this use case:
- Keeps user in proposal context (they can quickly close and continue browsing).
- Preserves mental model: filters are a temporary control layer over the feed, not a new destination.
- Faster back-and-forth for iterative tuning.

When full-screen push would be better:
- If filter logic becomes multi-step with advanced explanations, saved presets, and educational copy.

Current implementation direction:
- `Filter` button opens `FilterBottomSheet` using `@gorhom/bottom-sheet`.
- Snap points: `["90%"]` initially (can evolve to `["70%", "92%"]` later).
- Sheet includes:
  - sticky title + close
  - scrollable filter content
  - sticky footer with `Reset` and `Apply`
- Dismiss behavior:
  - drag down or close button
  - `Apply` updates UI list and closes sheet

---

## Next Build Notes (Marriage Screen)

- Wire action outcomes to local in-memory recommendation queue for now:
  - `passProfile()`
  - `likeProfile()`
  - `blockProfile()`
  - `reportProfile()`
- All four actions call `showNextProfile()` after mutation.
- `compliment` opens sheet; submit validates `>=10` chars before sending.
