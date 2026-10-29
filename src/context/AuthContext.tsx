
// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { login as apiLogin, getMe } from "@/services/adminService";

// interface Admin {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// }

// interface AuthCtx {
//   admin: Admin | null;
//   token: string | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signOut: () => void;
// }

// const AuthContext = createContext<AuthCtx>({} as AuthCtx);

// export function AuthProvider({ children }: { children: ReactNode }) {

//   const [admin, setAdmin] = useState<Admin | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const saved = localStorage.getItem("admin_token");

//     if (saved) {
//       setToken(saved);

//       getMe()
//         .then((d) => setAdmin(d.admin))
//         .catch(() => {
//           localStorage.removeItem("admin_token");
//         })
//         .finally(() => setLoading(false));

//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const signIn = async (email: string, password: string) => {

//     const data = await apiLogin(email, password);

//     localStorage.setItem("admin_token", data.token);

//     setToken(data.token);
//     setAdmin(data.admin);
//   };

//   const signOut = () => {

//     localStorage.removeItem("admin_token");

//     setToken(null);
//     setAdmin(null);
//   };

//   return (
//     <AuthContext.Provider value={{ admin, token, loading, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);



//testing


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, getMe } from "@/services/crmService";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthCtx {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("crm_token");

    if (saved) {
      setToken(saved);

      getMe()
        .then((d) => setAdmin(d.admin))
        .catch(() => {
          localStorage.removeItem("crm_token");
        })
        .finally(() => setLoading(false));

    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {

    const data = await apiLogin(email, password);

    localStorage.setItem("crm_token", data.token);

    setToken(data.token);
    setAdmin(data.admin);
  };

  const signOut = () => {

    localStorage.removeItem("crm_token");

    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);