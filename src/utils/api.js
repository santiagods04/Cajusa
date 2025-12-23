class Api {
  constructor({ baseUrl, headers = {} }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(new Error(`Error: ${res.status}`));
  }

  getProducts() {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_PRODUCTS_API_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/products`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  getProductById(id) {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_PRODUCTS_API_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/products/${encodeURIComponent(id)}`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }
}

export const api = new Api({
  baseUrl: import.meta.env.VITE_PRODUCTS_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
