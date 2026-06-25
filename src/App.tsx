import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuth } from '@/store/auth';

// Auth
import { LoginPage }          from '@/modules/auth/pages/LoginPage';
import { CreateAccountPage }  from '@/modules/auth/pages/CreateAccountPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';

// Client
import { ClientDashboard }      from '@/modules/client/pages/ClientDashboard';
import { CandidateDetailsPage } from '@/modules/client/pages/CandidateDetailsPage';
import { CartPage }             from '@/modules/client/pages/CartPage';

// Recruiter
import { RecruiterDashboard } from '@/modules/recruiter/pages/RecruiterDashboard';
import { AddResourcePage }    from '@/modules/recruiter/pages/AddResourcePage';

// Admin (no Overview)
import { AdminRecruiters }   from '@/modules/admin/pages/AdminRecruiters';
import { AdminCandidates }   from '@/modules/admin/pages/AdminCandidates';
import { AdminClients }      from '@/modules/admin/pages/AdminClients';
import { AdminAddCandidate } from '@/modules/admin/pages/AdminAddCandidate';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dest =
    user.role === 'client'    ? '/client'            :
    user.role === 'recruiter' ? '/recruiter'         : '/admin/recruiters';
  return <Navigate to={dest} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/create-account"  element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Client ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute role="client"><AppShell /></ProtectedRoute>}>
          <Route path="/client"               element={<ClientDashboard />} />
          <Route path="/client/candidate/:id" element={<CandidateDetailsPage />} />
          <Route path="/client/cart"          element={<CartPage />} />
        </Route>

        {/* ── Recruiter ──────────────────────────────────── */}
        <Route element={<ProtectedRoute role="recruiter"><AppShell /></ProtectedRoute>}>
          <Route path="/recruiter"          element={<RecruiterDashboard />} />
          <Route path="/recruiter/add"      element={<AddResourcePage />} />
          <Route path="/recruiter/edit/:id" element={<AddResourcePage />} />
        </Route>

        {/* ── Admin ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute role="admin"><AppShell /></ProtectedRoute>}>
          {/* /admin → straight to Recruiters (no Overview) */}
          <Route path="/admin"                     element={<Navigate to="/admin/recruiters" replace />} />
          <Route path="/admin/recruiters"          element={<AdminRecruiters />} />
          <Route path="/admin/candidates"          element={<AdminCandidates />} />
          <Route path="/admin/candidates/add"      element={<AdminAddCandidate />} />
          <Route path="/admin/candidates/edit/:id" element={<AdminAddCandidate />} />
          <Route path="/admin/clients"             element={<AdminClients />} />
        </Route>

        {/* ── Catch-all ──────────────────────────────────── */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
