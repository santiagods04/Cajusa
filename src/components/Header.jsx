import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/logo-cajusa-black.png";
import AppContext from "../context/AppContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { isLoggedIn, currentUser, handleSignOut } = useContext(AppContext);
  const role = currentUser?.role || "user";
  const isUser = isLoggedIn && role === "user";
  const isAdmin = isLoggedIn && role === "admin";

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const getNavStyle = ({ isActive }) => ({
    fontWeight: isActive ? 800 : 600,
  });

  const displayName = currentUser?.name || currentUser?.email || "Usuario";
  const welcomeLabel = `Bienvenido - ${displayName}`;

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function onClickSignOut() {
    handleSignOut();
    navigate("/login");
  }

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setIsMenuOpen(false);
    }

    function handleEsc(e) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="link">
          <div className="header__brand">
            <img className="header__logo" src={logo} alt="Cajusa Boutique" />
          </div>
        </Link>

        <nav className="header__nav">
          <NavLink to="/" className="link" style={getNavStyle}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className="link" style={getNavStyle}>
            Catálogo
          </NavLink>
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="link"
              aria-current={isAuthRoute ? "page" : undefined}
              style={getNavStyle({ isActive: isAuthRoute })}
            >
              Acceso
            </Link>
          ) : (
            <div ref={menuRef} className="header__user-menu">
              <button
                type="button"
                className="link header__user-menu-trigger"
                onClick={toggleMenu}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                {welcomeLabel}
                <span className="header__user-menu-chevron" aria-hidden="true">▾</span>
              </button>

              {isMenuOpen && (
                <div className="header__user-menu-dropdown" role="menu" aria-label="Menú de usuario">
                  {/* Opciones USER */}
                  {isUser && (
                    <>
                      <button type="button" className="header__user-menu-item" role="menuitem" disabled>
                        Mi cuenta (próximamente)
                      </button>
                      <button type="button" className="header__user-menu-item" role="menuitem" disabled>
                        Favoritos (próximamente)
                      </button>
                    </>
                  )}

                  {/* Opciones ADMIN */}
                  {isAdmin && (
                    <>
                      <button type="button" className="header__user-menu-item" role="menuitem" disabled>
                        Panel admin (próximamente)
                      </button>
                      <button type="button" className="header__user-menu-item" role="menuitem" disabled>
                        Gestionar productos (próximamente)
                      </button>
                    </>
                  )}

                  <div className="header__user-menu-divider" />

                  <button
                    type="button"
                    className="header__user-menu-item header__user-menu-item--danger"
                    role="menuitem"
                    onClick={onClickSignOut}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
