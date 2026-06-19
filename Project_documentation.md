# BiteNow: Project Documentation

## 1. Executive Summary & Purpose

**BiteNow** is a modern, decoupled monolithic web application built to digitize and optimize the university canteen experience. 

> [!NOTE]
> **The Problem:** University canteens traditionally suffer from heavy rush-hour queues, mismanaged orders, and a lack of real-time inventory updates. Students waste valuable break time waiting in lines, while canteen owners struggle to manage sudden spikes in orders without a systematic tracking solution. 

> [!IMPORTANT]
> **The Purpose:** BiteNow bridges this gap by providing a dual-interface platform that enables remote ordering, real-time tracking, and organized vendor management. By eliminating physical queues and providing real-time data synchronization between the kitchen and the classroom, BiteNow saves time for students and increases operational efficiency and revenue for vendors.

---

## 2. Platform Architecture

BiteNow utilizes a role-based, decoupled monolithic architecture:

- **Frontend Application**: A responsive, mobile-first single-page application (SPA) built with React 18, Vite, and Tailwind CSS. It communicates with the backend via RESTful APIs.
- **Backend Application**: A high-performance Python backend built with FastAPI. It handles business logic, database interactions using asynchronous SQLAlchemy, and role-based access control.
- **Database**: Uses SQLite for development and PostgreSQL (with `asyncpg`) for production. 
- **Authentication Gateway**: Clerk handles user identity, session management, and JWT issuance, which the FastAPI backend securely verifies.

---

## 3. Comprehensive Feature Breakdown

BiteNow caters to four distinct user roles, each equipped with dedicated interfaces and capabilities.

### 🎓 Student Role (`STUDENT`)
The student experience is designed to be mobile-first, fast, and highly interactive.
- **Canteen Discovery & Menus**: Students can view a list of all active campus canteens, browse their current menus, and check for daily specials.
- **Cart & Remote Ordering**: Users can add multiple items to a persistent cart and place orders remotely. The checkout flow includes a seamless mock payment gateway.
- **Real-Time Order Tracking**: Once an order is placed, students can track its exact status (Pending ➔ Preparing ➔ Ready) via an intuitive Order History panel.
- **Budget Tracking Dashboard**: A dedicated financial tool that helps students monitor their daily and weekly food spending, keeping their budgets in check.
- **Surprise Me!**: A gamified feature that randomly selects a curated meal suggestion for students who can't decide what to eat.

### 🏪 Canteen Owner Role (`OWNER`)
The owner dashboard acts as the command center for the canteen.
- **Live Order Kanban**: A dynamic, kanban-style interface allowing owners to move incoming student orders through various fulfillment stages (Pending, Preparing, Ready), instantly notifying the student upon status change.
- **Product & Inventory Control**: Owners can add new menu items, edit existing ones, upload product images, and toggle item availability (in-stock/out-of-stock) in real-time to prevent ghost orders.
- **Earnings & Analytics**: A comprehensive metrics dashboard displaying total revenue, daily sales trends, and analytics on the most popular/profitable items.
- **Staff Management**: Owners can delegate responsibilities by creating and assigning `STAFF` accounts, ensuring employees can help manage orders without having access to financial data or inventory settings.

### 🧑‍🍳 Canteen Staff Role (`STAFF`)
- **Dedicated Staff Dashboard**: A stripped-down, focused interface designed strictly for the kitchen floor. It allows staff members to view active orders and update their statuses efficiently without being distracted by administrative controls.

### 🛡️ Platform Admin Role (`ADMIN`)
The overarching administrative layer that manages the entire BiteNow ecosystem.
- **Canteen Oversight**: A centralized dashboard to monitor all active canteens across the campus.
- **Vendor Request Management**: A review system to approve or reject onboarding requests from new canteen owners.
- **Menu Bulk-Upload & Editor**: Specialized tools to rapidly onboard new vendors by bulk-uploading CSV/Excel menus, alongside a graphical editor for administrative overrides.
- **Platform Configuration**: Settings to configure global application parameters, operational toggles, and platform-wide announcements.

---

## 4. Technical Stack

### Frontend Engineering
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS (Utility-first styling for rapid UI iteration)
- **State Management**: Zustand (Lightweight global state)
- **Routing**: React Router DOM
- **Authentication Client**: Clerk React SDK
- **API Client**: Axios

### Backend Engineering
- **Core Framework**: FastAPI (High-performance Python web framework)
- **Database ORM**: SQLAlchemy 2.0 (Configured for fully asynchronous database I/O)
- **Database Engine**: SQLite (Local Dev) / PostgreSQL (Production)
- **Migrations**: Alembic
- **Authentication Verification**: PyJWT & Cryptography (Stateless token verification)
- **Testing**: Pytest, Pytest-Asyncio, HTTPX

---

## 5. Security & Access Control

BiteNow implements strict **Role-Based Access Control (RBAC)**:
1. **Identity Provider**: Clerk handles the initial user authentication and issues a JWT containing the user's specific role metadata.
2. **Frontend Routing**: The React application reads this role and routes the user to their respective dashboard (e.g., sending a student to the canteen browser and an owner to the vendor dashboard). Protected routes prevent URL tampering.
3. **Backend Validation**: Every API request to FastAPI must include the JWT. The backend uses PyJWT to cryptographically verify the token against Clerk's public keys and strictly enforces role permissions before executing any database transactions.
