class Api {
  constructor({ baseUrl, headers = {} }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(new Error(`Error: ${res.status}`));
  }

  getUsers() {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_MOCKAPI_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/users`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  createUser(data) {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_MOCKAPI_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/users`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify(data),
    }).then(this._checkResponse);
  }

  getUserById(id) {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_MOCKAPI_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/users/${encodeURIComponent(id)}`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  getProducts() {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_MOCKAPI_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/products`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  getProductById(id) {
    if (!this._baseUrl) {
      return Promise.reject(new Error("VITE_MOCKAPI_URL no está configurada"));
    }

    return fetch(`${this._baseUrl}/products/${encodeURIComponent(id)}`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }
}

export const api = new Api({
  baseUrl: import.meta.env.VITE_MOCKAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
