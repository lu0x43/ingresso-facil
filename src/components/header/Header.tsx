import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LogoRed from "../../assets/icons/icon-corpus-red.svg";

const Header = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoginOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Preencha e-mail e senha.");
      return;
    }

    // TODO: trocar depois pela chamada real da API
    const fakeToken = "token-fake";

    localStorage.setItem("token", fakeToken);
    setToken(fakeToken);

    setEmail("");
    setPassword("");
    setIsLoginOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loginWrapperRef.current &&
        !loginWrapperRef.current.contains(event.target as Node)
      ) {
        setIsLoginOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          {token ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-red-400 transition-colors"
                type="button"
              >
                <User size={18} />
                Minha Conta
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Sair"
                type="button"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="relative" ref={loginWrapperRef}>
              <div className="flex items-center gap-4">
                <button
                  
                  className="flex items-center gap-2 bg- border border-[#e12f38] text-[#e12f38] px-5 py-2.5 font-bold hover:bg-[#F83B45] cursor-pointer transition-all rounded-md"
                  type="button"
                >
                  <LogIn size={18} />
                  Cadastre-se
                </button>

                <button
                  onClick={() => setIsLoginOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-[#e12f38] text-white px-5 py-2.5 font-bold hover:bg-[#F83B45] cursor-pointer transition-all rounded-md"
                  type="button"
                >
                  <LogIn size={18} />
                  Entrar
                </button>
              </div>

              {isLoginOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Login</h2>

                    <button
                      onClick={() => setIsLoginOpen(false)}
                      className="text-gray-400 hover:text-gray-700"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        E-mail
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-500"
                        placeholder="seuemail@exemplo.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Senha
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-500"
                        placeholder="********"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[#F83B45] px-4 py-2.5 text-white font-semibold hover:bg-[#e12f38] cursor-pointer transition-colors"
                    >
                      Entrar
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
