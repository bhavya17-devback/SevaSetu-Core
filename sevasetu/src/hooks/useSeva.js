import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   useFetch
   ---------------------------------------------------------
   Runs an async fetcher (a function returning a promise) and
   tracks { data, loading, error }. Call refresh() after any
   action that changes the data on the server (claiming a
   donation, cancelling one...) to pull the latest state back
   down instead of guessing what changed locally.
   ========================================================= */

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const refresh = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    fetcher()
      .then((result) => {
        if (id === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (id === requestId.current) {
          setError(err.message || "Something went wrong.");
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/* =========================================================
   useAuthUser
   ---------------------------------------------------------
   Returns the logged-in donor/NGO user and sends anyone
   without the right role back to the login screen. Waits for
   the initial "who am I" check to finish before deciding, so
   a page refresh doesn't bounce a signed-in user to /login.
   ========================================================= */

export function useAuthUser(requiredRole) {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role === "admin") {
      navigate("/login", { replace: true });
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      navigate(user.role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard", {
        replace: true,
      });
    }
  }, [user, authLoading, requiredRole, navigate]);

  return user;
}

/* =========================================================
   useAdminUser
   ---------------------------------------------------------
   Same idea, for the /admin/* screens.
   ========================================================= */

export function useAdminUser() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "admin") {
      navigate("/admin/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  return user;
}
