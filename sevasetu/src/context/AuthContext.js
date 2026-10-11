/* =========================================================
   AUTH CONTEXT
   ---------------------------------------------------------
   Holds the logged-in user (donor, NGO or admin) for the
   whole app. On load it checks for a saved token and asks
   the backend who that belongs to, so refreshing the page
   keeps you signed in without storing the account itself in
   the browser any more.
   ========================================================= */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  apiAdminLogin,
  apiLogin,
  apiMe,
  apiRegister,
  clearToken,
  normalizeUser,
  setToken,
} from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setAuthLoading(true);

    try {
      const res = await apiMe();
      setUser(normalizeUser(res.data));
    } catch (error) {
      /* No token, expired token, or server unreachable - either
         way there is no valid session, so just sign out quietly. */
      clearToken();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /* ================= DONOR / NGO LOGIN ================= */

  const login = async ({ email, password, role }) => {
    try {
      const res = await apiLogin(email, password);
      const { token, user: rawUser } = res.data;

      if (role && String(rawUser.role).toLowerCase() !== role) {
        return {
          ok: false,
          error: `This account is registered as a ${String(
            rawUser.role
          ).toUpperCase()}. Please select the correct account type.`,
        };
      }

      setToken(token);
      const normalized = normalizeUser(rawUser);
      setUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  /* ================= ADMIN LOGIN ================= */

  const loginAdmin = async ({ email, password }) => {
    try {
      const res = await apiAdminLogin(email, password);
      setToken(res.token);
      const normalized = normalizeUser(res.data);
      setUser(normalized);
      return { ok: true, user: normalized };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  /* ================= REGISTER ================= */

  const registerAccount = async (payload) => {
    try {
      await apiRegister(payload);
    } catch (error) {
      return { ok: false, error: error.message };
    }

    /* Sign the new account in immediately with the very same
       credentials, then the caller sends them to their dashboard. */
    return login({
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = {
    user,
    authLoading,
    login,
    loginAdmin,
    registerAccount,
    logout,
    refresh: loadSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
