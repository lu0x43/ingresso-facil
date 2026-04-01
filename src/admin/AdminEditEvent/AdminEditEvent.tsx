import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { EventOption } from "../../types";

type EventFormData = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
};

type OptionFormData = {
  id?: string;
  name: string;
  category: string;
  distanceKm: string;
  price: string;
  maxSlots: string;
};

export const AdminEditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingOptionId, setSavingOptionId] = useState<string | null>(null);
  const [creatingOption, setCreatingOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  const [options, setOptions] = useState<EventOption[]>([]);
  const [optionForms, setOptionForms] = useState<Record<string, OptionFormData>>(
    {}
  );

  const [newOption, setNewOption] = useState<OptionFormData>({
    name: "",
    category: "",
    distanceKm: "",
    price: "",
    maxSlots: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const eventData = await eventService.getById(id);

        setEventForm({
          title: eventData.title ?? "",
          description: eventData.description ?? "",
          location: eventData.location ?? "",
          startDate: toInputDateTime(eventData.startDate),
          endDate: toInputDateTime(eventData.endDate),
        });

        const loadedOptions = eventData.options ?? [];
        setOptions(loadedOptions);

        const mappedForms: Record<string, OptionFormData> = {};
        loadedOptions.forEach((option) => {
          mappedForms[option.id] = {
            id: option.id,
            name: option.name ?? "",
            category: option.category ?? "",
            distanceKm:
              typeof option.distanceKm === "number"
                ? String(option.distanceKm)
                : "",
            price: String(option.price ?? ""),
            maxSlots:
              typeof option.maxSlots === "number" ? String(option.maxSlots) : "",
          };
        });

        setOptionForms(mappedForms);
      } catch (err) {
        console.error("Erro ao carregar evento para edição:", err);
        setError("Não foi possível carregar os dados do evento.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const toInputDateTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const setFlashMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (
      !eventForm.title.trim() ||
      !eventForm.startDate.trim() ||
      !eventForm.endDate.trim()
    ) {
      setError("Preencha título, data inicial e data final.");
      return;
    }

    try {
      setSavingEvent(true);
      setError(null);

      await eventService.update(id, {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        location: eventForm.location.trim() || null,
        startDate: new Date(eventForm.startDate).toISOString(),
        endDate: new Date(eventForm.endDate).toISOString(),
      });

      setFlashMessage("Evento atualizado com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      setError("Não foi possível atualizar o evento.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleOptionChange = (
    optionId: string,
    field: keyof OptionFormData,
    value: string
  ) => {
    setOptionForms((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        [field]: value,
      },
    }));
  };

  const handleSaveOption = async (optionId: string) => {
    const form = optionForms[optionId];
    if (!form) return;

    try {
      setSavingOptionId(optionId);
      setError(null);

      await eventService.updateOption(optionId, {
        name: form.name.trim(),
        category: form.category.trim(),
        distanceKm: Number(form.distanceKm),
        price: Number(form.price),
        maxSlots: Number(form.maxSlots),
      });

      setOptions((prev) =>
        prev.map((option) =>
          option.id === optionId
            ? {
                ...option,
                name: form.name.trim(),
                category: form.category.trim(),
                distanceKm: Number(form.distanceKm),
                price: Number(form.price),
                maxSlots: Number(form.maxSlots),
              }
            : option
        )
      );

      setFlashMessage("Opção atualizada com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar opção:", err);
      setError("Não foi possível atualizar a opção.");
    } finally {
      setSavingOptionId(null);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm("Deseja realmente remover esta opção?")) return;

    try {
      setDeletingOptionId(optionId);
      setError(null);

      await eventService.deleteOption(optionId);

      setOptions((prev) => prev.filter((option) => option.id !== optionId));
      setOptionForms((prev) => {
        const copy = { ...prev };
        delete copy[optionId];
        return copy;
      });

      setFlashMessage("Opção removida com sucesso.");
    } catch (err) {
      console.error("Erro ao remover opção:", err);
      setError("Não foi possível remover a opção.");
    } finally {
      setDeletingOptionId(null);
    }
  };

  const handleNewOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewOption((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setCreatingOption(true);
      setError(null);

      const created = await eventService.createOption({
        eventId: id,
        name: newOption.name.trim(),
        category: newOption.category.trim(),
        distanceKm: Number(newOption.distanceKm),
        price: Number(newOption.price),
        maxSlots: Number(newOption.maxSlots),
      });

      const refreshedEvent = await eventService.getById(id);
      const refreshedOptions = refreshedEvent.options ?? [];
      setOptions(refreshedOptions);

      const mappedForms: Record<string, OptionFormData> = {};
      refreshedOptions.forEach((option) => {
        mappedForms[option.id] = {
          id: option.id,
          name: option.name ?? "",
          category: option.category ?? "",
          distanceKm:
            typeof option.distanceKm === "number"
              ? String(option.distanceKm)
              : "",
          price: String(option.price ?? ""),
          maxSlots:
            typeof option.maxSlots === "number" ? String(option.maxSlots) : "",
        };
      });
      setOptionForms(mappedForms);

      setNewOption({
        name: "",
        category: "",
        distanceKm: "",
        price: "",
        maxSlots: "",
      });

      setFlashMessage(created?.message ?? "Opção criada com sucesso.");
    } catch (err) {
      console.error("Erro ao criar opção:", err);
      setError("Não foi possível criar a opção.");
    } finally {
      setCreatingOption(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error && !id) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar evento</h1>
          <p className="text-gray-500 mt-1">
            Atualize os dados do evento e gerencie as opções de inscrição.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/event-details/${id}`)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Voltar ao evento
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <form
          onSubmit={handleSaveEvent}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Dados do evento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={eventForm.title}
                onChange={handleEventChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data inicial *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={eventForm.startDate}
                onChange={handleEventChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data final *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={eventForm.endDate}
                onChange={handleEventChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local
              </label>
              <input
                type="text"
                name="location"
                value={eventForm.location}
                onChange={handleEventChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleEventChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingEvent}
            className={`mt-6 rounded-lg px-5 py-3 font-semibold text-white ${
              savingEvent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {savingEvent ? "Salvando..." : "Salvar evento"}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Opções de inscrição
          </h2>

          <div className="space-y-6">
            {options.length === 0 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
                Nenhuma opção cadastrada para este evento.
              </div>
            ) : (
              options.map((option) => {
                const form = optionForms[option.id];
                if (!form) return null;

                return (
                  <div
                    key={option.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            handleOptionChange(option.id, "name", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria
                        </label>
                        <input
                          type="text"
                          value={form.category}
                          onChange={(e) =>
                            handleOptionChange(
                              option.id,
                              "category",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distância (km)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.distanceKm}
                          onChange={(e) =>
                            handleOptionChange(
                              option.id,
                              "distanceKm",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) =>
                            handleOptionChange(option.id, "price", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vagas
                        </label>
                        <input
                          type="number"
                          value={form.maxSlots}
                          onChange={(e) =>
                            handleOptionChange(
                              option.id,
                              "maxSlots",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSaveOption(option.id)}
                        disabled={savingOptionId === option.id}
                        className={`rounded-lg px-4 py-2 font-semibold text-white ${
                          savingOptionId === option.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {savingOptionId === option.id
                          ? "Salvando..."
                          : "Salvar opção"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                        disabled={deletingOptionId === option.id}
                        className={`rounded-lg px-4 py-2 font-semibold ${
                          deletingOptionId === option.id
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gray-100 text-red-600 hover:bg-gray-200"
                        }`}
                      >
                        {deletingOptionId === option.id
                          ? "Removendo..."
                          : "Remover opção"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleCreateOption} className="mt-10 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Nova opção
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={newOption.name}
                  onChange={handleNewOptionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  name="category"
                  value={newOption.category}
                  onChange={handleNewOptionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distância (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="distanceKm"
                  value={newOption.distanceKm}
                  onChange={handleNewOptionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={newOption.price}
                  onChange={handleNewOptionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vagas
                </label>
                <input
                  type="number"
                  name="maxSlots"
                  value={newOption.maxSlots}
                  onChange={handleNewOptionChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingOption}
              className={`mt-6 rounded-lg px-5 py-3 font-semibold text-white ${
                creatingOption
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {creatingOption ? "Criando..." : "Adicionar opção"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminEditEvent;