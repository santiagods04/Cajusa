const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || "573214175179";

const digitsOnly = (phone) => String(phone).replace(/\D/g, "");

function buildWhatsAppWebLink(text, phone = WHATSAPP_PHONE) {
  const digits = digitsOnly(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function buildWhatsAppAppLink(text, phone = WHATSAPP_PHONE) {
  const digits = digitsOnly(phone);
  return `whatsapp://send?phone=${digits}&text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(text, phone = WHATSAPP_PHONE, { timeout = 1400 } = {}) {
  const appUrl = buildWhatsAppAppLink(text, phone);
  const webUrl = buildWhatsAppWebLink(text, phone);

  let switchedAway = false;

  const markAway = () => {
    switchedAway = true;
    cleanup();
  };

  const onVis = () => {
    if (document.visibilityState === "hidden") markAway();
  };

  const cleanup = () => {
    window.removeEventListener("blur", markAway);
    window.removeEventListener("pagehide", markAway);
    document.removeEventListener("visibilitychange", onVis);
  };

  window.addEventListener("blur", markAway, { once: true });
  window.addEventListener("pagehide", markAway, { once: true });
  document.addEventListener("visibilitychange", onVis, { once: true });

  window.location.href = appUrl;

  setTimeout(() => {
    cleanup();

    const stillHere =
      !switchedAway &&
      document.visibilityState === "visible" &&
      document.hasFocus();

    if (stillHere) {
      window.location.href = webUrl;
    }
  }, timeout);
}
