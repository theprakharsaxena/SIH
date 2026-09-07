import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// Public pages
import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';

// Layouts
import LearnerLayout from './layouts/LearnerLayout';
import AdminLayout   from './layouts/AdminLayout';

// Learner pages
import LearnerDashboard  from './pages/learner/Dashboard';
import CoursesPage       from './pages/learner/CoursesPage';
import LearnerAssessment from './pages/learner/AssessmentPage';
import ProfilePage       from './pages/learner/ProfilePage';

// Admin pages
import AdminLogin           from './pages/admin/AdminLogin';
import AdminHome            from './pages/admin/AdminHome';
import OfficersPage         from './pages/admin/OfficersPage';
import HeatmapPage          from './pages/admin/HeatmapPage';
import AssessmentAnalytics  from './pages/admin/AssessmentAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin login (public, but not for learners) ── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Learner portal (protected) ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LearnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index        element={<LearnerDashboard />} />
            <Route path="courses"    element={<CoursesPage />} />
            <Route path="assessment" element={<LearnerAssessment />} />
            <Route path="profile"    element={<ProfilePage />} />
          </Route>

          {/* ── Admin portal (admin-only protected) ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index              element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"   element={<AdminHome />} />
            <Route path="officers"    element={<OfficersPage />} />
            <Route path="heatmap"     element={<HeatmapPage />} />
            <Route path="assessments" element={<AssessmentAnalytics />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
