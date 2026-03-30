import { useEffect, useState } from "react";
import { usersService, MyRegistration } from "../../services/usersService";

export const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setError(null);
        const data = await usersService.getMyRegistrations();
        setRegistrations(data);
      } catch (err) {
        console.error("Erro ao carregar inscrições:", err);
        setError("Não foi possível carregar suas inscrições.");
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pago";
      case "PENDING_PAYMENT":
        return "Aguardando pagamento";
      case "CANCELLED":
        return "Cancelado";
      case "EXPIRED":
        return "Expirado";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING_PAYMENT":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CANCELLED":
      case "EXPIRED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas inscrições</h1>
        <p className="text-gray-500 mt-2">
          Acompanhe seus eventos e o status de cada inscrição.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600">Você ainda não possui inscrições.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {registrations.map((registration) => (
            <div
              key={registration.registrationId}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {registration.eventTitle}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-800">Data:</span>{" "}
                      {formatDate(registration.eventDate)}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-800">Opção:</span>{" "}
                      {registration.option.name}
                    </p>

                    {registration.option.category && (
                      <p>
                        <span className="font-semibold text-gray-800">
                          Categoria:
                        </span>{" "}
                        {registration.option.category}
                      </p>
                    )}

                    {typeof registration.option.distanceKm === "number" && (
                      <p>
                        <span className="font-semibold text-gray-800">
                          Distância:
                        </span>{" "}
                        {registration.option.distanceKm} km
                      </p>
                    )}

                    <p>
                      <span className="font-semibold text-gray-800">Valor:</span>{" "}
                      {formatPrice(registration.option.price)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(
                      registration.status
                    )}`}
                  >
                    {getStatusLabel(registration.status)}
                  </span>

                  <p className="text-xs text-gray-500">
                    Inscrição feita em {formatDate(registration.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyRegistrations;