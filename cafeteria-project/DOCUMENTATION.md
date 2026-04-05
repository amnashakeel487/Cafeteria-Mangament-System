# COMSTAS Cafeteria System — Project Documentation

## Overview

A full-stack web application for managing university cafeteria operations. It supports three user roles: **Admin**, **Cafeteria Staff**, and **Students**. The frontend is built with React + Vite + Tailwind CSS, and the backend is a Node.js/Express REST API connected to a Supabase (PostgreSQL) database.

---

## Project Structure

```
cafeteria-project/
├── api/                    # Vercel serverless entry point
├── backend/                # Node.js/Express REST API
│   ├── middleware/         # JWT authentication guards
│   ├── routes/             # API route handlers (grouped by role)
│   ├── database.js         # Supabase client setup
│   ├── server.js           # Express app entry point
│   ├── uploadHelper.js     # File upload utility (Supabase Storage)
│   ├── supabase_schema.sql # Database schema
│   └── .env                # Environment variables
└── src/                    # React frontend
    ├── components/         # Shared layout and route guard components
    ├── context/            # React context (cart state)
    ├── pages/              # Page components grouped by role
    │   ├── admin/
    │   ├── cafeteria/
    │   └── student/
    ├── App.jsx             # Root router
    ├── main.jsx            # React entry point
    └── supabaseClient.js   # Frontend Supabase client
```

---

## Backend

### `backend/server.js`
The Express application entry point. Registers all middleware (CORS, JSON body parsing) and mounts every route group under its respective path prefix (`/api/admin`, `/api/cafeteria`, `/api/student`). Also includes a global error handler and starts the HTTP server on the configured port (default: 5000).

### `backend/database.js`
Creates and exports a single Supabase client instance using `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment. All route files import this to query the database. Exits the process immediately if the required env vars are missing.

### `backend/uploadHelper.js`
Centralizes all file upload logic. Uses `multer` with in-memory storage (no disk writes) to accept image and video files. Provides three exports:
- `createUpload(fieldName, maxSizeMB)` — creates a configured multer instance
- `uploadToSupabase(buffer, folder, originalName, mimetype)` — uploads a file buffer to the `cafeteria_uploads` Supabase Storage bucket and returns the public URL
- `deleteFromSupabase(publicUrl)` — removes a file from storage by its public URL (used when replacing old images)

### `backend/.env`
Stores sensitive configuration: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `JWT_SECRET`. Never committed to version control.

### `backend/supabase_schema.sql`
SQL schema defining all database tables: `users`, `cafeterias`, `menu_items`, `menu_categories`, `orders`, `order_items`, and `payment_info`. Used to set up or recreate the database.

---

## Backend Middleware

### `middleware/auth.js`
Protects admin-only routes. Verifies the JWT from the `Authorization` header and checks that `role === 'admin'`. Attaches the decoded payload to `req.user`.

### `middleware/cafeteriaAuth.js`
Protects cafeteria staff routes. Same JWT verification but checks `role === 'cafeteria'`. Attaches decoded payload to `req.cafeteria`.

### `middleware/studentAuth.js`
Protects student routes. Checks `role === 'student'`. Attaches decoded payload to both `req.user` and `req.student`.

---

## Backend Routes

### Admin Routes

| File | Mount Path | Purpose |
|------|-----------|---------|
| `routes/adminAuth.js` | `POST /api/admin/login` | Admin login with bcrypt password check + JWT issuance. Also seeds a default admin account on startup if none exists. |
| `routes/adminStudents.js` | `/api/admin/students` | Full CRUD for student accounts (list, add, update, delete). |
| `routes/adminCafeterias.js` | `/api/admin/cafeterias` | Full CRUD for cafeteria accounts (list, add, update, delete). |
| `routes/adminOrders.js` | `GET /api/admin/orders` | Read-only view of all orders across all cafeterias, joined with student and cafeteria info. |
| `routes/adminDashboard.js` | `GET /api/admin/dashboard/stats` | Aggregated stats: total students, cafeterias, orders, revenue, newest students, and per-cafeteria order counts. |
| `routes/adminProfile.js` | `/api/admin/profile` | Get and update admin profile details and profile picture. Handles Supabase Storage upload/delete for avatars. |

### Cafeteria Routes

| File | Mount Path | Purpose |
|------|-----------|---------|
| `routes/cafeteriaAuth.js` | `POST /api/cafeteria/login` | Cafeteria staff login with JWT issuance. |
| `routes/cafeteriaDashboard.js` | `/api/cafeteria/dashboard` | Stats scoped to the logged-in cafeteria (total/pending/completed orders, today's revenue). Also returns recent orders. |
| `routes/cafeteriaMenu.js` | `/api/cafeteria/menu` | Full CRUD for menu items including image/video upload. Also manages custom menu categories with auto-seeding of defaults (Meals, Snacks, Drinks). |
| `routes/cafeteriaOrders.js` | `/api/cafeteria/orders` | Lists orders with filters, approves/rejects payment screenshots, updates order status (pending → processing → completed), and creates manual walk-in orders. |
| `routes/cafeteriaPayments.js` | `/api/cafeteria/payments` | Get and upsert payment method settings (JazzCash, EasyPaisa, bank transfer). Includes a public endpoint for students to read payment info without auth. |
| `routes/cafeteriaProfile.js` | `/api/cafeteria/profile` | Get/update cafeteria profile details, change password, and upload profile picture/video to Supabase Storage. |

### Student Routes

| File | Mount Path | Purpose |
|------|-----------|---------|
| `routes/studentAuth.js` | `POST /api/student/login` | Student login. Auto-registers new students on first login (demo behavior). |
| `routes/studentCafeterias.js` | `GET /api/student/cafeterias` | Returns public info (name, location, contact, picture) for all cafeterias. |
| `routes/studentMenu.js` | `GET /api/student/menu/:cafeteriaId` | Returns a specific cafeteria's info, categories, and menu items in one response. |
| `routes/studentOrders.js` | `/api/student/orders` | Create a new order (with optional payment screenshot upload) and fetch the student's full order history with items. |
| `routes/studentProfile.js` | `/api/student/profile` | Get profile with order count, update profile details, change password, and upload profile picture. |

---

## API Entry Point

### `api/index.js`
Wraps the Express app for deployment on Vercel as a serverless function. Necessary because Vercel doesn't run a persistent Node server — it invokes the handler per request.

---

## Frontend

### `src/main.jsx`
The React application entry point. Mounts the `<App />` component into the DOM inside `React.StrictMode`.

### `src/App.jsx`
Defines the entire client-side routing tree using `react-router-dom`. Wraps everything in `<CartProvider>` for global cart state. Routes are split into three protected sections (admin, cafeteria, student), each guarded by their respective route guard component.

### `src/supabaseClient.js`
Creates and exports the frontend Supabase client. Used directly in some pages for real-time or storage operations that bypass the backend API.

---

## Frontend Components

### `components/AdminRoute.jsx`
Route guard for admin pages. Checks for `adminToken` in localStorage. Redirects to `/admin/login` if not present.

### `components/CafeteriaRoute.jsx`
Route guard for cafeteria staff pages. Checks for `cafeteriaToken` in localStorage.

### `components/StudentRoute.jsx`
Route guard for student pages. Checks for `studentToken` in localStorage.

### `components/AdminLayout.jsx`
Shell layout for all admin pages. Renders the `<Sidebar>` and `<Topbar>` with a main content area (`<Outlet>`). Manages mobile sidebar open/close state.

### `components/CafeteriaLayout.jsx`
Shell layout for cafeteria staff pages. Includes its own inline sidebar with navigation links, a fixed topbar, and mobile hamburger menu. Reads cafeteria profile data from localStorage to display name and avatar.

### `components/StudentLayout.jsx`
Shell layout for student pages. Features a fixed top navbar, a collapsible sidebar for desktop, and a bottom navigation bar for mobile. Includes cart and profile icon shortcuts in the header.

### `components/Sidebar.jsx`
The admin sidebar. Shows navigation links (Dashboard, Students, Cafeterias, Orders, Profile), the logged-in admin's avatar and name, and a logout button. Listens to `localStorage` changes to keep the avatar in sync after profile updates.

### `components/Topbar.jsx`
The admin top bar. Contains a search input, notifications icon, settings link, and a "Systems Live" status indicator.

---

## Frontend Context

### `context/CartContext.jsx`
Global cart state using React Context. Persists cart contents and the active cafeteria ID to `localStorage`. Handles:
- Adding/removing items with quantity tracking
- Clearing the cart when switching cafeterias (with confirmation prompt)
- Computing `cartTotal` and `cartItemCount`
- Exposing `useCart()` hook for any component to access cart state

---

## Frontend Pages

### Admin Pages (`src/pages/admin/`)

| File | Route | Purpose |
|------|-------|---------|
| `Login.jsx` | `/admin/login` | Admin login form. Stores token and user data in localStorage on success. |
| `Dashboard.jsx` | `/admin/dashboard` | Overview stats cards (students, cafeterias, orders, revenue), newest students list, and per-cafeteria order load table. |
| `Students.jsx` | `/admin/students` | Table of all students with add, edit, and delete functionality via modal forms. |
| `Cafeterias.jsx` | `/admin/cafeterias` | Table of all cafeterias with add, edit, and delete functionality via modal forms. |
| `Orders.jsx` | `/admin/orders` | Read-only table of all orders across the system with student and cafeteria details. |
| `Profile.jsx` | `/admin/profile` | Admin profile editor: update name, email, contact, password, and profile picture/video. |

### Cafeteria Pages (`src/pages/cafeteria/`)

| File | Route | Purpose |
|------|-------|---------|
| `Login.jsx` | `/cafeteria/login` | Cafeteria staff login form. |
| `Dashboard.jsx` | `/cafeteria/dashboard` | Stats for the logged-in cafeteria (today's orders/revenue, totals) and a recent orders table. |
| `Menu.jsx` | `/cafeteria/menu` | Full menu management: add/edit/delete items with image or video upload, manage custom categories. |
| `Orders.jsx` | `/cafeteria/orders` | Live order queue. Staff can approve/reject payment screenshots and update order status through the kitchen workflow. Also supports creating manual walk-in orders. |
| `History.jsx` | `/cafeteria/history` | Completed and cancelled order history for the cafeteria. |
| `Payments.jsx` | `/cafeteria/payments` | Configure accepted payment methods (JazzCash, EasyPaisa, bank transfer) with account details. |
| `Profile.jsx` | `/cafeteria/profile` | Update cafeteria name, location, contact, profile picture/video, and password. |

### Student Pages (`src/pages/student/`)

| File | Route | Purpose |
|------|-------|---------|
| `Login.jsx` | `/student/login` | Student login form. Auto-registers on first login. |
| `Cafeterias.jsx` | `/student/cafeterias` | Browse all available cafeterias with their info and a link to view their menu. |
| `MenuBrowsing.jsx` | `/student/menu/:cafeteriaId` | Browse a cafeteria's menu filtered by category. Add items to cart with quantity controls. |
| `CartCheckout.jsx` | `/student/cart` | Review cart contents, select payment method, upload payment screenshot (for JazzCash/EasyPaisa), and place the order. |
| `OrderTracking.jsx` | `/student/track` | Track the status of the student's most recent active order in real time. |
| `OrderHistory.jsx` | `/student/orders` | Full order history with item breakdown, payment status, and order status for each past order. |
| `StudentProfile.jsx` | `/student/profile` | View and edit student profile (name, contact, profile picture) and change password. |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.mjs` | Vite build configuration. Sets up the React plugin and dev server proxy to the backend. |
| `tailwind.config.js` | Tailwind CSS configuration with custom theme tokens (colors, fonts). |
| `postcss.config.cjs` | PostCSS config required by Tailwind. |
| `eslint.config.mjs` | ESLint rules for the React frontend. |
| `vercel.json` | Vercel deployment config. Routes all requests to the `api/index.js` serverless function and serves the frontend build. |
| `.gitignore` | Excludes `node_modules`, `.env`, and build artifacts from version control. |
| `index.html` | HTML shell for the Vite/React SPA. |

---

## How to Run

**Backend** (port 5000):
```bash
cd cafeteria-project/backend
node server.js
```

**Frontend** (port 5173):
```bash
cd cafeteria-project
npm run dev
```

**Default Admin Credentials:**
- Email: `admin@culinary.edu`
- Password: `adminpassword`
