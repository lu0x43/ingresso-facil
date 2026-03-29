import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { Event } from '../../types';

export const Registrations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    birthDate: '',
    phone: '',
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Evento não encontrado.');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await eventService.getById(id);
        setEvent(data);
      } catch (err) {
        console.error('Erro ao carregar evento para inscrição:', err);
        setError('Não foi possível carregar o evento.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim()
    ) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (!id) return;

    try {
      const response = await registrationService.create({
        eventId: id,
        eventOptionId: id, // ⚠️ TEMP (ajustar quando tiver opções)
        fullName: formData.fullName,
        email: formData.email,
        acceptedTerms: true,
        birthDate: formData.birthDate || undefined,
        phone: formData.phone || undefined,
      });

      navigate(`/payment/${response.registrationId}`, {
        state: response.pixData,
      });

    } catch (err) {
      console.error(err);
      alert('Erro ao criar inscrição.');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR');

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">
            {error || 'Evento não encontrado.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Inscrição no evento
          </h1>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Confirmar inscrição
            </button>
          </form>
        </div>

        <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>

          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">Data:</span>{' '}
              {formatDate(event.startDate)}
            </p>

            {event.location && (
              <p>
                <span className="font-semibold text-gray-800">Local:</span>{' '}
                {event.location}
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Valor</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPrice(event.price)}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Registrations;