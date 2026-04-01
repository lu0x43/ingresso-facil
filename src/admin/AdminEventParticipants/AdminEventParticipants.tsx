import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { EventParticipant } from "../../types";

type RouteParams = {
  eventId?: string;
};

function formatCpf(cpf: string) {
  const digits = (cpf || "").replace(/\D/g, "");

  if (digits.length !== 11) return cpf || "-";

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDate(date: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString("pt-BR");
}

function normalizePaymentStatus(status: string) {
  const value = (status || "").trim().toLowerCase();

  if (value === "approved" || value === "paid" || value === "pago") {
    return "Pago";
  }

  if (value === "pending" || value === "pendente") {
    return "Pendente";
  }

  if (value === "failed" || value === "falhou") {
    return "Falhou";
  }

  return status || "-";
}

export default function AdminEventParticipants() {
  const { eventId } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadParticipants = async () => {
      if (!eventId) {
        setError("ID do evento não informado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await adminService.getEventParticipants(eventId);
        setParticipants(data);
      } catch (err: unknown) {
        console.error("Erro ao carregar participantes:", err);

        const apiError =
          (err instanceof Error && err.message) ||
          "Não foi possível carregar os participantes.";

        setError(apiError);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [eventId]);

  const filteredParticipants = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return participants;

    return participants.filter((participant) => {
      const fullName = participant.fullName?.toLowerCase() || "";
      const email = participant.email?.toLowerCase() || "";
      const cpf = participant.cpf?.replace(/\D/g, "") || "";
      const category = participant.categoryName?.toLowerCase() || "";
      const searchDigits = term.replace(/\D/g, "");

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        category.includes(term) ||
        (searchDigits && cpf.includes(searchDigits))
      );
    });
  }, [participants, search]);

  const handleExportPdf = async () => {
    if (!eventId) return;

    try {
      setExportingPdf(true);
      await adminService.exportEventParticipantsPdf(eventId);
    } catch (err: unknown) {
      console.error("Erro ao exportar PDF:", err);

      const apiError =
        (err instanceof Error && err.message) ||
        "Não foi possível exportar o PDF.";

      setError(apiError);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Voltar
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Participantes do evento
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Visualize os inscritos e exporte a lista em PDF.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF ou categoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-gray-500 sm:w-80"
          />

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf || loading || !!error}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingPdf ? "Exportando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Total encontrado: <strong>{filteredParticipants.length}</strong>
        </span>

        <span>
          Total geral: <strong>{participants.length}</strong>
        </span>
      </div>

      {loading && (
        <div className="rounded-md border bg-white p-6 text-sm text-gray-600">
          Carregando participantes...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredParticipants.length === 0 && (
        <div className="rounded-md border bg-white p-6 text-sm text-gray-600">
          Nenhum participante encontrado.
        </div>
      )}

      {!loading && !error && filteredParticipants.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    E-mail
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    CPF
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    Categoria
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    Pagamento
                  </th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">
                    Data da inscrição
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.registrationId} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-3 text-gray-900">
                      {participant.fullName || "-"}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-700">
                      {participant.email || "-"}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-700">
                      {formatCpf(participant.cpf)}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-700">
                      {participant.categoryName || "-"}
                    </td>
                    <td className="border-b px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          normalizePaymentStatus(participant.paymentStatus) === "Pago"
                            ? "bg-green-100 text-green-700"
                            : normalizePaymentStatus(participant.paymentStatus) ===
                              "Pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {normalizePaymentStatus(participant.paymentStatus)}
                      </span>
                    </td>
                    <td className="border-b px-4 py-3 text-gray-700">
                      {formatDate(participant.registrationCreatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}