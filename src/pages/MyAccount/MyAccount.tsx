import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-950 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
          <p className="text-gray-300 mt-1">
            Veja seus dados de acesso cadastrados.
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nome</p>
            <div className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">
              {user.name}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">E-mail</p>
            <div className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">
              {user.email}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Perfil</p>
            <div className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-900">
              { user.role === "admin" ? "Administrador" : "Usuário" }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;