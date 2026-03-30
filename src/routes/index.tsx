import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home/Home";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyAccount } from "../pages/MyAccount/MyAccount";
import { AdminEditEvent } from "../pages/AdminEditEvent/AdminEditEvent";
import { UserRegister } from "../pages/UserRegister/UserRegister";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token) {
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
        path="/admin/events/edit/:id"
        element={
          <AdminRoute>
            <AdminEditEvent />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};