# BiteNow 🍔

BiteNow is a modern digital canteen management and food ordering system designed for university campuses. It aims to eliminate long queues, streamline vendor inventory management, and provide a seamless, interactive food ordering experience for students and staff.

## 📌 Problem Statement

University canteens suffer from heavy rush-hour queues, mismanaged orders, and lack of real-time inventory updates. Students waste valuable break time waiting in lines, while vendors struggle to manage sudden spikes in orders without a systematic tracking solution. BiteNow solves this by digitizing the entire canteen experience, enabling remote ordering, real-time tracking, and organized vendor management.

## 🚀 Current Progress (Mid-Evaluation)

We have successfully established the foundational architecture and core management modules of the application:
- **Authentication & Authorization**: Integrated **Clerk** for robust user authentication and Role-Based Access Control (RBAC), distinguishing between `STUDENT` and `OWNER` roles.
- **Frontend Foundations**: Built a dynamic, responsive UI with **React** and **Tailwind CSS**. Implemented dynamic layouts and bottom navigation specific to user roles.
- **Backend Architecture**: Set up a robust **FastAPI** backend with **SQLAlchemy** for database interactions.
- **Canteen & Menu Management**:
  - Implemented the Canteen Discovery APIs for students.
  - Built out the Vendor Dashboard allowing canteen owners to manage their product catalog (Standard Items & Daily Specials).
  - Connected the frontend React components to the backend APIs, ensuring database changes are instantly reflected on the UI.
  - Implemented session management and secure user logout flows.
- **Documentation**: Adopted the **OpenSpec** workflow to maintain strict specification-driven development, storing all design and implementation specs in the repository.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Clerk React SDK
- **Data Fetching**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy (Async)
- **Database**: SQLite (Development) / PostgreSQL (Production ready with asyncpg)
- **Authentication Validation**: PyJWT for stateless Clerk token verification

## 📅 Planned Features

- **Order Management System**: Allow students to add items to a cart, place orders, and track status (Pending -> Preparing -> Ready).
- **Payment Integration**: Seamless checkout utilizing Razorpay integration.
- **Real-Time Notifications**: WebSocket or polling-based alerts for order status updates.
- **Vendor Analytics**: A comprehensive dashboard showing earnings, popular items, and daily sales reports.
- **Staff Management**: Allow vendors to assign `STAFF` roles to employees to help manage incoming orders.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A [Clerk](https://clerk.dev/) account for authentication keys.

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📂 Repository Structure

The project follows a decoupled monolithic structure with a spec-driven planning layer:

```text
BiteNow/
├── README.md               # Project overview and setup instructions
├── frontend/               # React/Vite frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page views
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API integration logic
│   └── package.json
├── backend/                # FastAPI python application
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   ├── modules/        # Domain-driven feature modules (auth, menu, etc.)
│   │   └── database.py     # DB connection config
│   └── requirements.txt
└── openspec/               # Specification-driven development docs
    ├── changes/            # Active and archived feature proposals
    └── specs/              # Source-of-truth capability requirements
```
