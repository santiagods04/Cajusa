import { getToken } from "./token";
class Api {
  constructor(url) {
    this._url = url;
  }

  async _checkResponse(res) {
    if (res.ok) {
      if (res.status === 204) return null;

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return res.json();

      return res.text();
    }

    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      body = null;
    }

    const message = body?.message || `Error: ${res.status}`;
    throw new Error(message);
  }

  _checkUrl() {
    if (!this._url) {
      throw new Error("VITE_API_URL no está configurada");
    }
  }

  _headersPublic() {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();

    if (token) headers.Authorization = `Bearer ${token}`;

    return headers;
  }

  _headersAuth() {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();

    if (!token) throw new Error("No token found");
    headers.Authorization = `Bearer ${token}`;

    return headers;
  }

  // ======================
  // USERS
  // ======================
  getUsers() {
    this._checkUrl();

    return fetch(`${this._url}/users`, {
      headers: this._headersAuth(),
    }).then((res) => this._checkResponse(res));
  }

  getInfoUser() {
    this._checkUrl();

    return fetch(`${this._url}/users/me`, {
      headers: this._headersAuth(),
    }).then((res) => this._checkResponse(res));
  }

  updatePersonalData({ name, nickname, phone }) {
    this._checkUrl();

    return fetch(`${this._url}/users/me`, {
      method: "PATCH",
      headers: this._headersAuth(),
      body: JSON.stringify({ name, nickname, phone }),
    }).then((res) => this._checkResponse(res));
  }

  updateEmail({ email }) {
    this._checkUrl();

    return fetch(`${this._url}/users/me/email`, {
      method: "PATCH",
      headers: this._headersAuth(),
      body: JSON.stringify({ email }),
    }).then((res) => this._checkResponse(res));
  }

  updatePassword({ currentPassword, newPassword, confirmNewPassword }) {
    this._checkUrl();

    return fetch(`${this._url}/users/me/password`, {
      method: "PATCH",
      headers: this._headersAuth(),
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    }).then((res) => this._checkResponse(res));
  }
  // ======================
  // PRODUCTS
  // ======================
  getProducts(params = {}) {
    this._checkUrl();

    const qs = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      const value = String(v).trim();
      if (!value) return;
      qs.set(k, value);
    });

    const url = `${this._url}/products${qs.toString() ? `?${qs.toString()}` : ""}`;

    return fetch(url, {
      headers: this._headersPublic(),
    }).then((res) => this._checkResponse(res));
  }

  getProductById(id) {
    this._checkUrl();

    return fetch(`${this._url}/products/${encodeURIComponent(id)}`, {
      headers: this._headersPublic(),
    }).then((res) => this._checkResponse(res));
  }

  // Admin (CRUD)
  createProduct(data) {
    this._checkUrl();

    return fetch(`${this._url}/products`, {
      method: "POST",
      headers: this._headersAuth(),
      body: JSON.stringify(data),
    }).then((res) => this._checkResponse(res));
  }

  updateProduct(productId, data) {
    this._checkUrl();

    return fetch(`${this._url}/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      headers: this._headersAuth(),
      body: JSON.stringify(data),
    }).then((res) => this._checkResponse(res));
  }

  deleteProduct(productId) {
    this._checkUrl();

    return fetch(`${this._url}/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: this._headersAuth(),
    }).then((res) => this._checkResponse(res));
  }
}

const api = new Api(import.meta.env.VITE_API_URL);
export default api;
