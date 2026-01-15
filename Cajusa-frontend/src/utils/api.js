import { getToken } from './token';
class Api {
  constructor(url) {
    this._url = url;
  }
  
  _checkResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(new Error(`Error: ${res.status}`));
  }

  _checkUrl() {
    if (!this._url) {
      return Promise.reject(new Error("VITE_API_URL no está configurada"));
    }
  }

   _checkToken() {
    const jwt = getToken();
    if (!jwt) throw new Error("No token found");
    return jwt;
  }

   _getHeaders() {
    const token = this._checkToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  getUsers() {
    this._checkUrl();
    if (!this._url) {
      return Promise.reject(new Error("VITE_API_URL no está configurada"));
    }

    return fetch(`${this._url}/users`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  createUser(data) {
    this._checkUrl();

    return fetch(`${this._url}/users`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify(data),
    }).then(this._checkResponse);
  }

  getUserById(id) {
    this._checkUrl();

    return fetch(`${this._url}/users/${encodeURIComponent(id)}`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  getProducts() {
    this._checkUrl();

    return fetch(`${this._url}/products`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  getProductById(id) {
    this._checkUrl();

    return fetch(`${this._url}/products/${encodeURIComponent(id)}`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }
}

const api = new Api(import.meta.env.VITE_API_URL);
export default api ;