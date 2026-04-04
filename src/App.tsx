import { AppRoutes } from "./routes";
import { Header } from "./components";
import { Toaster } from "react-hot-toast";

import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* todo Aqui adicionar um Footer no futuro */}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#1f2937", // cinza escuro (tailwind gray-800)
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
