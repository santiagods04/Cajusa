import { api } from "./api";
import { sha256 } from "./hash";

export async function register({ name, email, password, phone }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name || "").trim();
  const normalizedPhone = String(phone || "").trim();

  if (!normalizedEmail) throw new Error("El correo es obligatorio");
  if (!password || password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const users = await api.getUsers();
  const exists = users.some(
    (u) => String(u.email || "").toLowerCase() === normalizedEmail
  );

  const phoneExists = normalizedPhone
  ? users.some((u) => String(u.phone || "").trim() === normalizedPhone)
  : false;

  if (exists) throw new Error("Ese correo ya está registrado");
  if (phoneExists) throw new Error("Ese número ya está registrado");

  const passwordHash = await sha256(password);

  const user = await api.createUser({
    createdAt: new Date().toISOString(),
    name: normalizedName || "Cliente",
    email: normalizedEmail,
    passwordHash,
    role: "user",
    phone: phone || "",
  });

  return user;
}
