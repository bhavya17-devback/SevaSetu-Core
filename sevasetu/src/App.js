import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./styles/theme.css";
import { AuthProvider } from "./context/AuthContext";
import { CategoriesProvider } from "./context/CategoriesContext";

import LandingPage from "./pages/common/LandingPage";
import Login from "./pages/common/Login";
import Register from "./pages/common/Register";

import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateDonation from "./pages/donor/CreateDonation";
import MyDonations from "./pages/donor/MyDonations";
import Certificate from "./pages/donor/Certificate";

import NGODashboard from "./pages/ngo/NGODashboard";
import AvailableDonations from "./pages/ngo/AvailableDonations";
import MyClaims from "./pages/ngo/MyClaims";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminReports from "./pages/admin/AdminReports";
import AdminCategories from "./pages/admin/AdminCategories";

function App() {
  return (
    <AuthProvider>
      <CategoriesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= DONOR ================= */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/create-donation" element={<CreateDonation />} />
          <Route path="/donor/my-donations" element={<MyDonations />} />
          <Route path="/donor/certificate" element={<Certificate />} />

          {/* ================= NGO ================= */}
          <Route path="/ngo/dashboard" element={<NGODashboard />} />
          <Route path="/ngo/available-donations" element={<AvailableDonations />} />
          <Route path="/ngo/my-claims" element={<MyClaims />} />

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/donations" element={<AdminDonations />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </CategoriesProvider>
    </AuthProvider>
  );
}

export default App;
