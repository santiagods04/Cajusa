const USER_ID_KEY = "cajusa_user_id";

export function setUserId(id) {
  localStorage.setItem(USER_ID_KEY, id);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function removeUserId() {
  localStorage.removeItem(USER_ID_KEY);
}
