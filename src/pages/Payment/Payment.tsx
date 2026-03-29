import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";

export const Payment = () => {
  const { id } = useParams<{ id: string }>();

  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStatus = async () => {
      try {
        const res = await paymentService.getByRegistration(id);
        setStatus(res.status);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Aguardando pagamento
        </h1>

        <p className="text-gray-600">
          Após o pagamento, a confirmação será automática.
        </p>

        <div className="mt-6">
          <p className="text-gray-500">Status:</p>

          <p
            className={`text-lg font-semibold ${
              status === "APPROVED"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {status}
          </p>
        </div>

        {status === "APPROVED" && (
          <div className="mt-6 text-green-600 font-semibold">
            Pagamento confirmado! 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;