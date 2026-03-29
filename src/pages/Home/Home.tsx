import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { Event } from "../../types";

export const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [err, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.getAll(); // Chamada limpa pelo service
        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        setError(`Não foi possível carregar os eventos. ${err || "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Próximas Corridas e Eventos
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Escolha o seu desafio e inscreva-se agora mesmo!
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-500">
              Nenhum evento encontrado no momento.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/event-details/${event.id}`)}
            >
              <div className="h-48 bg-blue-600 flex items-center justify-center">
                {/* Aqui você pode colocar uma imagem no futuro */}
                <span className="text-white text-5xl font-bold opacity-20">
                  {event.title.substring(0, 1)}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>

                <div className="mt-4 space-y-2">
                  <p className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {new Date(event.startDate).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="flex items-center text-lg font-bold text-blue-700">
                    <span className="mr-2 text-sm font-normal text-gray-500 italic">
                      a partir de
                    </span>
                    R$ {event.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/register-event/${event.id}`);
                  }}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Inscrever-se
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
