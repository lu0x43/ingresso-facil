import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home/Home";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyAccount } from "../pages/MyAccount/MyAccount";
import { AdminEditEvent } from "../pages/AdminEditEvent/AdminEditEvent";
import { UserRegister } from "../pages/UserRegister/UserRegister";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/event-details/:id" element={<EventDetails />} />

      <Route path="/minha-conta" element={<MyAccount />} />

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

      <Route path="/admin/events/edit/:id" element={<AdminEditEvent />} />

      <Route path="/cadastro" element={<UserRegister />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
