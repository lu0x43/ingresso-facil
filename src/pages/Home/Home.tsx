import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { Event } from "../../types";

export const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError(null);
        const data = await eventService.getAll();
        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        setError("Não foi possível carregar os eventos.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center bg-white p-8 rounded-xl border border-red-100">
          <p className="text-red-600">{err}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Próximos Eventos
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => navigate(`/event-details/${event.id}`)}
            className="bg-white rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition"
          >
            <div className="h-40 bg-red-600 flex items-center justify-center">
              <span className="text-white text-4xl opacity-20">
                {event.title.charAt(0)}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg">{event.title}</h3>

              <p className="text-sm text-gray-500 mt-2">
                {formatDate(event.startDate)}
              </p>

              <p className="text-red-600 font-bold mt-2">
                {formatPrice(event.price)}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/event-details/${event.id}`);
                }}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
              >
                Inscrever-se
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;