import { Link } from "react-router-dom";

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Admin</h2>
        <p className="text-gray-500 mt-2">
          Acesse rapidamente as principais áreas de gerenciamento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/eventos"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-gray-900">Gerenciar eventos</h3>
          <p className="text-gray-500 mt-2">
            Veja a lista completa de eventos, edite e acompanhe a estrutura.
          </p>
        </Link>

        <Link
          to="/admin/eventos/novo"
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-gray-900">Criar novo evento</h3>
          <p className="text-gray-500 mt-2">
            Cadastre um novo evento e depois configure as opções de inscrição.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;