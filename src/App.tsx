import { AppRoutes } from "./routes"; // Importa o arquivo de rotas que você criou
import "./App.css";
function App() {
  // Agora o App apenas renderiza as rotas
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;
