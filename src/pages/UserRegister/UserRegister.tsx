import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import { showSuccess, showError, showWarning } from "../../lib/toast";

export const UserRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      setFormData((prev) => ({
        ...prev,
        cpf: formatCpf(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (submitting) return;
  
    if (!formData.name.trim()) {
      showWarning("Nome é obrigatório.");
      return;
    }
  
    if (!formData.email.trim()) {
      showWarning("E-mail é obrigatório.");
      return;
    }
  
    if (!formData.password.trim()) {
      showWarning("Senha é obrigatória.");
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      showWarning("As senhas não conferem.");
      return;
    }
  
    const cpfRaw = formData.cpf.replace(/\D/g, "");
  
    if (cpfRaw.length !== 11) {
      showError("CPF inválido.");
      return;
    }
  
    try {
      setSubmitting(true);
  
      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        cpf: cpfRaw,
      });
  
      showSuccess("Conta criada com sucesso!");
  
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl border p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Criar conta</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome completo"
            className="w-full border px-4 py-3 rounded"
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            className="w-full border px-4 py-3 rounded"
          />

          <input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="CPF"
            className="w-full border px-4 py-3 rounded"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Senha"
            className="w-full border px-4 py-3 rounded"
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar senha"
            className="w-full border px-4 py-3 rounded"
          />

          <button
            disabled={submitting}
            className="w-full bg-red-600 text-white py-3 rounded"
          >
            {submitting ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default UserRegister;
