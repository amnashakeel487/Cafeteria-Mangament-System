# Cafeteria Management System - Detailed Functionality Review

This document summarizes the complete implemented functionality in the project, based on a full review of frontend routes/components and backend APIs.

## 1) Project Overview

The system is a role-based cafeteria platform with:

- Public website and SEO-ready landing pages
- Student portal for browsing, ordering, and tracking
- Cafeteria portal for menu/orders/deals/payments operations
- Admin portal for users/cafeterias/orders governance
- Supabase-backed database and storage

Primary app entry and routing are defined in `src/App.jsx`.

## 2) User Roles and Access Model

### Public (No Login)
- Landing page, about, and contact are publicly available.
- Public menu preview section is available on landing page.
- Public route examples:
  - `/`
  - `/about`
  - `/contact`
  - `/student/login`
  - `/student/register`
  - `/cafeteria/login`
  - `/admin/login`

### Student (Authenticated)
- Access guarded by `StudentRoute` using `studentToken`.
- Main protected routes:
  - `/student/cafeterias`
  - `/student/menu/:cafeteriaId`
  - `/student/cart`
  - `/student/track`
  - `/student/orders`
  - `/student/profile`

### Cafeteria Staff (Authenticated)
- Access guarded by `CafeteriaRoute` using `cafeteriaToken`.
- Main protected routes:
  - `/cafeteria/dashboard`
  - `/cafeteria/orders`
  - `/cafeteria/history`
  - `/cafeteria/payments`
  - `/cafeteria/menu`
  - `/cafeteria/deals`
  - `/cafeteria/profile`

### Admin (Authenticated)
- Access guarded by `AdminRoute` using `adminToken`.
- Main protected routes:
  - `/admin/dashboard`
  - `/admin/students`
  - `/admin/cafeterias`
  - `/admin/orders`
  - `/admin/profile`

## 3) Public Website Functionality

## Landing Experience (`src/pages/LandingPage.jsx`)
- Sticky animated navbar with role-specific CTAs
- Hero section with animated background and call-to-action buttons
- Features section with hover cards
- "How It Works" student journey section
- **Public Browse Menu section** (`src/components/BrowseMenuSection.jsx`)
  - Fetches cafeterias directly from Supabase
  - Fetches menu items for selected cafeteria
  - Cafeteria selector cards
  - Category filtering and live search
  - Loading skeletons, empty states, animated transitions
  - CTA to student login for ordering
- Portal selection cards for customer/cafeteria login
- Developer team section
- Footer with operating hours and quick links

## About + Contact
- `/about` and `/contact` pages implemented with matching project styling and route-level SEO.

## SEO and Discoverability
- Dynamic per-page SEO via `PageSEO` and `react-helmet-async`
- Central SEO config in `src/seo/siteConfig.js`
- Public robots and sitemap served via serverless endpoints:
  - `/robots.txt` -> `api/robots.js`
  - `/sitemap.xml` -> `api/sitemap.js`
- Vercel routing ensures sitemap/robots are served as text/XML (not SPA HTML fallback)

## 4) Student Portal Functionality

## Authentication
- Student register (`/student/register`)
  - Registration creates pending account (admin approval required)
- Student login (`/student/login`)
  - JWT token + student profile saved in localStorage

## Cafeteria Discovery
- `StudentCafeterias.jsx` fetches available cafeterias from `/api/student/cafeterias`
- Displays cafeteria cards with location and media

## Menu Browsing + Deals
- `MenuBrowsing.jsx` loads:
  - Cafeteria profile info
  - Categories
  - Menu items
  - Active deals
- Category tabs and search filtering
- Add/remove items to cart
- Deal bundles can be added to cart

## Cart and Checkout
- Centralized cart state in `CartContext.jsx`
- Single-cafeteria cart enforcement
- Checkout supports:
  - Cash on delivery
  - Online payment
- Online payment flow includes:
  - Fetch public payment details by cafeteria
  - Screenshot upload or URL input
  - Multipart order submission to backend

## Order Tracking + History
- `OrderTracking.jsx`
  - Tracks latest order status with visual progress states
  - Shows payment-status-aware progression
- `OrderHistory.jsx`
  - Search + status filtering
  - Reorder action to rebuild cart from historical order items

## Profile Management
- `StudentProfile.jsx` supports:
  - Fetch/update profile info
  - Password update
  - Profile media upload (image/video)
  - Profile media URL update

## 5) Cafeteria Portal Functionality

## Authentication
- Cafeteria login via `/api/cafeteria/login`
- Stores `cafeteriaToken` and `cafeteriaData` in localStorage

## Dashboard
- KPI cards for order/revenue metrics
- Recent order list
- Manual walk-in order creation flow from dashboard

## Orders and Payment Verification
- Orders module includes:
  - Order list and filtering
  - Queue/status management
  - Payment proof verification
- Staff can approve/reject payment screenshots
- Status transitions include preparing/ready/completed type operations

## Menu Management
- Full menu item CRUD
- Category CRUD (with guard to prevent deleting categories in use)
- Supports:
  - Image upload
  - Video upload
  - External media URL
- Uses Supabase storage for large media uploads

## Deals Management
- Create/update/delete bundle deals
- Deal item composition from cafeteria menu
- Active/inactive state control
- Savings/original-price style presentation logic

## Payments Configuration
- Configure payment methods/details:
  - JazzCash
  - EasyPaisa
  - Bank transfer
- Validation for phone-wallet formats
- Public payment info endpoint used by student checkout

## History + Profile
- Historical orders page with date/status/search filters
- Cafeteria profile module:
  - Update account info
  - Change password
  - Update profile media

## 6) Admin Portal Functionality

## Authentication
- Admin login endpoint
- Admin route protection through JWT middleware and frontend guard

## Dashboard
- System-wide analytics:
  - Total students
  - Total cafeterias
  - Total orders
  - Revenue aggregates
- Cafeteria activity insights and recent orders
- Client-side CSV export/reporting features

## Student Administration
- List students (pending + approved flow)
- Approve/reject student registrations
- Create/update/delete student records

## Cafeteria Administration
- List cafeterias
- Register/add cafeteria accounts
- Update/delete cafeteria records

## Global Order Oversight
- Read-only global orders listing for monitoring
- Filters by status/date/cafeteria

## Admin Profile
- Fetch/update profile details
- Change password
- Update avatar/media

## 7) Backend API Functionality (Express + Supabase)

Backend entry: `backend/server.js`

## API Groups
- `/api/admin/*`
- `/api/cafeteria/*`
- `/api/student/*`
- Public utility endpoint:
  - `/api/payments/public/:cafeteriaId`

## Key Route Modules
- Admin:
  - `adminAuth.js`
  - `adminStudents.js`
  - `adminCafeterias.js`
  - `adminOrders.js`
  - `adminDashboard.js`
  - `adminProfile.js`
- Cafeteria:
  - `cafeteriaAuth.js`
  - `cafeteriaDashboard.js`
  - `cafeteriaMenu.js`
  - `cafeteriaDeals.js`
  - `cafeteriaPayments.js`
  - `cafeteriaOrders.js`
  - `cafeteriaProfile.js`
- Student:
  - `studentAuth.js`
  - `studentCafeterias.js`
  - `studentMenu.js`
  - `studentDeals.js`
  - `studentOrders.js`
  - `studentProfile.js`

## Middleware and Security
- Role-specific JWT middleware:
  - `middleware/auth.js` (admin)
  - `middleware/cafeteriaAuth.js`
  - `middleware/studentAuth.js`
- JSON and URL-encoded body parsing with limits
- CORS enabled
- Centralized error handling middleware

## 8) Supabase Integration

## Database
Supabase is used as the primary data layer for:

- `users`
- `cafeterias`
- `menu_items`
- `menu_categories`
- `orders`
- `order_items`
- `deals`
- `deal_items`
- `payment_info`

## Storage
- Media uploads use Supabase Storage bucket: `cafeteria_uploads`
- Used for:
  - Profile images/videos
  - Menu item media
  - Payment proof screenshots

## Client Usage
- Existing Supabase client in `src/supabaseClient.js`
- Used in frontend where direct Supabase reads/uploads are required

## 9) Shared UI/UX Infrastructure

- Theme system with toggle and persistence:
  - `ThemeContext.jsx`
  - `ThemeToggle.jsx`
- Shared role layouts:
  - `AdminLayout`
  - `CafeteriaLayout`
  - `StudentLayout`
- Shared image performance component:
  - `LazyImage.jsx`
- Framer Motion animations across landing and auth experiences
- Modern responsive design with dark-theme-centric visual language

## 10) Functional Highlights

- End-to-end multi-role cafeteria operations implemented
- Public-to-authenticated funnel is complete (discover -> login -> order/manage)
- Full ordering lifecycle covered:
  - Menu browse
  - Cart
  - Checkout
  - Payment proof
  - Tracking
  - History
- Admin governance workflows included (approval + CRUD + oversight)
- SEO setup implemented for discoverability and indexing

---

If needed, this can be expanded into a second document that maps:

- **Frontend route -> backend endpoint(s)**
- **Endpoint -> table(s) touched**
- **Each feature -> exact file-level implementation references**
