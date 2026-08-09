# RITConnect - College Request & Resource Management

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing college requests, venue bookings, and equipment bookings with role-based access.

## Features

- Role-based access control (Students, Admins, Resource Incharges)
- Venue booking and management
- Equipment booking and management
- Department-wise resource incharge assignment
- Request tracking and approval workflows

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT |
| Version Control | Git, GitHub |

## Screenshots

*Add 2-3 screenshots here — dashboard, booking flow, and admin view work best:*

```md
![Dashboard](screenshots/dashboard.png)
```

## Prerequisites

To run this project on a new system, you must have the following installed:

1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended) — which includes `npm`
2. **[MongoDB](https://www.mongodb.com/try/download/community)** (local instance running, or a free MongoDB Atlas cloud cluster)

---

## 🚀 Setup Instructions

Follow these step-by-step instructions to get the application running on a completely new system.

### 1. Clone the Project

```bash
git clone https://github.com/Aswathi321/smart-request-and-resource-management-system.git
cd smart-request-and-resource-management-system
```

You should see two main folders: `frontend` and `backend`.

### 2. Setup the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

**Install dependencies:**

```bash
npm install
```

**Configure Environment Variables (.env):**

Create a new file named `.env` inside the `backend` folder and add the following, replacing the placeholder values with your own:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_management
JWT_SECRET=your_own_secret_key_here
```

**Seed the Database (optional but recommended):**

To populate the database with default venues, equipment, and resource incharges for testing:

```bash
node seedVenues.js
node seedEquipments.js
```

**Start the Backend Server:**

```bash
npm run dev
```

*(The server should print "Connected to MongoDB" and "Server running on port 5000")*

---

### 3. Setup the Frontend

Open a **new**, separate terminal and navigate to the frontend directory:

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

*(Note: the frontend uses Vite. It typically runs on port 5173 and proxies API requests to the backend on port 5000 via `vite.config.js`)*

**Start the Frontend Server:**

```bash
npm run dev
```

---

### 4. Open the Application

Once both servers are running, open your browser and navigate to:

[http://localhost:5173](http://localhost:5173)

### 💡 Testing Credentials

If you ran the seed scripts, the following default accounts have been created (password: `123456`):

- **Resource Incharges:**
  - `cse.incharge@college.com`
  - `ece.incharge@college.com`
  - `me.incharge@college.com`
  - `common.incharge@college.com`

*To test standard student/admin flows, register a new account from the login page.*

## What I Learned

Building RITConnect gave me hands-on experience designing role-based access control across a full-stack MERN app — structuring MongoDB schemas for multiple user roles, building protected Express/JWT routes, and connecting a Vite-powered React frontend to a real backend workflow for booking and approvals.

## Author

**Aswathi P S**
[LinkedIn](https://www.linkedin.com/in/aswathi-ps/) · [GitHub](https://github.com/Aswathi321)
