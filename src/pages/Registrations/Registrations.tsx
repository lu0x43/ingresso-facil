import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { registrationService } from "../../services/registrationService";
import { Event, EventOption } from "../../types";
import { showError, showWarning } from "../../lib/toast";

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  birthDate?: string;
  phone?: string;
  cpf?: string;
  gender?: string;
};

type LocationState = {
  selectedOption?: EventOption;
};

const genderOptions = [
  { label: "Masculino", value: "MALE" },
  { label: "Feminino", value: "FEMALE" },
  // { label: "Outro", value: "OTHER" },
];

const shirtSizeOptions = [
  { label: "P (Adulto)", value: "P" },
  { label: "M (Adulto)", value: "M" },
  { label: "G (Adulto)", value: "G" },
  { label: "GG (Adulto)", value: "GG" },
  { label: "EG (Adulto)", value: "EG" },
  { label: "4 (Infantil)", value: "KIDS_4" },
  { label: "6 (Infantil)", value: "KIDS_6" },
  { label: "8 (Infantil)", value: "KIDS_8" },
  { label: "10 (Infantil)", value: "KIDS_10" },
  { label: "12 (Infantil)", value: "KIDS_12" },
  { label: "14 (Infantil)", value: "KIDS_14" },
  { label: "16 (Infantil)", value: "KIDS_16" },
];

export const Registrations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const selectedOptionFromState = state?.selectedOption ?? null;

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);

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
    gender: "",
    shirtSize: "",
  });

  useEffect(() => {
    const loadPage = async () => {
      if (!id) {
        setError("Evento não encontrado.");
        setLoading(false);
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
              gender: storedUser.gender ?? prev.gender,
            }));
          } catch {
            localStorage.removeItem("user");
          }
        }

        const eventData = await eventService.getById(id);
        setEvent(eventData);

        const eventOptions = eventData.options ?? [];

        if (eventOptions.length === 0) {
          setError("Este evento não possui opções de inscrição disponíveis.");
          return;
        }

        if (selectedOptionFromState) {
          const matchedOption = eventOptions.find(
            (option) => option.id === selectedOptionFromState.id
          );

          if (matchedOption) {
            setSelectedOption(matchedOption);
          } else {
            setSelectedOption(eventOptions[0]);
          }
        } else {
          setSelectedOption(eventOptions[0]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da inscrição:", err);
        setError("Não foi possível carregar os dados da inscrição.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id, selectedOptionFromState]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      setSubmitError("Preencha nome e e-mail.");
      return;
    }

    if (!formData.gender) {
      setSubmitError("Selecione o sexo.");
      return;
    }

    if (!formData.shirtSize) {
      setSubmitError("Selecione o tamanho da camisa.");
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
        cpf: formData.cpf.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        shirtSize: formData.shirtSize || undefined,
      });

      if (!response?.registrationId) {
        setSubmitError("Não foi possível iniciar o pagamento.");
        showWarning("Não foi possível iniciar o pagamento.");
        return;
      }

      navigate(`/payment/${response.registrationId}`, {
        state: response.pixData,
      });
    } catch (err) {
      console.error("Erro ao criar inscrição:", err);
      showError("Não foi possível criar a inscrição.");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 bg-white"
                >
                  <option value="">Selecione</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho da camisa *
                </label>
                <select
                  name="shirtSize"
                  value={formData.shirtSize}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 bg-white"
                >
                  <option value="">Selecione</option>
                  {shirtSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
              <p className="font-semibold text-gray-900">
                {selectedOption.name}
              </p>
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
