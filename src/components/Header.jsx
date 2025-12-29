import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const getNavStyle = ({ isActive }) => ({
    fontWeight: isActive ? 800 : 600,
  });

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="link">
          <h2 className="header__brand">Cajusa</h2>
        </Link>

        <nav className="header__nav">
          <NavLink to="/" className="link" style={getNavStyle}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className="link" style={getNavStyle}>
            Catálogo
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
