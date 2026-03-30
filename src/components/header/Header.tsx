import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LogoRed from "../../assets/icons/icon-corpus-red.svg";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { api } from "../../api/api";

const Header = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const { isOpen, mode, openLogin, closeModal } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginWrapperRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    closeModal();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      setEmail("");
      setPassword("");
      closeModal();
    } catch (err: unknown) {
      console.error(err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const error = err as { response?: { status?: number } };

        if (error.response?.status === 401) {
          alert("Credenciais inválidas.");
          return;
        }
      }

      alert("Erro ao fazer login.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loginWrapperRef.current &&
        !loginWrapperRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between bg-gray-950">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={LogoRed}
            alt="Logo Ingresso Fácil"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          {token && user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 text-white font-semibold"
              >
                <User size={18} />
                {user.name.split(" ")[0]}
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                  <button
                    onClick={() => {
                      navigate("/minha-conta");
                      setOpenMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Minha conta
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={loginWrapperRef}>
              <button
                onClick={openLogin}
                className="flex items-center gap-2 bg-[#F83B45] text-white px-5 py-2.5 font-bold hover:bg-[#e12f38] transition-all rounded-md"
                type="button"
              >
                <LogIn size={18} />
                Entrar
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      {mode === "login" ? "Entrar" : "Criar conta"}
                    </h2>

                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-700"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Seu e-mail"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Sua senha"
                    />

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[#F83B45] px-4 py-2.5 text-white font-semibold hover:bg-[#e12f38] transition-colors"
                    >
                      Entrar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        navigate("/cadastro");
                      }}
                      className="w-full text-sm text-gray-600 hover:text-[#F83B45]"
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
