import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo-cajusa-black.png";

export default function Header() {
  const getNavStyle = ({ isActive }) => ({
    fontWeight: isActive ? 800 : 600,
  });

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
        </nav>
      </div>
    </header>
  );
}
