/**
 * SEO: Central site metadata for COMSATS Cafe Cafeteria Management System.
 * Used by PageSEO (react-helmet-async) and referenced when building sitemap.xml.
 */

export const SITE_URL = 'https://comsats-cafeteria.vercel.app';
export const SITE_NAME = 'COMSATS Cafe';
export const SITE_TAGLINE = 'Campus Cafeteria Management System';
export const DEFAULT_AUTHOR = 'COMSATS Cafe Engineering Team';
export const DEFAULT_KEYWORDS =
  'cafeteria management, campus dining, online food ordering, COMSATS Cafe, university cafeteria, menu ordering, order tracking, cafe dashboard';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`;

/** Default meta used in index.html and as fallbacks */
export const DEFAULT_SEO = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    'Order fresh campus meals online, track orders in real time, and manage cafeteria menus with COMSATS Cafe — the modern cafeteria management platform for students and staff.',
  keywords: DEFAULT_KEYWORDS,
};

/**
 * Per-route SEO definitions — import PAGE_SEO.* in each page component.
 * path: used for canonical and Open Graph URLs
 */
export const PAGE_SEO = {
  home: {
    path: '/',
    title: 'Fresh Food, Seamless Campus Orders',
    description:
      'COMSATS Cafe — browse campus cafeterias, place orders online, track pickup status, and manage menus. Built for students and cafe owners.',
    keywords: 'campus cafeteria, student food ordering, COMSATS Cafe, online menu',
  },
  about: {
    path: '/about',
    title: 'About COMSATS Cafe',
    description:
      'Learn about COMSATS Cafe — a modern cafeteria management system for campus dining, online ordering, and real-time order tracking.',
    keywords: 'about COMSATS Cafe, cafeteria system, campus dining platform',
  },
  contact: {
    path: '/contact',
    title: 'Contact Us',
    description:
      'Contact the COMSATS Cafe team for support, feedback, or partnership inquiries about our campus cafeteria management platform.',
    keywords: 'contact COMSATS Cafe, cafeteria support, campus dining help',
  },
  studentLogin: {
    path: '/student/login',
    title: 'Customer Login',
    description: 'Sign in to the COMSATS Cafe student portal to browse menus, place orders, and track your campus meal pickup.',
    keywords: 'student login, customer portal, campus food order login',
  },
  studentRegister: {
    path: '/student/register',
    title: 'Student Registration',
    description: 'Create your COMSATS Cafe student account to start ordering from campus cafeterias online.',
    keywords: 'student register, cafeteria account, campus dining signup',
  },
  studentCafeterias: {
    path: '/student/cafeterias',
    title: 'Campus Cafeterias & Menus',
    description: 'Browse all campus cafeterias, view ratings, and explore menus to order your next meal.',
    keywords: 'campus cafeterias, browse menu, university dining',
  },
  studentMenu: {
    path: '/student/menu',
    title: 'Browse Menu',
    description: 'Explore cafeteria menu items, deals, and add your favorites to the cart.',
    keywords: 'cafeteria menu, food items, campus meal menu',
  },
  studentCart: {
    path: '/student/cart',
    title: 'Cart & Checkout',
    description: 'Review your cart, apply deals, and complete your campus cafeteria order checkout.',
    keywords: 'food cart, cafeteria checkout, order payment',
  },
  studentOrders: {
    path: '/student/orders',
    title: 'Order History',
    description: 'View your past cafeteria orders and order details on COMSATS Cafe.',
    keywords: 'order history, past orders, student orders',
  },
  studentTrack: {
    path: '/student/track',
    title: 'Track Your Order',
    description: 'Track your active cafeteria order status in real time from kitchen to pickup.',
    keywords: 'order tracking, live order status, pickup tracking',
  },
  studentProfile: {
    path: '/student/profile',
    title: 'Student Profile',
    description: 'Manage your COMSATS Cafe student profile, contact details, and account settings.',
    keywords: 'student profile, account settings',
    noindex: true,
  },
  cafeLogin: {
    path: '/cafeteria/login',
    title: 'Cafe Owner Login',
    description: 'Staff login for COMSATS Cafe — manage menus, orders, payments, and deals from your cafe dashboard.',
    keywords: 'cafe login, staff portal, cafeteria owner login',
  },
  cafeDashboard: {
    path: '/cafeteria/dashboard',
    title: 'Cafe Dashboard',
    description: 'Cafeteria staff dashboard with sales overview, popular items, and order insights.',
    keywords: 'cafe dashboard, cafeteria analytics, staff portal',
    noindex: true,
  },
  cafeMenu: {
    path: '/cafeteria/menu',
    title: 'Menu Management',
    description: 'Add, edit, and manage your cafeteria menu items, images, and categories.',
    keywords: 'menu management, edit cafeteria menu',
    noindex: true,
  },
  cafeOrders: {
    path: '/cafeteria/orders',
    title: 'Cafe Orders',
    description: 'View and manage incoming student orders and payment confirmations.',
    keywords: 'cafe orders, order management',
    noindex: true,
  },
  cafeHistory: {
    path: '/cafeteria/history',
    title: 'Order History',
    description: 'Browse completed and past cafeteria orders for your cafe location.',
    keywords: 'order history, completed orders',
    noindex: true,
  },
  cafePayments: {
    path: '/cafeteria/payments',
    title: 'Payments',
    description: 'Manage payment methods and review payment records for your cafeteria.',
    keywords: 'cafeteria payments, payment settings',
    noindex: true,
  },
  cafeDeals: {
    path: '/cafeteria/deals',
    title: 'Deals & Promotions',
    description: 'Create and manage special deals and promotions for your cafeteria menu.',
    keywords: 'cafeteria deals, food promotions',
    noindex: true,
  },
  cafeProfile: {
    path: '/cafeteria/profile',
    title: 'Cafe Profile',
    description: 'Update your cafeteria profile, location, hours, and profile picture.',
    keywords: 'cafe profile settings',
    noindex: true,
  },
  adminLogin: {
    path: '/admin/login',
    title: 'Admin Login',
    description: 'Administrator login for COMSATS Cafe — manage students, cafeterias, and system-wide orders.',
    keywords: 'admin login, cafeteria admin console',
  },
  adminDashboard: {
    path: '/admin/dashboard',
    title: 'Admin Dashboard',
    description: 'System-wide admin dashboard for COMSATS Cafe cafeteria management.',
    keywords: 'admin dashboard, system overview',
    noindex: true,
  },
  adminStudents: {
    path: '/admin/students',
    title: 'Manage Students',
    description: 'View and manage registered students in the COMSATS Cafe system.',
    keywords: 'manage students, admin students',
    noindex: true,
  },
  adminCafeterias: {
    path: '/admin/cafeterias',
    title: 'Manage Cafeterias',
    description: 'Register and manage campus cafeteria locations in the admin console.',
    keywords: 'manage cafeterias, admin cafeterias',
    noindex: true,
  },
  adminOrders: {
    path: '/admin/orders',
    title: 'All Orders',
    description: 'View and oversee all orders across cafeterias from the admin panel.',
    keywords: 'admin orders, system orders',
    noindex: true,
  },
  adminProfile: {
    path: '/admin/profile',
    title: 'Admin Profile',
    description: 'Manage your administrator profile and account settings.',
    keywords: 'admin profile',
    noindex: true,
  },
};
