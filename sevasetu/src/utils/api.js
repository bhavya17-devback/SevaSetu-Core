/* =========================================================
   SEVASETU - API CLIENT
   ---------------------------------------------------------
   Every network call to the backend goes through here. It
   attaches the saved login token automatically and turns a
   failed response into a normal JS Error with a readable
   message, so the rest of the app never touches `fetch`
   directly.
   ========================================================= */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "sevasetu_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    // Ignore - e.g. storage disabled in a private tab.
  }
};

export const clearToken = () => setToken(null);

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error(
      "Could not reach the server. Is the backend running and REACT_APP_API_URL correct?"
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch (parseError) {
    // Some responses (e.g. 204) have no body - that's fine.
  }

  if (!response.ok) {
    const fromErrorsArray =
      data && Array.isArray(data.errors) && data.errors.length
        ? data.errors[0]
        : null;

    const message =
      fromErrorsArray ||
      (data && data.message) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export default api;
