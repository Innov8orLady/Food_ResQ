import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import RouteGuard from './components/RouteGuard';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ContactPage from './pages/public/ContactPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import AddListingPage from './pages/donor/AddListingPage';
import MyListingsPage from './pages/donor/MyListingsPage';
import ListingDetailPage from './pages/donor/ListingDetailPage';
import ClaimsPickupPage from './pages/donor/ClaimsPickupPage';
import DonationHistoryPage from './pages/donor/DonationHistoryPage';
import DonorAnalyticsPage from './pages/donor/DonorAnalyticsPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';

// Recipient Pages
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import NearbyFoodPage from './pages/recipient/NearbyFoodPage';
import LiveMapPage from './pages/recipient/LiveMapPage';
import FoodDetailPage from './pages/recipient/FoodDetailPage';
import MyClaimsPage from './pages/recipient/MyClaimsPage';
import PickupSchedulePage from './pages/recipient/PickupSchedulePage';
import ClaimHistoryPage from './pages/recipient/ClaimHistoryPage';
import RecipientProfilePage from './pages/recipient/RecipientProfilePage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import FoodListingManagementPage from './pages/admin/FoodListingManagementPage';
import ClaimsManagementPage from './pages/admin/ClaimsManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Dedicated Secure Admin Login Gateway */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Donor Portal Protected Routes */}
      <Route element={<RouteGuard allowedRoles={['donor', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/add-food" element={<AddListingPage />} />
          <Route path="/donor/listings" element={<MyListingsPage />} />
          <Route path="/donor/listings/:id" element={<ListingDetailPage />} />
          <Route path="/donor/claims" element={<ClaimsPickupPage />} />
          <Route path="/donor/history" element={<DonationHistoryPage />} />
          <Route path="/donor/analytics" element={<DonorAnalyticsPage />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />
        </Route>
      </Route>

      {/* Recipient Portal Protected Routes */}
      <Route element={<RouteGuard allowedRoles={['recipient', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/recipient/dashboard" element={<RecipientDashboard />} />
          <Route path="/recipient/nearby" element={<NearbyFoodPage />} />
          <Route path="/recipient/map" element={<LiveMapPage />} />
          <Route path="/recipient/food/:id" element={<FoodDetailPage />} />
          <Route path="/recipient/claims" element={<MyClaimsPage />} />
          <Route path="/recipient/pickups" element={<PickupSchedulePage />} />
          <Route path="/recipient/history" element={<ClaimHistoryPage />} />
          <Route path="/recipient/profile" element={<RecipientProfilePage />} />
        </Route>
      </Route>

      {/* Admin Portal Protected Routes */}
      <Route element={<RouteGuard allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/listings" element={<FoodListingManagementPage />} />
          <Route path="/admin/claims" element={<ClaimsManagementPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}