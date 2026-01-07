import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";


export default function ProtectedRoute({ children, anonymous = false }) {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (anonymous && isLoggedIn) {
    
    return <Navigate to={from} replace />;
  }

  if (!anonymous && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
