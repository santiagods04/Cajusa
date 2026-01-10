import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";


export default function ProtectedRoute({ children, anonymous = false, requiredRole }) {
  const { isLoggedIn, currentUser } = useContext(AppContext);
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (anonymous && isLoggedIn) {
    
    return <Navigate to={from} replace />;
  }

  if (!anonymous && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/catalog" replace />;
  }

  return children;
}
