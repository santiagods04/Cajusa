export const dashboardOptionsByRole = {
  admin: [
    { title: "Productos", desc: "Crea, edita y administra el catálogo.", to: "/admin/products", icon: "🛠️" },
    { title: "Registros", desc: "Revisa actividad, errores y eventos.", to: "/admin/logs", icon: "📄" },
    { title: "Catálogo", desc: "Ver la vista pública del catálogo.", to: "/catalog", icon: "🛒" },
  ],
  user: [
    { title: "Favoritos", desc: "Revisa tus productos favoritos.", to: "/favorites", icon: "❤️" },
    { title: "Carrito", desc: "Revisa tus productos antes de pagar.", to: "/cart", icon: "🛒" },
    { title: "Mis compras", desc: "Historial y estado de pedidos.", to: "/my-purchases", icon: "📦" },
  ],
};

export function getDashboardOptions(role) {
  return dashboardOptionsByRole[role] || dashboardOptionsByRole.user;
}