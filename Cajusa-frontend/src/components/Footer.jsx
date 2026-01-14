import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">CAJUSA</div>
          <p className="footer__tagline">
            Uniformes y prendas pensadas para jornadas reales. Compra rápida por WhatsApp.
          </p>
        </div>

        {/* Links */}
        <nav className="footer__nav" aria-label="Enlaces del sitio">
          <Link className="footer__link" to="/">Inicio</Link>
          <Link className="footer__link" to="/catalogo">Catálogo</Link>
          <a className="footer__link" href="#contacto">Contacto</a>
        </nav>

        {/* CTA */}
        <div className="footer__cta" id="contacto">
          <p className="footer__ctaTitle">¿Hacemos tu pedido?</p>
          <p className="footer__ctaText">
            Escríbenos y te confirmamos disponibilidad y tiempos.
          </p>
          <a
            className="btn btn--active footer__waBtn"
            href="https://wa.me/573214175149?text=Hola%20Cajusa%2C%20quiero%20hacer%20un%20pedido"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <span className="footer__copy">© {year} Cajusa. Todos los derechos reservados.</span>
          <span className="footer__made">
            Experiencia y calidad en cada detalle 😄
          </span>
        </div>
      </div>
    </footer>
  );
}
