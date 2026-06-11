# NikahConnect — End-to-End Implementation Workflow

This document is the master walkthrough for building NikahConnect: a premium Muslim matrimonial mobile app (React Native / Expo). It maps client requirements, the Buzz/Muzz reference flow, and frontend architecture rules into a phased delivery plan.

**Reference files (read-only context):**
- `README.md` — full feature scope, tech stack, deliverables
- `buzz-workflow.md` — reference app flow and functionality
- `rules.md` — mandatory frontend architecture rules

---

## 1. Product Vision & Scope

### What NikahConnect Is

A production-ready Muslim matchmaking app focused exclusively on **serious matrimonial intent**. Users discover marriage proposals, express interest, match mutually, and communicate privately — with strong privacy controls (blur photos, visibility settings) and a premium Islamic-friendly design.

### How NikahConnect Differs from the Buzz/Muzz Reference

The reference app (`buzz-workflow.md`) combines **Matrimony + Social Networking** (5 tabs including Jamaa community feed, friends chat, dual profile types). NikahConnect intentionally **scopes down to matrimony only** for a cleaner, more focused product:

| Reference (Buzz/Muzz) | NikahConnect |
|---|---|
| 5 tabs (Marriage, Explore, Jamaa, Chat, Profile) | **4 tabs** (Marriage, Explore, Chat, Profile) |
| Marriage + Friends chat | **Marriage chat only** (mutual matches) |
| Marriage + Social profile | **Single marriage profile dashboard** |
| Community feed, posts, groups | **Removed** — not in scope |
| 2 compliment limit (free) | Same concept retained |
| 5 active marriage chats (free) | Same concept retained (UI placeholder in Phase 1) |
| Free: 4 filters / Premium: 21 filters | Same tier model (UI only in Phase 1) |

Everything else from the reference that aligns with `README.md` is retained: swipe-style discovery, explore segments, compliments, boost, premium upsell, report/block, blur photos, onboarding questionnaire, and partner search preferences.

### End-to-End User Journey (Target State)

```
Launch App
  → Auth (Email / Google / Apple / Phone OTP)
  → Multi-Step Onboarding (identity → particulars → religious intent → media)
  → Partner Search Preferences
  → Main App (4 Tabs)
      → Discover & Like/Pass/Compliment proposals
      → Explore (Available Now / Newly Joined / Active Near You)
      → Mutual Match → Chat (text, media, voice)
      → Manage Profile, Settings, Privacy, Boost, Premium
  → (Later phases) Notifications, Subscriptions, Admin, AI moderation
```

---

## 2. Development Phases Overview

| Phase | Focus | Outcome |
|---|---|---|
| **Phase 1** | UI design for all screens with hardcoded stub values | Every screen navigable; no real logic |
| **Phase 2** | Animations & micro-interactions | Premium feel; card transitions, onboarding polish |
| **Phase 3** | Redux + `stubData.js` simulation | App behaves like it has a backend locally |
| **Phase 4** | Auth handling (custom JWT, no Clerk/3rd-party auth SDKs) | Real signup/login/OTP flows |
| **Phase 5** | Backend (Node/Express/PostgreSQL) + frontend integration | Production data, Socket.io chat, S3, Stripe |
| **Phase 6** | Polishing, performance tuning, deployment | App Store / Play Store ready |

**This document details Phase 1 in depth.** Later phases are noted where relevant so each screen is built with forward compatibility in mind.

---

## 3. Tech Stack (from README.md)

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo), TypeScript |
| State (Phase 3+) | Redux |
| Backend (Phase 5) | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT + OTP (Phase 4–5) |
| Storage | AWS S3 |
| Notifications | Firebase Cloud Messaging |
| Payments | Stripe |
| Real-time | Socket.io |

---

## 4. Frontend Architecture Rules (from rules.md)

These apply from Phase 1 onward:

1. **Centralized theme** — All styles from `src/theme/theme.ts` (or theme context). No inline hex codes, raw padding, or hardcoded font sizes. Light + Dark mode tokens: `colors.primary`, `spacing.md`, `typography.bodyLarge`, etc.
2. **Pragmatic components** — Global `src/components/` only for truly shared UI (buttons, inputs, modals). Screen-specific heavy sections live in local `components/` folders beside the screen.
3. **Lazy loading** — Heavy sections (filter drawers, report modals, preference sheets, expanded bio) split into lazy-loadable components.
4. **List performance** — All scrollable lists use `FlatList` or `FlashList` with fixed item heights / `getItemLayout`.
5. **Asset strategy** — Progressive image loading with skeleton/blur placeholders. Avoid bloating the binary with many resolution variants; prefer CDN-delivered remote assets with lightweight local placeholders.

---

## 5. Phase 1 — Screen Inventory (11 Screens)

### Navigation Structure

```
Root Navigator
├── Auth Stack (Screens 1–6)
│   ├── Welcome
│   ├── Login / Credentials
│   └── Onboarding Steps 1–4
└── Main Tab Navigator (Screens 7–11)
    ├── Tab 1: Marriage Discovery
    ├── Tab 2: Explore
    ├── Tab 3: Chat Hub
    │   └── Chat Room (stack push from Tab 3)
    └── Tab 4: Profile & Settings
```

---

### GROUP A — Authentication & Onboarding (Screens 1–6)

#### Screen 1: Welcome

**Purpose:** First impression; route user to auth path.

**UI elements:**
- App logo / wordmark
- Tagline (e.g., "Find your Nikah, with intention")
- Primary CTA: "Continue with Email"
- Secondary CTA: "Continue with Google"
- (Phase 5+) Apple Sign-In, Phone OTP entry points

**Phase 1 stub behavior:**
- Buttons navigate to Screen 2 (no real OAuth)

**Maps to:** `README.md` § Authentication — Email, Google, Apple Sign-In

---

#### Screen 2: Credentials / Login

**Purpose:** Email + password entry for login or registration start.

**UI elements:**
- Email input with validation styling (invalid format → red border + helper text)
- Password input with show/hide toggle
- "Forgot Password?" link (navigates to placeholder modal/screen)
- Submit button
- Toggle: "New here? Create account" / "Already have an account? Log in"

**Phase 1 stub behavior:**
- Validation UI only (regex check on email, min length on password)
- Successful submit → Onboarding Step 1 (Screen 3)
- No API calls

**Maps to:** `README.md` § Authentication — Email Signup/Login, Forgot Password

---

#### Screen 3: Onboarding Step 1 — Core Identity

**Purpose:** Collect foundational profile data (reference: buzz Step 2 — Account Creation).

**Fields:**
- Full Name
- Date of Birth (custom wheel picker or bottom-sheet calendar)
- Gender (Male / Female)
- Country (searchable dropdown)
- City (dependent dropdown or free text)

**UI notes:**
- One field group per visual "card" section for premium feel
- Progress indicator: "Step 1 of 4"
- Back / Continue navigation

**Phase 1 stub behavior:**
- Local state only; Continue enabled when all fields filled
- DOB picker is interactive UI shell (no age calculation logic yet)

---

#### Screen 4: Onboarding Step 2 — Matrimonial Particulars

**Purpose:** Marriage-relevant demographics (reference: buzz Step 4 — Basic/Family/Education/Career).

**Fields:**
- Height (cm/ft toggle + slider)
- Marital Status (Never Married, Divorced, Widowed)
- Children Status (None / Has children)
- Education Level (dropdown)
- Profession (text input or dropdown)

**UI notes:**
- Height slider with live value label
- Progress indicator: "Step 2 of 4"

**Phase 1 stub behavior:**
- Slider and pickers render and update local state
- Values displayed on Screen 11 (Profile Dashboard) as read-only stub summary

---

#### Screen 5: Onboarding Step 3 — Religious & Intentions

**Purpose:** Religious compatibility + marriage timeline (reference: buzz Step 4 — Religious + Marriage Intentions).

**Fields:**
- Sect (Sunni, Shia, Other — token/chip selector)
- Religious Practice Level (custom 1–5 icon slider with labels: e.g., "Just started" → "Very practicing")
- Marriage Timeline Intentions (multi-select chips):
  - "Marry within 6 months"
  - "Marry within 12 months"
  - "Involve parents immediately"
  - "Chat first, meet later"

**UI notes:**
- **Marriage intentions get high visual hierarchy** — this is what makes the app feel like Nikah, not casual dating
- Progress indicator: "Step 3 of 4"

**Phase 1 stub behavior:**
- Selections stored in local onboarding state
- These same intention labels appear on discovery cards (Screen 7) as prominent badges below name/age

---

#### Screen 6: Onboarding Step 4 — Media Gallery Upload

**Purpose:** Profile photos/videos + privacy toggle (reference: buzz Step 4 — Photos/Videos + requirements § Blur Photos).

**UI elements:**
- Drag-and-drop / tap-to-add grid (3–6 slots)
- Placeholder tiles with "+" icon for empty slots
- Video slot indicator (optional, 1 slot)
- Toggle: **"Blur my photos by default"** (critical privacy feature)
- Progress indicator: "Step 4 of 4"
- "Finish Setup" CTA → Main Tab Navigator

**Phase 1 stub behavior:**
- Tapping a slot shows a stub Unsplash image (no real picker/upload)
- Blur toggle applies a visual blur filter preview on the grid
- Finish → navigate to Tab 1 (Marriage Discovery)

---

### GROUP B — Main Tab Navigation (Screens 7–11)

---

#### Screen 7: Match Discovery / Card Stack (Tab 1 — Marriage)

**Purpose:** Primary proposal browsing (reference: buzz Tab 1 — Marriage Screen).

**UI layout:**
- Full-screen vertically scrollable profile card (no separate deep-view screen in early phases)
- **Card header:** Name, Age, Location
- **High-priority badge row:** Marriage Timeline + Parent Involvement intention
- **Photo carousel** with blur overlay when `blurPhotosActive: true`
- **Expandable sections** (scroll within card):
  - Religious info (sect, practice level)
  - Education & profession
  - Family background / marital status / children
  - Bio / About Me
  - Interests & hobbies (chips)
- **Action overlay buttons** (fixed bottom or floating):
  - Pass (✕)
  - Like (♥)
  - Compliment (💬)
- **Secondary actions** (overflow menu or icon row):
  - Add to Favorites
  - Report
  - Block
- **Top bar:** Filter icon (opens filter sheet — UI shell), Boost icon (placeholder), Notifications bell (placeholder)

**Phase 1 stub data (inline or constants file):**

```javascript
const STUB_PROPOSAL = {
  id: "prop_01",
  name: "Zainab",
  age: 23,
  location: "Lahore, PK",
  sect: "Sunni",
  religiousLevel: 4,
  marriageTimeline: "Marry within 4 months",
  parentInvolvement: "Immediate",
  maritalStatus: "Never Married",
  children: "None",
  education: "Masters",
  profession: "Software Engineer",
  height: "165 cm",
  bio: "Looking for a practicing partner who values family...",
  interests: ["Reading Quran", "Travel", "Cooking"],
  blurPhotosActive: true,
  images: ["https://images.unsplash.com/photo-example..."],
};
```

**Phase 1 stub behavior:**
- Render 1–3 hardcoded cards; Pass removes card, Like shows brief feedback toast
- Compliment opens a bottom sheet with text input (no send logic)
- Filter sheet opens with free-tier filters visible (Age, Location, Sect, Ethnicity) + locked premium filters greyed out
- Card stack uses `FlatList` or a single `ScrollView` with stub content

**Maps to:** `README.md` § Match Discovery, § Search & Filters (UI shell), § Privacy (blur)

**Deferred to Phase 3:** Like → pending match logic, mutual match trigger for `prop_01`

---

#### Screen 8: Explore Hub (Tab 2 — Explore)

**Purpose:** Proximity and activity-based discovery (reference: buzz Tab 2 — Explore, 3 sections).

**UI layout:**
- Horizontal 3-segment top control: **Available Now** | **Newly Joined** | **Active Near You**
- **Available Now:** Grid of circular avatars with green online dot + name below
- **Newly Joined:** Vertical list of compact profile rows (avatar, name, age, location, "Joined 2 days ago")
- **Active Near You:** Vertical list with distance badge (e.g., "12 km away")

**Phase 1 stub behavior:**
- Each segment renders a distinct hardcoded array (6–10 items)
- Tapping any profile navigates to a read-only version of the discovery card (Screen 7 layout) or shows a bottom sheet preview
- Segment switch is instant (no fetch)

**Maps to:** `README.md` § Match Discovery — Distance Filtering; buzz § Explore Screen

---

#### Screen 9: Nikkah Chats / Message Hub (Tab 3 — Chat)

**Purpose:** List all mutual matrimonial matches (reference: buzz Tab 4 — Marriage Chats only; no Friends tab).

**UI layout:**
- **Top horizontal row:** "New Mutual Matches" — circular avatars with name, users not yet messaged
- **Below:** Vertical list of active chat threads:
  - Profile thumbnail
  - Name
  - Last message preview (truncated)
  - Timestamp
  - Unread badge count
  - Delivery/read status icon (single check / double check — visual only)
- Empty state: "No matches yet — start liking profiles!"
- Free-tier banner (UI shell): "3 of 5 active chats used" with upgrade CTA

**Phase 1 stub behavior:**
- Populate with 2–3 hardcoded threads + 1 "new match" avatar
- Tapping a thread → Screen 10 (Chat Room)
- Tapping a new match avatar → Screen 10 with empty conversation

**Maps to:** `README.md` § Chat System, § Match System; buzz § Marriage Chats (5 chat limit)

---

#### Screen 10: Direct Message Chat Room

**Purpose:** Private conversation with a matched user (reference: buzz § Chat Features).

**UI layout:**
- **Header:** Match name, avatar, online indicator; menu (⋮) → Unmatch, Block, Report
- **Message area:** Scrollable bubble list
  - Sent bubbles (right-aligned, primary color)
  - Received bubbles (left-aligned, surface color)
  - Stub image message block (thumbnail placeholder)
  - Stub voice note block (waveform placeholder + duration)
- **Typing indicator:** "Zainab is typing..." (static demo state, toggleable via dev flag)
- **Input bar:** Text field, attach (image) icon, voice note icon, send button

**Phase 1 stub behavior:**
- Render 5–8 hardcoded messages alternating sender
- Send button appends message to local array (no persistence)
- Header actions open confirmation modals (UI only, no action)

**Maps to:** `README.md` § Chat System — messaging, media, voice, read receipts, typing, block, report

**Deferred to Phase 5:** Socket.io real-time, S3 media upload

---

#### Screen 11: User Profile Dashboard (Tab 4 — Profile)

**Purpose:** Manage own profile, preferences, and app settings (reference: buzz Tab 5 — Marriage Profile section only).

**UI layout:**
- **Hero section:** Profile photo, name, age, location
- **Completion meter:** Circular or linear progress — "85% Complete" with checklist of missing fields
- **CTA row:**
  - "Boost Profile" button (with timer placeholder: "Boost active — 2h 14m left")
  - "Get Premium" upsell card (Monthly / Yearly plan teaser)
- **Quick actions list:**
  - Edit Profile → reopens onboarding fields as editable form (stub)
  - Partner Search Preferences → modal/sheet (Age range, Height, Country, City, Sect, Education, Profession, Marital Status, Children — mirrors buzz Step 5)
  - My Photos → gallery manager (stub)
  - Verification Badge → placeholder screen ("Coming soon")
- **Settings section:**
  - Privacy (Blur photos toggle, Hide from search, Hide online status)
  - Notifications preferences (toggle list)
  - App Settings (Dark/Light mode toggle — wired to theme context)
  - Help & Support
  - Log Out (navigates back to Screen 1)

**Phase 1 stub behavior:**
- All values from onboarding stub state or hardcoded defaults
- Preference modal opens with pre-filled sliders/dropdowns (non-functional save)
- Dark/Light toggle switches theme via centralized theme engine
- Boost and Premium buttons show upgrade modal (UI shell)

**Maps to:** `README.md` § User Profiles, § Privacy, § Premium Subscription, § Notifications; buzz § Profile Growth Features

---

## 6. Phase 1 — Theme & Design System

### Color Palette (Premium Islamic Aesthetic)

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `colors.primary` | `#004D40` (deep emerald) | `#00695C` | Buttons, active tab, accents |
| `colors.secondary` | `#4A148C` (luxury plum) | `#6A1B9A` | Premium badges, boost |
| `colors.accent` | `#D4AF37` (champagne gold) | `#E6C547` | Highlights, verification, CTAs |
| `colors.surface` | `#FAFAFA` | `#121212` | Screen backgrounds |
| `colors.card` | `#FFFFFF` | `#1E1E1E` | Cards, modals |
| `colors.textPrimary` | `#212121` | `#F5F5F5` | Headings, body |
| `colors.textSecondary` | `#757575` | `#B0B0B0` | Captions, placeholders |
| `colors.error` | `#D32F2F` | `#EF5350` | Validation errors |
| `colors.success` | `#388E3C` | `#66BB6A` | Online status, match |

### Typography Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `typography.displayLarge` | 28 | Bold | Welcome headline |
| `typography.headlineMedium` | 22 | SemiBold | Screen titles |
| `typography.titleMedium` | 18 | SemiBold | Card names |
| `typography.bodyLarge` | 16 | Regular | Body text, chat messages |
| `typography.bodySmall` | 14 | Regular | Captions, timestamps |
| `typography.labelSmall` | 12 | Medium | Badges, tags |

### Spacing & Radius

| Token | Value |
|---|---|
| `spacing.xs` | 4 |
| `spacing.sm` | 8 |
| `spacing.md` | 16 |
| `spacing.lg` | 24 |
| `spacing.xl` | 32 |
| `radius.sm` | 8 |
| `radius.md` | 12 |
| `radius.lg` | 16 |
| `radius.full` | 999 |

### Design Intent Rules

1. **Marriage intentions** appear directly below name/age on every profile surface — highest visual hierarchy after the photo.
2. **Blur photos** uses a strong Gaussian blur on image components when `blurPhotosActive` is true; show a lock icon overlay.
3. **Premium features** (advanced filters, sorting, unlimited compliments) render visibly but locked/greyed with a gold upgrade prompt — never hidden.
4. **Onboarding** feels like a guided conversation, not a form — one topic per step, generous whitespace, progress bar.

---

## 7. Phase 1 — Folder Structure

```
nikkahConnect/
├── src/
│   ├── theme/
│   │   ├── theme.ts              # Single source of truth (colors, spacing, typography)
│   │   └── ThemeProvider.tsx      # Light/Dark context
│   ├── components/               # Global shared UI only
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Modal.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── onboarding/
│   │   │       ├── Step1Identity.tsx
│   │   │       ├── Step2Particulars.tsx
│   │   │       ├── Step3Religious.tsx
│   │   │       └── Step4Media.tsx
│   │   ├── marriage/
│   │   │   ├── DiscoveryScreen.tsx
│   │   │   └── components/
│   │   │       ├── ProposalCard.tsx      # Heavy — candidate for lazy load
│   │   │       ├── ActionButtons.tsx
│   │   │       └── FilterSheet.tsx       # Heavy — lazy load
│   │   ├── explore/
│   │   │   └── ExploreScreen.tsx
│   │   ├── chat/
│   │   │   ├── ChatListScreen.tsx
│   │   │   ├── ChatRoomScreen.tsx
│   │   │   └── components/
│   │   │       ├── MessageBubble.tsx
│   │   │       └── ChatInputBar.tsx
│   │   └── profile/
│   │       ├── ProfileDashboardScreen.tsx
│   │       └── components/
│   │           ├── PreferencesSheet.tsx  # Heavy — lazy load
│   │           └── SettingsList.tsx
│   └── constants/
│       └── stubValues.ts         # Phase 1 hardcoded data (replaced by stubData.js in Phase 3)
├── App.tsx
└── package.json
```

---

## 8. Phase 1 — Stub Data Strategy

Phase 1 uses inline constants or `src/constants/stubValues.ts`. Phase 3 migrates this to `stubData.js` with Redux slices.

### Minimum Stub Datasets

| Dataset | Count | Used In |
|---|---|---|
| `STUB_PROPOSALS` | 3–5 diverse profiles | Screen 7 |
| `STUB_EXPLORE_ONLINE` | 8 avatars | Screen 8 — Available Now |
| `STUB_EXPLORE_NEW` | 6 list rows | Screen 8 — Newly Joined |
| `STUB_EXPLORE_NEARBY` | 6 list rows with distance | Screen 8 — Active Near You |
| `STUB_CHAT_THREADS` | 3 conversations | Screen 9 |
| `STUB_MESSAGES` | 8 messages per thread | Screen 10 |
| `STUB_CURRENT_USER` | 1 profile object | Screen 11 |
| `STUB_PREFERENCES` | 1 preferences object | Screen 11 modal |

### Diversity Flags to Include in Stub Profiles

Ensure at least one profile for each test scenario:

- `blurPhotosActive: true` — verify blur rendering
- `blurPhotosActive: false` — verify clear photos
- Different sects (Sunni, Shia)
- Different marriage timelines ("6 months", "12 months", "Chat first")
- Different marital statuses (Never Married, Divorced)
- With and without children
- Varied religious practice levels (1–5)
- Different locations (same city, different city, different country)

---

## 9. Phase 1 — Implementation Order

Build screens in this sequence to keep navigation testable at every step:

```
Step 1: Project scaffold
  → Expo init, TypeScript, folder structure, theme engine + ThemeProvider

Step 2: Global components
  → Button, Input, Avatar, Badge, ProgressBar, Modal
  → Verify light/dark toggle works everywhere

Step 3: Navigation skeleton
  → RootNavigator (Auth vs Main based on stub flag)
  → AuthStack (Screens 1–6 wired)
  → MainTabNavigator (4 tabs wired)

Step 4: Auth & Onboarding (Screens 1–6)
  → Welcome → Login → Step 1 → Step 2 → Step 3 → Step 4 → Main Tabs
  → Local state passed forward through onboarding (no persistence)

Step 5: Tab 1 — Marriage Discovery (Screen 7)
  → ProposalCard with stub data, action buttons, filter sheet shell

Step 6: Tab 2 — Explore (Screen 8)
  → 3-segment control + 3 stub lists

Step 7: Tab 3 — Chat (Screens 9–10)
  → Chat list → Chat room navigation, stub messages

Step 8: Tab 4 — Profile (Screen 11)
  → Dashboard, preferences modal, settings, theme toggle

Step 9: Cross-screen polish pass
  → Consistent spacing, empty states, loading skeletons
  → Verify all 11 screens reachable end-to-end
  → Test on low-end device emulator (Android Go / older iPhone)
```

---

## 10. Feature-to-Phase Mapping

Features from `README.md` and `buzz-workflow.md` mapped to when they get built:

| Feature | Phase 1 (UI) | Phase 2 (Anim) | Phase 3 (Redux/Stub) | Phase 4 (Auth) | Phase 5 (Backend) |
|---|---|---|---|---|---|
| Welcome / Login screens | ✅ | ✅ | — | ✅ Real auth | ✅ |
| Multi-step onboarding | ✅ | ✅ | ✅ State persist | ✅ | ✅ |
| Photo upload + blur toggle | ✅ UI | — | ✅ Simulated | — | ✅ S3 |
| Swipe/card discovery | ✅ Static | ✅ Transitions | ✅ Like/Pass logic | — | ✅ Algorithm |
| Compliment | ✅ Sheet UI | — | ✅ Counter (2 free) | — | ✅ |
| Explore (3 segments) | ✅ | — | ✅ | — | ✅ |
| Mutual match + chat list | ✅ Static | ✅ Match anim | ✅ Match trigger | — | ✅ |
| Chat room (text/media/voice) | ✅ Stub msgs | ✅ Send anim | ✅ Local send | — | ✅ Socket.io |
| Block / Report / Unmatch | ✅ Modals | — | ✅ Stub actions | — | ✅ |
| Profile dashboard | ✅ | — | ✅ | — | ✅ |
| Partner preferences | ✅ Modal | — | ✅ | — | ✅ |
| Free vs Premium filters | ✅ Locked UI | — | ✅ Tier check | — | ✅ |
| Boost profile | ✅ CTA shell | — | ✅ Timer sim | — | ✅ |
| Subscription / Stripe | ✅ Upsell UI | — | — | — | ✅ |
| Notifications (FCM) | ✅ Bell icon | — | — | — | ✅ |
| OTP / Phone auth | — | — | — | ✅ | ✅ |
| Admin panel | — | — | — | — | ✅ |
| AI moderation | — | — | — | — | ✅ |
| Screenshot protection | — | — | — | — | ✅ |

---

## 11. Phase 2 Preview — Animations (Next After Phase 1)

Key animations to plan for (build on Phase 1 screens):

- **Card stack:** Swipe-away on Pass, scale-up on Like, spring-back on release
- **Match modal:** Celebratory overlay when mutual like detected (Phase 3 trigger, Phase 2 animation shell)
- **Onboarding:** Step transitions (slide + fade), picker wheel momentum
- **Tab bar:** Subtle icon scale on active tab
- **Chat:** Message bubble enter animation, typing dots pulse
- **Explore:** Segment control sliding indicator
- **Profile:** Completion meter animate-on-mount
- **General:** Skeleton shimmer loaders, pull-to-refresh indicator (visual only)

---

## 12. Phase 3 Preview — Redux + stubData.js

When Phase 1 UI is complete, `stubData.js` replaces scattered constants and Redux slices simulate backend behavior:

```javascript
// stubData.js (Phase 3)
export const STUB_PROPOSALS = [ /* ... */ ];
export const STUB_CHATS = [ /* ... */ ];
export const STUB_CURRENT_USER = { /* ... */ };

// Match simulation (Phase 3)
export function handleLike(proposalId) {
  if (proposalId === "prop_01") {
    // Trigger "It's a Match!" modal
    // Push Zainab into STUB_CHATS as new mutual match
    return { matched: true, match: STUB_PROPOSALS[0] };
  }
  return { matched: false, pending: true };
}
```

**Redux slices (planned):**
- `authSlice` — logged-in flag, user token (stub)
- `onboardingSlice` — form data across steps
- `discoverySlice` — proposal queue, likes, passes
- `chatSlice` — threads, messages, unread counts
- `profileSlice` — current user, preferences, completion %
- `uiSlice` — theme mode, active modals, toast messages

---

## 13. Phase 1 — Definition of Done Checklist

- [ ] All 11 screens implemented and navigable
- [ ] Centralized theme with light/dark mode toggle working
- [ ] Zero inline hex codes or magic numbers outside `theme.ts`
- [ ] All lists use `FlatList` or `FlashList`
- [ ] Heavy components (FilterSheet, PreferencesSheet, ProposalCard expanded) isolated for lazy loading
- [ ] Marriage intentions visible with high hierarchy on all profile surfaces
- [ ] Blur photo toggle renders correctly on cards and own profile
- [ ] Free vs Premium filter tiers visually differentiated (locked/unlocked)
- [ ] Empty states designed for chat list, discovery stack, explore segments
- [ ] App runs smoothly on a low-end Android emulator
- [ ] End-to-end walkthrough completable: Welcome → Onboarding → All 4 tabs → Chat room → Profile settings → Log out

---

## 14. Out-of-Scope for Phase 1 (Do Not Build Yet)

- Real authentication or API calls
- Redux or any global state manager
- Actual image picker / camera / file upload
- Real-time chat (Socket.io)
- Push notifications (FCM)
- Payment flows (Stripe)
- Matching algorithm or compatibility scoring
- Admin panel
- AI features (moderation, conversation starters)
- Social features (Jamaa feed, friends chat, groups)
- Screenshot protection
- Deep linking / universal links

---

*Last updated: Phase 1 planning — UI-only walkthrough with stub values.*
