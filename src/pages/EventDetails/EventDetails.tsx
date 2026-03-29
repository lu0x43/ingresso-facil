import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { Event } from '../../types';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      const data = await eventService.getById(id);
      setEvent(data);
      setLoading(false);
    };

    loadEvent();
  }, [id]);

  const handleRegister = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      openLogin();
      return;
    }

    navigate(`/register-event/${id}`);
  };

  if (loading || !event) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">{event.title}</h1>

      <p className="mt-2 text-gray-500">{event.description}</p>

      <div className="mt-6">
        <button
          onClick={handleRegister}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Inscrever-se
        </button>
      </div>
    </div>
  );
};

export default EventDetails;