const RAW_BASE = import.meta.env.VITE_API_URL || "";
const BASE = RAW_BASE
  ? `${RAW_BASE.replace(/\/+$/, "").replace(/\/api$/i, "")}/api`
  : "/api";

export const getToken  = ()  => localStorage.getItem("dt_token");
export const setToken  = (t) => localStorage.setItem("dt_token", t);
export const clearAuth = ()  => {
  localStorage.removeItem("dt_token");
  localStorage.removeItem("dt_user");
};

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const apiFetch = (url, opts, timeoutMs = 15000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => {
      const e = new Error("SERVER_OFFLINE"); e.offline = true; reject(e);
    }, timeoutMs)
  );
  return Promise.race([fetch(url, opts), timeout])
    .catch((e) => {
      if (e.offline) throw e;
      const err = new Error("SERVER_OFFLINE"); err.offline = true; throw err;
    });
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Xatolik yuz berdi");
    if (data.needBot) err.needBot = true;
    throw err;
  }
  return data;
};

// ─── PING (server warmup) ─────────────────────────────────────────
export const ping = () => fetch(`${BASE}/ping`).catch(() => {});

// ─── AUTH ─────────────────────────────────────────────────────────
export const authAPI = {
  sendCode: (body) =>
    apiFetch(`${BASE}/auth/send-code`, { method: "POST", headers: headers(), body: JSON.stringify(typeof body === "string" ? { phone: body } : body) }).then(handle),
  register: (body) =>
    apiFetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handle),
  login: (body) =>
    apiFetch(`${BASE}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handle),
  me: () =>
    apiFetch(`${BASE}/auth/me`, { headers: headers() }).then(handle),
  updateMe: (body) =>
    apiFetch(`${BASE}/auth/me`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then(handle),
  loginWithTgToken: (token) =>
    apiFetch(`${BASE}/auth/tg-token/${token}`, { headers: headers() }).then(handle),
  tgInit: (initData) =>
    apiFetch(`${BASE}/auth/tg-init`, { method: "POST", headers: headers(), body: JSON.stringify({ initData }) }).then(handle),
};

// ─── PRODUCTS (katalog) ─────────────────────────────────────────────
export const productsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return apiFetch(`${BASE}/products${qs ? "?" + qs : ""}`, { headers: headers() }).then(handle);
  },
  getById: (id) =>
    apiFetch(`${BASE}/products/${id}`, { headers: headers() }).then(handle),
};

// ─── ORDERS ─────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (body) =>
    apiFetch(`${BASE}/orders`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMy: () =>
    apiFetch(`${BASE}/orders/my`, { headers: headers() }).then(handle),
  getByCode: (code) =>
    apiFetch(`${BASE}/orders/${code}`, { headers: headers() }).then(handle),
  cancel: (code) =>
    apiFetch(`${BASE}/orders/${code}/cancel`, { method: "PUT", headers: headers() }).then(handle),
};

// ─── OPERATOR ─────────────────────────────────────────────────────
export const operatorAPI = {
  getMe: () =>
    apiFetch(`${BASE}/operator/me`, { headers: headers() }).then(handle).catch(() => ({ isOperator: false, isMainOperator: false })),

  // Mahsulotlar (menyu)
  getProducts: (q = "") =>
    apiFetch(`${BASE}/operator/products${q ? "?q=" + encodeURIComponent(q) : ""}`, { headers: headers() }).then(handle),
  createProduct: (body) =>
    apiFetch(`${BASE}/operator/products`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateProduct: (id, body) =>
    apiFetch(`${BASE}/operator/products/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then(handle),
  toggleActive: (id) =>
    apiFetch(`${BASE}/operator/products/${id}/toggle-active`, { method: "PUT", headers: headers() }).then(handle),
  deleteProduct: (id) =>
    apiFetch(`${BASE}/operator/products/${id}`, { method: "DELETE", headers: headers() }).then(handle),

  // Buyurtmalar
  getOrders: (status = "") =>
    apiFetch(`${BASE}/operator/orders${status ? "?status=" + status : ""}`, { headers: headers() }).then(handle),
  getOrderByCode: (code) =>
    apiFetch(`${BASE}/operator/orders/${code}`, { headers: headers() }).then(handle),
  markReady: (code) =>
    apiFetch(`${BASE}/operator/orders/${code}/ready`, { method: "PUT", headers: headers() }).then(handle),
  pickup: (code) =>
    apiFetch(`${BASE}/operator/orders/${code}/pickup`, { method: "PUT", headers: headers() }).then(handle),

  // Foydalanuvchilar
  getUsers: (q = "") =>
    apiFetch(`${BASE}/operator/users${q ? "?q=" + encodeURIComponent(q) : ""}`, { headers: headers() }).then(handle),
  blockUser: (id) =>
    apiFetch(`${BASE}/operator/users/${id}/block`, { method: "PUT", headers: headers() }).then(handle),
  unblockUser: (id) =>
    apiFetch(`${BASE}/operator/users/${id}/unblock`, { method: "PUT", headers: headers() }).then(handle),

  // Operatorlar
  getOperators: () =>
    apiFetch(`${BASE}/operator/operators`, { headers: headers() }).then(handle),
  addOperator: (identifier) =>
    apiFetch(`${BASE}/operator/operators`, { method: "POST", headers: headers(), body: JSON.stringify({ identifier }) }).then(handle),
  removeOperator: (id) =>
    apiFetch(`${BASE}/operator/operators/${id}`, { method: "DELETE", headers: headers() }).then(handle),

  getStats: () =>
    apiFetch(`${BASE}/operator/stats`, { headers: headers() }).then(handle),
};

// ─── SETTINGS (feature flags) ─────────────────────────────────────
export const settingsAPI = {
  get: (key) =>
    apiFetch(`${BASE}/settings/${key}`, { headers: headers() }).then(handle).catch(() => ({ value: null })),
  set: (key, value) =>
    apiFetch(`${BASE}/settings/${key}`, { method: "PUT", headers: headers(), body: JSON.stringify({ value }) }).then(handle),
};
