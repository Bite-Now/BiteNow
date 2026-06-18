# Product Requirements Document (PRD): BiteNow

## 1. Product Overview
**Product Name:** BiteNow  
**Description:** BiteNow is a mobile-first, smart food ordering platform designed for closed-campus environments (like universities, corporate parks, or large institutions). It bridges the gap between students/staff and canteen vendors by providing seamless digital ordering, smart wallet management, and AI-driven meal recommendations, while equipping vendors with robust management tools.

**Product Vision:** To eliminate canteen queues, optimize vendor operations, and provide an engaging, budget-friendly dining experience for users through smart technology.

---

## 2. Target Audience & User Personas
BiteNow serves four distinct user roles, primarily focusing on the Student and Vendor experiences.

1. **Student / Staff (End Consumers)**
   - **Needs:** Quick ordering to avoid lines, tracking daily/weekly food expenses, discovering new meals within their budget.
   - **Pain Points:** Long wait times during lunch hours, losing track of cash/spending, decision fatigue on what to eat.
2. **Owner / Vendor (Canteen Operators)**
   - **Needs:** Efficient order management, menu and inventory control, financial tracking, and staff delegation.
   - **Pain Points:** Rush-hour chaos, manual tracking of earnings, updating menus dynamically.
3. **Admin**
   - **Needs:** Platform oversight, onboarding new canteens, handling disputes, and system analytics.

---

## 3. Key Features & Capabilities

### 3.1 Consumer Experience (Student / Staff)
- **Multi-Canteen Browsing:** View various canteens on campus, their open/closed status, and full menus.
- **Global Cart System:** Add items from a specific canteen, manage quantities, and proceed to checkout smoothly with a persistent, floating cart UI.
- **Smart Wallet & Budgeting:**
  - Track current balance, recent transactions, and weekly spending limits.
  - Visual analytics (Wallet Gauge) to see spending vs. budget.
  - Deduct payments directly from the wallet for fast checkout.
- **Order History & One-Tap Reorder:** View past orders and instantly add previous meals to the cart with a single tap.
- **"Surprise Me" (AI Meal Generator):** An immersive, gamified feature that generates personalized meal combinations based on the user's available budget, favorite items, and past order history.
- **Profile Management:** Manage personal information (Name, Phone Number, Profile Picture).

### 3.2 Vendor Experience (Owner)
- **Vendor Dashboard:** High-level overview of daily sales, pending orders, and performance metrics.
- **Order Management:** Real-time tracking of incoming orders, status updates (Pending, Preparing, Ready), and fulfillment.
- **Product & Menu Management:** Add, edit, or disable menu items dynamically. Manage categories and pricing.
- **Earnings & Analytics:** Track revenue, view recent payout history, and export financial data.
- **Staff Management:** Add and manage staff accounts who can assist with fulfilling orders without having full owner privileges.

### 3.3 Core System & Infrastructure
- **Authentication:** Secure login and Role-Based Access Control (RBAC) powered by Clerk.
- **State Management:** Persistent global state for Cart, Wallet, and User sessions using Zustand.

---

## 4. Non-Functional Requirements

### 4.1 UI/UX Design (UI/UX Pro Max Standards)
- **Mobile-First Layout:** The core application container is restricted to a maximum width (e.g., 440px) to simulate a premium native app experience on desktop browsers, while naturally fitting mobile devices.
- **Aesthetics:** Dark mode optimized, utilizing "glassmorphism" (translucent cards, blurred backdrops), vibrant primary accent colors (Golden Glow), and modern typography.
- **Micro-Interactions:** Smooth Framer Motion animations for page transitions, card swiping (in Surprise Me), and UI state changes (e.g., Cart pulse).
- **Accessibility:** Clear visual hierarchies, high-contrast text, and touch-friendly target sizes.

### 4.2 Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Zustand, React Router DOM.
- **Backend:** Python (FastAPI / Uvicorn).
- **Authentication:** Clerk.

### 4.3 Performance & Reliability
- Fast page loads and instant client-side transitions.
- Real-time or near real-time order state synchronization between consumers and vendors.

---

## 5. Future Roadmap
- **Real-time Push Notifications:** Alerts for when an order is ready for pickup.
- **Advanced Social Ledger:** Allow students to split bills or transfer wallet funds to friends.
- **Inventory Tracking:** Automatic "out of stock" labels when a vendor runs out of ingredients.
- **Loyalty Program:** Reward points for frequent orders at specific canteens.
