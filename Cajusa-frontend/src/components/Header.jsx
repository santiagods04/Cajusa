import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import logo from "../assets/logo-cajusa-black.png";
import AppContext from "../context/AppContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const MOBILE_NAV_BP = 700;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);


  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { isLoggedIn, currentUser, handleSignOut } = useContext(AppContext);
  const role = currentUser?.role || "user";
  const isAdmin = isLoggedIn && role === "admin";
  const dashboardLabel = isAdmin ? "Panel de Administración" : "Panel de Usuario";

  const menuItems = [
    { to: "/my-account", label: "Mi cuenta" },
    { to: "/dashboard", label: dashboardLabel },
  ];

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const getNavStyle = ({ isActive }) => ({
    fontWeight: isActive ? 800 : 600,
  });

  const displayName = currentUser?.nickname || currentUser?.name || "Usuario";
  const welcomeLabel = `Bienvenido - ${displayName}`;

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function toggleMobileNav() {
    setIsMobileNavOpen((prev) => !prev);
  }

  function closeMobileNav() {
    setIsMobileNavOpen(false);
  }

  function onClickSignOut() {

    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
    handleSignOut();
  }

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_NAV_BP}px)`);

    function handleChange(e) {
      if (!e.matches) setIsMobileNavOpen(false);
    }

    if (!mq.matches) setIsMobileNavOpen(false);

    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange);
    };
  }, [MOBILE_NAV_BP]);

  useEffect(() => {
    function handleOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setIsMenuOpen(false);
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileNavOpen]);

  return (
    <header className="header">
      {isMobileNavOpen && (
        <div
          className="header__backdrop_open"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      <div className="container header__inner">
        <Link to="/" className="link" onClick={closeMobileNav}>
          <div className="header__brand">
            <img className="header__logo" src={logo} alt="Cajusa Boutique" />
          </div>
        </Link>

        <button
          type="button"
          className="header__burger"
          onClick={toggleMobileNav}
          aria-label={isMobileNavOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileNavOpen}
          aria-controls="header-nav"
        >
          <span className="header__burger-icon" aria-hidden="true" />
        </button>

        <nav
          id="header-nav"
          className={`header__nav${isMobileNavOpen ? " header__nav_open" : ""}`}
        >
          <NavLink
            to="/"
            className="link"
            style={getNavStyle}
            onClick={closeMobileNav}
          >
            Inicio
          </NavLink>

          <NavLink
            to="/catalog"
            className="link"
            style={getNavStyle}
            onClick={closeMobileNav}
          >
            Catálogo
          </NavLink>

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="link"
              aria-current={isAuthRoute ? "page" : undefined}
              style={getNavStyle({ isActive: isAuthRoute })}
              onClick={closeMobileNav}
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
                <span className="header__user-menu-chevron" aria-hidden="true">
                  ▾
                </span>
              </button>

              {isMenuOpen && (
                <div
                  className="header__user-menu-dropdown"
                  role="menu"
                  aria-label="Menú de usuario"
                >
                  {menuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="header__user-menu-item"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        closeMobileNav();
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}

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
