import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { Event, EventOption } from "../../types";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const [event, setEvent] = useState<Event | null>(null);
  const [options, setOptions] = useState<EventOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser) as StoredUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const loadEventDetails = async () => {
      if (!id) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const [eventData, eventOptions] = await Promise.all([
          eventService.getById(id),
          eventService.getOptionsByEvent(id),
        ]);

        setEvent(eventData);
        setOptions(eventOptions);

        if (eventOptions.length > 0) {
          setSelectedOptionId(eventOptions[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do evento:", err);
        setError("Não foi possível carregar os detalhes do evento.");
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [id]);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedOptionId) || null,
    [options, selectedOptionId]
  );

  const startingPrice = useMemo(() => {
    if (options.length === 0) return null;
    return Math.min(...options.map((option) => option.price));
  }, [options]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleRegister = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      openLogin();
      return;
    }

    if (!selectedOption) {
      alert("Selecione uma opção de inscrição.");
      return;
    }

    navigate(`/register-event/${id}`, {
      state: {
        selectedOption,
      },
    });
  };

  const handleEditEvent = () => {
    navigate(`/admin/events/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">
            {error || "Evento não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-72 flex items-center justify-center bg-red-600">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white text-6xl font-bold opacity-20">
              {event.title?.charAt(0).toUpperCase() || "E"}
            </span>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>

                {isAdmin && (
                  <button
                    onClick={handleEditEvent}
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Editar evento
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-500 mb-1">Data</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(event.startDate)}
                    {event.endDate ? ` até ${formatDate(event.endDate)}` : ""}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-500 mb-1">Horário</p>
                  <p className="font-semibold text-gray-900">
                    {formatTime(event.startDate)}
                    {event.endDate ? ` às ${formatTime(event.endDate)}` : ""}
                  </p>
                </div>

                {event.location && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                    <p className="text-gray-500 mb-1">Local</p>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Sobre o evento
                </h2>

                <p className="text-gray-700 leading-7">
                  {event.description || "Descrição do evento não disponível."}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Opções de inscrição
                </h2>

                {options.length === 0 ? (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
                    Nenhuma opção disponível para este evento no momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {options.map((option) => {
                      const isSelected = selectedOptionId === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedOptionId(option.id)}
                          className={`w-full text-left rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-red-600 bg-red-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-red-300"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {option.name}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                                {option.category && (
                                  <span className="px-2 py-1 rounded-md bg-gray-100">
                                    {option.category}
                                  </span>
                                )}

                                {typeof option.distanceKm === "number" && (
                                  <span className="px-2 py-1 rounded-md bg-gray-100">
                                    {option.distanceKm} km
                                  </span>
                                )}

                                {typeof option.maxSlots === "number" && (
                                  <span className="px-2 py-1 rounded-md bg-gray-100">
                                    {option.maxSlots} vagas
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-500">Valor</p>
                              <p className="text-lg font-bold text-red-600">
                                {formatPrice(option.price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-fit">
              <p className="text-sm text-gray-500 mb-2">Valor inicial</p>
              <p className="text-3xl font-bold text-red-600">
                {startingPrice !== null
                  ? `A partir de ${formatPrice(startingPrice)}`
                  : "Consulte"}
              </p>

              {selectedOption && (
                <div className="mt-6 rounded-xl border border-red-100 bg-white p-4">
                  <p className="text-sm text-gray-500 mb-1">Selecionado</p>
                  <p className="font-semibold text-gray-900">
                    {selectedOption.name}
                  </p>
                  <p className="text-red-600 font-bold mt-2">
                    {formatPrice(selectedOption.price)}
                  </p>
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={options.length === 0}
                className={`mt-6 w-full font-semibold py-3 rounded-lg transition-colors ${
                  options.length === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                type="button"
              >
                Inscrever-se
              </button>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;