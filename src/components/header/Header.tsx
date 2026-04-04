import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, Settings, Ticket, LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import LogoRed from "../../assets/icons/icon-corpus-red.svg";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { api } from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccess, showError, showWarning } from "../../lib/toast";

const Header = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, user, login, logout } = useAuth();
  const { isOpen, openLogin, closeModal } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const resetLoginForm = () => {
    setEmail("");
    setPassword("");
    setLoginError(null);
  };

  const handleLogout = () => {
    logout();
    setOpenMenu(false);
    closeModal();
    resetLoginForm();
    showError("Logout realizado com sucesso.");
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setLoginError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError(null);

      const response = await api.post(
        "/auth/login",
        {
          email: email.trim(),
          password,
        },
        {
          showErrorToast: false,
        }
      );

      const { token, user } = response.data;

      login({ token, user });

      resetLoginForm();
      setOpenMenu(false);
      closeModal();

      showSuccess("Login realizado com sucesso.");
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        if (err.response?.status === 401) {
          setLoginError("E-mail ou senha inválidos.");
          return;
        }
      
        if (err.response?.data?.error) {
          setLoginError(err.response.data.error);
          return;
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        closeModal();
        setOpenMenu(false);
      }
    };

    const handleAuthExpired = () => {
      setOpenMenu(false);
      closeModal();
      resetLoginForm();
      showWarning("Sua sessão expirou. Faça login novamente.");
      navigate("/");
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [closeModal, navigate]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 sm:px-10 lg:px-16 h-20 flex items-center justify-between bg-gray-950">
        <Link to="/" className="flex items-center gap-2">
          <img src={LogoRed} alt="Logo" className="h-12" />
        </Link>

        <div className="flex items-center gap-4" ref={wrapperRef}>
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 text-white font-semibold"
                type="button"
              >
                <User size={18} />
                {user.name.split(" ").slice(0, 2).join(" ")}
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow border">
                  <button
                    onClick={() => {
                      navigate("/minha-conta");
                      setOpenMenu(false);
                    }}
                    className="w-full flex flex-row items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    type="button"
                  >
                    <User size={18} />
                    Minha conta
                  </button>

                  <button
                    onClick={() => {
                      navigate("/minhas-inscricoes");
                      setOpenMenu(false);
                    }}
                    className="w-full flex flex-row items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    type="button"
                  >
                    <Ticket size={18} />
                    Minhas inscrições
                  </button>

                  {user.role?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setOpenMenu(false);
                      }}
                      className="w-full flex flex-row items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      type="button"
                    >
                      <Settings size={18} />
                      Painel administrativo
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex flex-row items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    type="button"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  setLoginError(null);
                  openLogin();
                }}
                className="flex items-center gap-2 bg-[#F83B45] text-white px-5 py-2.5 font-bold hover:bg-[#e12f38] transition-all rounded-md"
                type="button"
              >
                <LogIn size={18} />
                Entrar
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow p-5 z-50 border border-gray-200">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Entrar</h2>

                    <button
                      onClick={() => {
                        closeModal();
                        setLoginError(null);
                      }}
                      className="text-gray-400 hover:text-gray-700"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {loginError}
                      </div>
                    )}

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full border px-3 py-2 rounded"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className="w-full border px-3 py-2 rounded"
                    />

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-red-600 text-white py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loginLoading ? "Entrando..." : "Entrar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        resetLoginForm();
                        navigate("/cadastro");
                      }}
                      className="w-full text-sm text-gray-600 hover:text-red-600"
                    >
                      Não tem conta? Cadastre-se
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
