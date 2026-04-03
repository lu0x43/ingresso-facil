import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { Home } from "../pages/Home/Home";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyAccount } from "../pages/MyAccount/MyAccount";
import { MyRegistrations } from "../pages/MyRegistrations/MyRegistrations";
import { UserRegister } from "../pages/UserRegister/UserRegister";

import { AdminLayout } from "../admin/AdminLayout";
import { AdminDashboard } from "../admin/AdminDashboard/AdminDashboard";
import { AdminEvents } from "../admin/AdminEvents/AdminEvents";
import { AdminCreateEvent } from "../admin/AdminCreateEvent/AdminCreateEvent";
import { AdminEditEvent } from "../admin/AdminEditEvent/AdminEditEvent";
import AdminEventParticipants from "../admin/AdminEventParticipants/AdminEventParticipants";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/event-details/:id" element={<EventDetails />} />
      <Route path="/cadastro" element={<UserRegister />} />

      {/* autenticadas */}
      <Route
        path="/minha-conta"
        element={
          <PrivateRoute>
            <MyAccount />
          </PrivateRoute>
        }
      />

      <Route
        path="/minhas-inscricoes"
        element={
          <PrivateRoute>
            <MyRegistrations />
          </PrivateRoute>
        }
      />

      <Route
        path="/register-event/:id"
        element={
          <PrivateRoute>
            <Registrations />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="eventos" element={<AdminEvents />} />
        <Route path="eventos/novo" element={<AdminCreateEvent />} />
        <Route path="eventos/editar/:id" element={<AdminEditEvent />} />
        <Route
          path="eventos/:eventId/participantes"
          element={<AdminEventParticipants />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};