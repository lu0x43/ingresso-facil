import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

export const UserRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    if (!formData.email.trim()) {
      setError("E-mail é obrigatório.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Senha é obrigatória.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Conta criada com sucesso. Agora você já pode entrar.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: unknown) {
      console.error(err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = err as {
          response?: {
            status?: number;
            data?: { error?: string };
          };
        };

        if (errorResponse.response?.data?.error) {
          setError(errorResponse.response.data.error);
          return;
        }

        if (errorResponse.response?.status === 409) {
          setError("Este e-mail já está cadastrado.");
          return;
        }
      }

      setError("Não foi possível criar sua conta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 mt-2">
            Cadastre-se para se inscrever nos eventos.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
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
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Crie uma senha"
            />
            <p className="mt-2 text-xs text-gray-500">
              Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Repita sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-lg py-3 font-semibold text-white transition-colors ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting ? "Criando conta..." : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-sm text-gray-600 hover:text-red-600"
          >
            Voltar para o início
          </button>
        </form>
      </div>
    </section>
  );
};

export default UserRegister;