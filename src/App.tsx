import { AppRoutes } from "./routes";
import { Header } from "./components";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* todo Aqui adicionar um Footer no futuro */}
    </div>
  );
}

export default App;
