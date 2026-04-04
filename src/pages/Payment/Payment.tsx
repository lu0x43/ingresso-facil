import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { showError, showSuccess } from "../../lib/toast";

type PixData = {
  paymentId: string;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
};

export const Payment = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(
    (location.state as PixData | null) ?? null
  );

  useEffect(() => {
    if (!id || status === "APPROVED") return;

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

  const handleRetryPayment = async () => {
    if (!id || retrying) return;

    try {
      setRetrying(true);

      const response = await paymentService.retryByRegistration(id);

      setPixData(response.pixData);
      setStatus("PENDING");
      showSuccess("Novo pagamento gerado com sucesso.");
    } catch (err) {
      console.error("Erro ao regerar pagamento:", err);
      showError("Não foi possível regerar o pagamento.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
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
              status === "APPROVED" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {status}
          </p>
        </div>

        {pixData?.qrCode && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(pixData.qrCode);
              showSuccess("Código copiado!");
            }}
            className="mt-4 text-sm text-red-600 font-medium hover:underline"
          >
            Copiar código "Copia e Cola"
          </button>
        )}

        {(status === "FAILED" || status === "EXPIRED") && (
          <button
            type="button"
            onClick={handleRetryPayment}
            disabled={retrying}
            className={`mt-6 rounded-lg px-5 py-3 font-semibold text-white ${
              retrying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {retrying ? "Gerando..." : "Gerar novo Pix"}
          </button>
        )}

        {status === "APPROVED" && (
          <div className="mt-6 text-green-600 font-semibold">
            Pagamento confirmado! 🎉
          </div>
        )}
      </div>
    </div>
  );
};
