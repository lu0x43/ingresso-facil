import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home/Home";
import { Login } from "../pages/Login/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyRegistrations } from "../pages/MyRegistrations/MyRegistrations";
import { MyAccount } from "../pages/MyAccount/MyAccount";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
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

      <Route
        path="/my-registrations"
        element={
          <PrivateRoute>
            <MyRegistrations />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
