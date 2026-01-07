import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import logo from "../assets/logo-cajusa-black.png";
import AppContext from "../context/AppContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, currentUser, handleSignOut } = useContext(AppContext);
  const role = currentUser?.role || "user";
  const isUser = isLoggedIn && role === "user";
  const isAdmin = isLoggedIn && role === "admin";

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const getNavStyle = ({ isActive }) => ({
    fontWeight: isActive ? 800 : 600,
  });

  function onClickSignOut() {
    handleSignOut();
    navigate("/login");
  }

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
            <>
              {isUser && (
                <span className="link" style={{ fontWeight: 600 }}>
                  {currentUser?.name || currentUser?.email || "Usuario"}
                </span>
              )}

              {isAdmin && <Link to="/admin" className="link">Admin</Link>}

              <button
                type="button"
                className="link"
                onClick={onClickSignOut}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
