import { useContext } from "react";
import { Link } from "react-router-dom";
import AppContext from "../../../context/AppContext";
import { getDashboardOptions } from "../../../data/dashboardOptions";

export default function Dashboard() {
  const { currentUser, openInfoToolTipPopup } = useContext(AppContext);
  const role = currentUser?.role || "user";
  const options = getDashboardOptions(role);

  function handleOptionClick(e, option) {
    if (!option?.comingSoon) return;

    e.preventDefault();
    openInfoToolTipPopup({
      title: "En construcción",
      message: `“${option.title}” está en construcción, visítame en una próxima ocasión.`,
    });
  }

  return (
    <section className="dashboard">
      <div className="container dashboard__container">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">
            Elige una opción para continuar.
          </p>
        </header>

        <div className="dashboard__grid">
          {options.map((o) => (
            <Link
              key={o.to}
              to={o.to}
              className="dashboard__card"
              onClick={(e) => handleOptionClick(e, o)}
              aria-disabled={o.comingSoon ? "true" : "false"}
            >
              <div className="dashboard__card-top">
                <span className="dashboard__icon" aria-hidden="true">{o.icon}</span>
              </div>

              <h2 className="dashboard__card-title">{o.title}</h2>
              <p className="dashboard__card-text">{o.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
