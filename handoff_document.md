# BiteNow: AI Agent Handoff Context

*Copy everything below this line and paste it at the start of a new chat to instantly sync a new agent.*

---

## 1. Project Overview & Current State
**Project Name:** BiteNow  
**Description:** A smart, mobile-first campus food ordering application. It bridges the gap between students/staff and canteen vendors with digital ordering, a smart wallet, and an AI "Surprise Me" meal generator.  
**Current State:** The core application is functional. We recently completed the `update-student-ui-and-profile` OpenSpec change, which optimized the student UI, moved the wallet balance to a global header, enabled a one-tap reorder (state update only), and enforced strict mobile-first layout constraints on the profile settings.

## 2. Full Tech Stack
- **Frontend Framework:** React (Vite-based routing likely, though `react-router-dom` is used for explicit routes).
- **Styling:** Tailwind CSS (Vanilla CSS in `index.css`).
- **State Management:** Zustand (e.g., `useCartStore`, `useWalletStore`).
- **Animation:** Framer Motion (heavy use of shared layout animations, e.g., `layoutId`).
- **Authentication:** Clerk (`@clerk/clerk-react`, `useUser`).
- **Backend:** FastAPI (Python), running via `uvicorn app.main:app --reload`.

## 3. Architectural Decisions
- **Mobile-First Desktop Constraint:** The entire app UI is constrained by a wrapper (`MainLayout`) that restricts the width to `max-w-[440px]` and height to `100dvh`. *All new routes must be wrapped in `MainLayout` or manually recreate this bounding box to prevent full-screen bleeding on desktop.*
- **Role-Based Access Control (RBAC):** Routes are heavily protected by a `<ProtectedRoute>` wrapper based on user roles (`STUDENT`, `STAFF`, `OWNER` [Vendor], `ADMIN`).
- **OpenSpec Workflow (`opsx`):** We use a strict specification-driven workflow via the `openspec` CLI. Changes are proposed, designed, spec'd, and tasked out in `openspec/changes/<change-name>/` before implementation (`/opsx-apply`).

## 4. Design System & UI Rules (`ui-ux-pro-max`)
*You must adhere to these premium UX standards:*
- **Dark Theme Default:** Use deep surface colors (`bg-[#1c1b1b]`, `surface-container-low`) with high contrast text.
- **Micro-Animations:** Use Framer Motion for layout changes. Ensure transitions exist for hover states (`transition-colors duration-200`).
- **Interactive Feedback:** Always apply `cursor-pointer` to clickable elements. Add `active:scale-95` to buttons.
- **Scrollbars:** DO NOT show default horizontal scrollbars. Use `no-scrollbar` and implement fade gradients on edges to imply scrollability.
- **Icons:** DO NOT use emojis as UI icons. Use the existing Material Symbols Outlined font library (`<span className="material-symbols-outlined">icon_name</span>`).
- **Glassmorphism:** Use `bg-surface/80 backdrop-blur-md` for floating elements like `TopAppBar`.

## 5. Implemented vs. Pending (What Just Happened)
**Recently Implemented:**
- Fixed the tab indicator in `VendorProducts.jsx` by lifting the `<motion.div>` out of the individual buttons to prevent unmounting/flashing.
- Removed the "Social Ledger" from `Budget.jsx`.
- Abstracted the Wallet Balance badge out of `Budget.jsx` and injected it globally into `TopAppBar.jsx` and `Surprise.jsx`.
- Re-wired the `OrderHistory.jsx` "Reorder" button to silently populate the `useCartStore` without redirecting.
- Fixed the `PersonalProfile.jsx` layout by ensuring the `/settings` router in `App.jsx` sits inside `<MainLayout />`. Removed the email address field from the profile.

**Still Pending (Immediate Next Steps):**
1. **Archive the OpenSpec Change:** The `update-student-ui-and-profile` change has been implemented. We need to run the `/opsx-archive` workflow to finalize the spec merge.
2. **"Fly-to-Cart" Animation:** The reorder button updates the cart state silently, but the user requested a visual animation (e.g., the order card shrinking and flying into the cart icon) that was deferred.
3. **Vendor Pages Mobile Layout Review:** We previously noted that Vendor Settings/Pages might still not fully conform to the mobile-first layout.

## 6. Rules the New Agent MUST Follow
1. **Strict Tool Usage:**
   - NEVER run `cat` inside a bash command to create/append files.
   - ALWAYS use `grep_search` instead of running `grep` inside bash.
   - Use specialized tools (`view_file`, `list_dir`) over generic bash equivalents.
2. **OpenSpec Discipline:** Do not randomly implement large features. Use `/opsx-explore` to discuss, `/opsx-propose` to plan, and `/opsx-apply` to execute.
3. **Preserve Comments:** Do not delete existing comments or docstrings unrelated to your specific code edits.
4. **Layout Constraints:** Never write UI code that breaks out of the `max-w-[440px]` mobile bounding box.
5. **No Placeholders:** If you generate code or mock data, provide a fully working implementation.

## 7. Gotchas & Constraints Discovered
- **Framer Motion Layout IDs:** When conditionally rendering elements with `layoutId` (like sliding tab indicators), keep the animated element persistent in the DOM and move its position, rather than conditionally mounting/unmounting it inside mapped items. Unmounting breaks the shared layout animation and causes flashing.
- **TopAppBar Rendering:** `TopAppBar` selectively hides itself on specific deep-linked routes (`/cart`, `/surprise`) that use their own immersive headers. If you add global elements to the header (like the wallet balance), you must *also* manually add them to those custom-header screens.
- **Shared Components:** Components like `PersonalProfile.jsx` are shared between `STUDENT` and `OWNER` paths. Changes made here affect vendors too.

---
*End of Handoff Context. Acknowledge this block and ask the user what task they would like to tackle first.*
