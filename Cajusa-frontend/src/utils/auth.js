// src/utils/auth.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeText = (v) => String(v || "").trim();
const checkResponse = async (res) => {
  if (res.ok) {
    return res.json();
  } else {
    return Promise.reject(new Error(`Error: ${res.status}`));
  }
};
//Register
export const register = ({ name, nickname, email, password, confirmPassword, phone }) => {
  const payload = {
    name: normalizeText(name),
    nickname: normalizeText(nickname),
    email: normalizeEmail(email),
    phone: normalizeText(phone),
    password,
    confirmPassword,
  };

  return fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(checkResponse);
};

// Login 
export const login = ({ email, password }) => {
  const payload = {
    email: normalizeEmail(email),
    password,
  };

  return fetch(`${BASE_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(checkResponse);
};
