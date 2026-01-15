# FinFlow - Smart Finance Tracking Website

![FinFlow Dashboard Preview](https://res.cloudinary.com/dtbytfxzs/image/upload/Fin-Flow_beipcu.png)

**FinFlow** is a robust, full-stack MERN finance tracker designed to help users track, analyze, and optimize their wealth. Unlike standard expense trackers, FinFlow introduces **"Smart Logic"** for handling financial movements—automatically recategorizing funds as they move between Investments, Savings, and Expenses to ensure accurate net-worth tracking.

## 🚀 Key Features

* **📊 Interactive Dashboard:** Visualizes financial health using dynamic Recharts (Bar & Area charts). Users can filter data by month or year to spot trends in Income, Expenses, and Savings.
* **🧠 Smart Withdrawal Logic:** A unique backend feature handles fund liquidity. For example, withdrawing from an "Investment" automatically creates a "Savings" entry, while spending from "Savings" records an "Expense," mirroring real-world cash flow.
* **📂 Folder-Based Organization:** Users can create custom folders (e.g., "Stock Market", "Emergency Fund") to categorize transactions and keep distinct financial goals separate.
* **📜 Comprehensive Audit Logs:** Every action—creation, deletion, edit, or withdrawal—is automatically recorded in a History Log with timestamps, ensuring total transparency and error tracking.
* **🎨 Modern UI/UX:** A fully responsive interface built with Tailwind CSS, featuring a collapsible sidebar, mobile-friendly navigation, and a toggleable Dark/Light mode.
* **🔐 Secure Authentication:** Complete Signup/Login system using JWT (JSON Web Tokens) and bcrypt for password hashing.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Recharts (Data Visualization)
* Lucide React (Icons)
* React Router DOM

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JWT Authentication & bcryptjs
* Vercel Serverless Functions

## 📂 Project Structure

The project is organized as a monorepo structure for seamless deployment.

```text
FinFlow/
├── Backend/                 # Server-side logic
│   ├── api/                 # Vercel entry point
│   ├── config/              # DB Connection
│   ├── controllers/         # Auth & Business Logic
│   ├── middleware/          # JWT Protection
│   ├── models/              # Mongoose Schemas (User, Transaction, Folder, History)
│   ├── routes/              # API Routes
│   ├── server.js            # Express App Setup
│   └── vercel.json          # Backend Deployment Config
│
├── Frontend/                # Client-side React App
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, Sidebar, SummaryCard)
│   │   ├── context/         # Global State (Auth, Theme, Search)
│   │   ├── pages/           # Views (Dashboard, Analytics, Profile, etc.)
│   │   └── config.js        # API URL Configuration
│   └── vite.config.js       # Vite Setup
```

## ⚡ Getting Started Locally
Follow these steps to run FinFlow on your local machine.

# Prerequisites
  - Node.js (v14+)
  - MongoDB URI (Local or Atlas)

1. Clone the Repository
```Bash
git clone [https://github.com/yourusername/finflow.git](https://github.com/yourusername/finflow.git)
cd finflow
```
2. Setup Backend
```Bash

cd Backend
npm install
```

# Create a .env file in /Backend with:
```text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

# Start Server
```text
node server.js
```

3. Setup Frontend
Open a new terminal.

```Bash
cd Frontend
npm install
```

# Start React App
```bash
npm run dev
Visit http://localhost:5173 in your browser.
```

# 🌍 Deployment
FinFlow is configured for Vercel.

Backend: Deploy the Backend folder as a project. Set the Root Directory to Backend. Add environment variables (MONGO_URI, JWT_SECRET).
Frontend: Deploy the Frontend folder as a separate project. Set the Root Directory to Frontend.
Connect: Update Frontend/src/config.js with your deployed Backend URL.

# 🛡️ License
This project is licensed under the MIT License.
