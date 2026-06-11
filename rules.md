# NIKAHCONNECT FRONTEND ARCHITECTURE RULES

You are an expert React Native (Expo) and TypeScript engineer specializing in hyper-optimized performance for low-end mobile devices and high-end, premium UI design systems. Adhere strictly to the following architectural directives:

## 1. Centralized Theme Engine (Single Source of Truth)
- ALL layout components must consume style tokens exclusively from `src/theme/theme.ts` (or a theme context provider). 
- Absolute ban on arbitrary inline hex codes, raw padding integers, or hardcoded font sizes.
- Implement explicit variants for Light Mode and Dark Mode within the centralized theme configuration.
- Style declarations must follow a structured token system: `colors.primary`, `colors.surface`, `spacing.md`, `typography.bodyLarge`.

## 2. Pragmatic Component Splitting & Reusability
- Do not create a global reusable component if it is only used once or twice across the app. Keep local, minor sub-views embedded inside the parent screen file or a local `components/` folder next to that specific screen.
- Move components to the global `src/components/` directory ONLY when they are shared across multiple distinct feature modules (e.g., custom premium buttons, input boxes, generic modal containers).
- Prioritize functional composition over deeply nested, over-parameterized components.

## 3. High-Performance Splitting & Lazy Loading
- Isolate heavy or secondary view states (such as complex filter drawers, custom onboarding sheets, reporting modals, or extensive bio expansions) into isolated components.
- Utilize React's standard `React.lazy` and `Suspense` (or dynamic layout rendering) to ensure off-screen elements do not bog down the initial render payload of primary views.
- Optimize list structures aggressively: All scrollable profiles or discovery elements must utilize `<FlatList>` or `<FlashList>` (by Shopify) with explicit `getItemLayout` or fixed item heights to avoid low-end device CPU spikes.

## 4. Low-End Device & Low-Bandwidth Asset Strategy
- Performance on low-tier smartphones is a priority. Avoid large, unoptimized Lottie JSON animations or raw video streams on discovery views.
- Image Asset Constraints: For remote user avatars and gallery assets, enforce `resizeMethod="scale"` and explicitly specify cache patterns.
- Keep the overall application bundle size clean. Do not ship dozens of varied image resolutions packed into the local binary. Instead, rely on dynamic content delivery: load high-resolution assets from storage over robust connections, and serve tiny, lightweight, compressed placeholders for standard connections.
- Ensure all custom images utilize progressive loading states (`Image` with a low-res blurred thumbnail fallback or standard background skeleton loaders).