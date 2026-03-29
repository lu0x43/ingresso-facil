import { createContext, useContext, useState } from "react";

type AuthMode = "login" | "register";

type AuthModalContextType = {
  isOpen: boolean;
  mode: AuthMode;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export const AuthModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openLogin = () => {
    setMode("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setMode("register");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, mode, openLogin, openRegister, closeModal }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }

  return context;
};