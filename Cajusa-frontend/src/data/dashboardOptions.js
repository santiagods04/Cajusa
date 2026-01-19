export const dashboardOptionsByRole = {
  admin: [
    { title: "Productos", desc: "Crea, edita y administra el catálogo.", to: "/dashboard/products", icon: "🛠️" },
    { title: "Registros", desc: "Revisa actividad, errores y eventos.", to: "/dashboard/logs", icon: "📄" , comingSoon: true},
    { title: "Catálogo", desc: "Ver la vista pública del catálogo.", to: "/catalog", icon: "🛒", comingSoon: true },
  ],
  user: [
    { title: "Favoritos", desc: "Revisa tus productos favoritos.", to: "/favorites", icon: "❤️", comingSoon: true },
    { title: "Carrito", desc: "Revisa tus productos antes de pagar.", to: "/cart", icon: "🛒", comingSoon: true },
    { title: "Mis compras", desc: "Historial y estado de pedidos.", to: "/my-purchases", icon: "📦", comingSoon: true },
  ],
};

export function getDashboardOptions(role) {
  return dashboardOptionsByRole[role] || dashboardOptionsByRole.user;
}