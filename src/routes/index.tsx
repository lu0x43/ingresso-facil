import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home/Home";
import { Login } from "../pages/Login/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventDetails } from "../pages/EventDetails/EventDetails";
import { Registrations } from "../pages/Registrations/Registrations";
import { MyRegistrations } from "../pages/MyRegistrations/MyRegistrantions";

// ... resto do código das rotas

// Função simples para  checar se o usuário está logado
// Se não tiver token no localStorage, o usuário é mandado pro Login
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Raiz: Mostra a Home por padrão */}
        <Route path="/" element={<Home />} />

        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/event-details/:id" element={<EventDetails />} />
        <Route path="/register-event/:id" element={<Registrations />} />

        {/* Rotas Protegidas */}
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

        {/* 404 - Rota Não Encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
