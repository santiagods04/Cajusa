import { api } from "./api";
import { sha256 } from "./hash";
import { setUserId } from "./token";

export async function register({ name, nickname, email, password, phone }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const normalizedNickname = String(nickname || "").trim();

  if (!normalizedEmail) throw new Error("El correo es obligatorio");
  if (!password || password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  if (normalizedNickname && normalizedNickname.length > 20) {
    throw new Error("El nickname no puede tener más de 20 caracteres");
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

  const fallbackNickname = normalizedName.split(" ")[0] || normalizedEmail.split("@")[0] || "Cliente";
  const finalNickname = (normalizedNickname || fallbackNickname).trim();
  const finalNicknameKey = finalNickname.toLowerCase();
  const existsNickname = users.some(
    (u) => String(u.nickname || "").trim().toLowerCase() === finalNicknameKey
  );
  if (normalizedNickname && normalizedNickname.length > 20 && finalNickname.length > 20) {
    throw new Error("El nickname no puede tener más de 20 caracteres");
  }
  if (existsNickname) throw new Error("Ese nickname ya está en uso");
  const passwordHash = await sha256(password);

  const user = await api.createUser({
    createdAt: new Date().toISOString(),
    name: normalizedName,
    nickname: finalNickname,
    email: normalizedEmail,
    passwordHash,
    role: "user",
    phone: normalizedPhone,
  });

  return user;
}

export async function login({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!normalizedEmail) throw new Error("El correo es obligatorio");
  if (!password) throw new Error("La contraseña es obligatoria");

  const users = await api.getUsers();

  const user = users.find(
    (u) => String(u.email || "").toLowerCase() === normalizedEmail
  );

  if (!user) throw new Error("Correo o contraseña incorrectos");

  const passwordHash = await sha256(password);

  if (String(user.passwordHash) !== String(passwordHash)) {
    throw new Error("Correo o contraseña incorrectos");
  }

  setUserId(user.id);

  return user;
}
