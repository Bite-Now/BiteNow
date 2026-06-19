<h1 align="center">
  <br>
  🍔 BiteNow
  <br>
</h1>

<h4 align="center">A modern digital canteen management and food ordering system for university campuses.</h4>

<p align="center">
  <a href="#-elevator-pitch">Elevator Pitch</a> •
  <a href="#-inspiration">Inspiration</a> •
  <a href="#-what-it-does">What it does</a> •
  <a href="#-how-we-built-it">How we built it</a> •
  <a href="#-challenges-we-ran-into">Challenges</a> •
  <a href="#-whats-next">What's next</a> •
  <a href="#%EF%B8%8F-setup-instructions">Setup</a>
</p>

---

## 🚀 Elevator Pitch

University canteens suffer from heavy rush-hour queues, mismanaged orders, and a lack of real-time inventory updates. Students waste valuable break time waiting in lines, while vendors struggle to manage sudden spikes in orders without a systematic tracking solution. 

**BiteNow** solves this by digitizing the entire canteen experience, enabling remote ordering, real-time tracking, and organized vendor management.

## 💡 Inspiration

We've all been there: you have a 15-minute break between lectures, but the line at the campus canteen is 20 minutes long. By the time you get your food, you're already late for your next class. On the flip side, canteen owners are overwhelmed during these peak hours, scribbling orders on notepads and losing track of what's paid for and what's pending. We realized there had to be a better, more systematic way to bridge the gap between hungry students and busy vendors.

## 🍔 Features Breakdown

BiteNow is a multi-role platform that caters to four distinct user types: Students, Canteen Owners, Staff, and Platform Admins. Each role is equipped with specific tools to maximize efficiency.

### 🎓 For Students (`STUDENT` role)
- **Canteen Discovery**: Browse through all available campus canteens, view their active menus, and see daily specials.
- **Cart & Ordering**: Add desired food items to a persistent cart and place orders remotely with a seamless mock checkout flow.
- **Real-Time Order Tracking**: Keep track of current orders with live status updates (Pending, Preparing, Ready) from an intuitive Order History panel. No more waiting in line!
- **Budget Tracking**: A dedicated dashboard to monitor daily/weekly spending and manage their food budget.
- **Surprise Me!**: Don't know what to eat? Use the "Surprise Me" feature to get a random, curated meal suggestion to try something new.

### 🏪 For Canteen Owners (`OWNER` role)
- **Vendor Dashboard**: A high-level operational overview, displaying live orders and important alerts.
- **Earnings & Analytics**: Track total earnings, monitor daily sales, and view analytics on the most popular items to optimize inventory.
- **Live Order Management**: A kanban-style interface to process incoming student orders, moving them from Pending to Preparing and finally to Ready, which instantly notifies the student.
- **Product & Inventory Control**: Easily add, edit, or remove menu items, and update stock availability in real-time to prevent students from ordering sold-out items.
- **Staff Management**: Delegate tasks by adding `STAFF` accounts for employees to help handle the rush without granting them full owner privileges.

### 🧑‍🍳 For Canteen Staff (`STAFF` role)
- **Staff Dashboard**: A focused interface explicitly for managing active orders and updating order statuses on the floor, ensuring the kitchen stays synchronized with the student app.

### 🛡️ For Platform Administrators (`ADMIN` role)
- **Canteen Oversight**: Manage all active canteens on the platform from a central dashboard.
- **Vendor Requests Management**: Review, approve, or reject incoming requests from new canteen owners wanting to join the platform.
- **Menu Bulk-Upload & Editor**: Tools to quickly onboard new vendors by bulk-uploading menus and a graphical menu editor for administrative overrides.
- **Platform Settings**: Configure global application parameters and operational toggles.

## 🛠️ How we built it

We engineered BiteNow with a modern, decoupled monolithic architecture to ensure scalability and developer velocity during the Buildathon:

### Frontend
- **Framework**: React 18 powered by Vite for lightning-fast HMR.
- **Styling**: Tailwind CSS for rapid, utility-first UI development, ensuring a responsive and highly polished user experience.
- **State Management**: Zustand for lightweight, boilerplate-free global state.
- **Authentication**: Clerk React SDK for robust user management and RBAC (Role-Based Access Control).
- **Routing & Data Fetching**: React Router DOM and Axios.

### Backend
- **Framework**: FastAPI (Python) for extremely high performance and automatic interactive API documentation (Swagger UI).
- **Database ORM**: SQLAlchemy (Async) to handle high-concurrency database interactions without blocking the event loop.
- **Database**: SQLite for rapid development, built to easily scale to PostgreSQL (with `asyncpg`) in production.
- **Security**: PyJWT for stateless, secure verification of Clerk authentication tokens at the API gateway layer.

## 🚧 Challenges we ran into

- **Role-Based Access Control (RBAC)**: Ensuring that the frontend UI dynamically adapts based on whether the user is a `STUDENT` or an `OWNER`, and securely enforcing these roles at the backend API level using stateless JWT verification.
- **Async Database Interactions**: Transitioning from synchronous to asynchronous SQLAlchemy required a deep dive into session management and ensuring no database connections were left hanging during high-concurrency requests.
- **State Synchronization**: Making sure that when a vendor updates an item's availability, the UI reflects the changes smoothly without causing unnecessary re-renders.

## 🏆 Accomplishments that we're proud of

- We successfully integrated **Clerk** with our **FastAPI** backend for a completely custom and secure authentication flow.
- Built a highly intuitive, responsive UI that feels like a native mobile app for students.
- Maintained strict specification-driven development throughout the fast-paced hackathon environment, ensuring clean and well-structured code.

## 🔮 What's next for BiteNow

- **Payment Integration**: Seamless checkout utilizing **Razorpay** to completely eliminate cash handling.
- **Real-Time Notifications**: Implementing WebSockets for instant order status updates (Pending ➔ Preparing ➔ Ready).
- **Vendor Analytics**: A comprehensive dashboard showing earnings, popular items, and daily sales reports.
- **Staff Management**: Allowing vendors to assign `STAFF` roles to employees to help manage incoming orders without giving them full owner privileges.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A [Clerk](https://clerk.dev/) account for authentication keys.

### 1. Clone the repository
```bash
git clone https://github.com/PalSavani07/BiteNow.git
cd BiteNow
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows use `venv\Scripts\activate`
# On Mac/Linux use `source venv/bin/activate`
venv\Scripts\activate
pip install -r requirements.txt
```

Create an `.env` file in the `backend/` directory and add your Clerk Secret Key:
```env
CLERK_SECRET_KEY=your_secret_key
DATABASE_URL=sqlite+aiosqlite:///./test.db
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create an `.env` file in the `frontend/` directory and add your Clerk Publishable Key:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

Start the frontend development server:
```bash
npm run dev
```

---
*Built with ❤️ for university campuses.*
