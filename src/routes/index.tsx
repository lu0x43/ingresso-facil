import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home/Home";
import { Login } from "../pages/Login/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyRegistrations } from "../pages/MyRegistrations/MyRegistrations";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/event-details/:id" element={<EventDetails />} />
      <Route path="/register-event/:id" element={<Registrations />} />

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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};