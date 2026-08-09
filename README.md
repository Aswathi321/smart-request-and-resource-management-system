# RITConnect - College Request & Resource Management

This is a full-stack MERN (MongoDB, Express, React, Node.js) application for managing college requests, venue bookings, and equipment bookings with role-based access.

## Prerequisites

To run this project on a new system, you must have the following installed:
1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended) - which includes `npm`
2. **[MongoDB](https://www.mongodb.com/try/download/community)** (Local instance running, or you can use a free MongoDB Atlas cloud cluster)

---

## 🚀 Setup Instructions

Follow these step-by-step instructions to get the application running on a completely new system.

### 1. Extract the Project
Unzip the project folder to a location on your computer. You should see two main folders: `frontend` and `backend`.

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
Create a new file named `.env` inside the `backend` folder (if it doesn't already exist) and add the following lines. You can change the MongoDB URI if using a cloud database.
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college_management
JWT_SECRET=thisismysecretkey12345
```

**Seed the Database (Optional but recommended):**
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
Open a **new** separate terminal and navigate to the frontend directory:
```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

*(Note: The frontend uses Vite. Typically, Vite runs on port 5173 and automatically proxies API requests to the backend on port 5000 via `vite.config.js`)*

**Start the Frontend Server:**
```bash
npm run dev
```

---

### 4. Open the Application
Once both servers are running, open your web browser and navigate to:
[http://localhost:5173](http://localhost:5173)

### 💡 Testing Credentials
If you ran the seed scripts, the following default credentials have been created:
- **Password for all seeded accounts**: `123456`
- **Resource Incharges**:
  - `cse.incharge@college.com`
  - `ece.incharge@college.com`
  - `me.incharge@college.com`
  - `common.incharge@college.com`

*To test standard student/admin flows, you can register a new account from the login page.*
