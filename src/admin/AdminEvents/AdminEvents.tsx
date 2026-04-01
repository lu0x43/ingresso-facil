import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { Event } from "../../types";

export const AdminEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError(null);
        const data = await eventService.getAll();
        setEvents(data);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
        setError("Não foi possível carregar os eventos.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm(
      "Deseja realmente remover este evento?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      setError(null);

      await eventService.delete(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Erro ao remover evento:", err);
      setError("Não foi possível remover o evento.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Eventos</h2>
          <p className="text-gray-500 mt-2">
            Gerencie os eventos cadastrados no sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/eventos/novo")}
          className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          Novo evento
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600">Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-800">Data:</span>{" "}
                      {formatDate(event.startDate)}
                      {event.endDate
                        ? ` até ${formatDate(event.endDate)}`
                        : ""}
                    </p>

                    {event.location && (
                      <p>
                        <span className="font-semibold text-gray-800">
                          Local:
                        </span>{" "}
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/eventos/${event.id}/participantes`)
                    }
                    className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Participantes
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/event-details/${event.id}`)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Ver evento
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/admin/eventos/editar/${event.id}`)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      deletingId === event.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-red-600 hover:bg-gray-200"
                    }`}
                  >
                    {deletingId === event.id ? "Removendo..." : "Remover"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;