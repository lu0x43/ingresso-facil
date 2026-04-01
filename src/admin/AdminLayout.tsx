import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-fit">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie eventos e acompanhe a operação.
              </p>
            </div>

            <nav className="space-y-2">
              <Link
                to="/admin"
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/admin")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/admin/eventos"
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/admin/eventos")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Eventos
              </Link>

              <Link
                to="/admin/eventos/novo"
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive("/admin/eventos/novo")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Criar evento
              </Link>
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Voltar ao site
              </button>
            </div>
          </aside>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
};

export default AdminLayout;