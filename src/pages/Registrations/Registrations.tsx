import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { registrationService } from "../../services/registrationService";
import { Event, EventOption } from "../../types";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  birthDate?: string;
  phone?: string;
  cpf?: string;
};

type LocationState = {
  selectedOption?: EventOption;
};

export const Registrations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const selectedOptionFromState = state?.selectedOption ?? null;

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(
    selectedOptionFromState
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cpf: "",
    birthDate: "",
    phone: "",
  });

  useEffect(() => {
    const loadPage = async () => {
      if (!id) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }

      if (!selectedOptionFromState) {
        navigate(`/event-details/${id}`, { replace: true });
        return;
      }

      try {
        setError(null);

        const storedUserRaw = localStorage.getItem("user");
        if (storedUserRaw) {
          try {
            const storedUser = JSON.parse(storedUserRaw) as StoredUser;

            setFormData((prev) => ({
              ...prev,
              fullName: storedUser.name ?? prev.fullName,
              email: storedUser.email ?? prev.email,
              birthDate: storedUser.birthDate ?? prev.birthDate,
              phone: storedUser.phone ?? prev.phone,
              cpf: storedUser.cpf ?? prev.cpf,
            }));
          } catch {
            localStorage.removeItem("user");
          }
        }

        const eventData = await eventService.getById(id);
        setEvent(eventData);
        setSelectedOption(selectedOptionFromState);
      } catch (err) {
        console.error("Erro ao carregar dados da inscrição:", err);
        setError("Não foi possível carregar os dados da inscrição.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id, navigate, selectedOptionFromState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setSubmitError("Preencha os campos obrigatórios.");
      return;
    }

    if (!id || !selectedOption) {
      setSubmitError("Opção de inscrição inválida.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await registrationService.create({
        eventId: id,
        eventOptionId: selectedOption.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        acceptedTerms: true,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone || undefined,
      });

      navigate(`/payment/${response.registrationId}`, {
        state: response.pixData,
      });
    } catch (err) {
      console.error(err);
      setSubmitError("Não foi possível continuar para o pagamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const selectedPrice = useMemo(() => {
    if (!selectedOption) return null;
    return selectedOption.price;
  }, [selectedOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !event || !selectedOption) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">
            {error || "Dados da inscrição não encontrados."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizar inscrição
          </h1>
          <p className="text-gray-500 mb-6">
            Revise seus dados antes de continuar para o pagamento.
          </p>

          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                placeholder="Digite seu CPF"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                placeholder="Digite seu telefone"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-semibold py-3 rounded-lg transition-colors ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {submitting ? "Processando..." : "Continuar para pagamento"}
            </button>
          </form>
        </div>

        <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>

          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">Data:</span>{" "}
              {formatDate(event.startDate)}
            </p>

            {event.location && (
              <p>
                <span className="font-semibold text-gray-800">Local:</span>{" "}
                {event.location}
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Opção escolhida</p>
              <p className="font-semibold text-gray-900">{selectedOption.name}</p>
            </div>

            {selectedOption.category && (
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="font-medium text-gray-900">
                  {selectedOption.category}
                </p>
              </div>
            )}

            {typeof selectedOption.distanceKm === "number" && (
              <div>
                <p className="text-sm text-gray-500">Percurso</p>
                <p className="font-medium text-gray-900">
                  {selectedOption.distanceKm} km
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Valor da inscrição</p>
            <p className="text-2xl font-bold text-red-600">
              {selectedPrice !== null ? formatPrice(selectedPrice) : "—"}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Registrations;