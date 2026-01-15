import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import ProductDetail from "./pages/public/ProductDetail";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import MyAccount from "./pages/protected/shared/MyAccount";
import Dashboard from "./pages/protected/shared/Dashboard";
import api from "./utils/api";
import * as auth from "./utils/auth";
import * as token from "./utils/token";
import AppContext from "./context/AppContext";


function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  async function handleRegistration(payload) {
    const user = await auth.register(payload);
    navigate("/login");
    return user;
  }

  function handleLogin({ email, password, from }) {
    if (!email || !password) return;

    return auth.login({ email, password })
      .then(({ token: jwt }) => {
        token.setToken(jwt);
        return api.getInfoUser();
      })
      .then((user) => {
        setIsLoggedIn(true);
        setCurrentUser(user);
        navigate(from, { replace: true });
        console.log("Login successful", user);
      })
      .catch((err) => {
        console.error(err);
        token.removeToken();
        setIsLoggedIn(false);
        throw err;
      });
  }

  function handleSignOut() {
    token.removeToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/", { replace: true });
  }

  useEffect(() => {
    const jwt = token.getToken();
    if (!jwt) return;

    api.getInfoUser()
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.log(err);
        token.removeToken();
        setIsLoggedIn(false);
        setCurrentUser(null);
      });
  }, []);

  const contextValue = useMemo(() => ({
    isLoggedIn,
    currentUser,
    setIsLoggedIn,
    setCurrentUser,
    handleSignOut,
    handleLogin,
    handleRegistration,
  }), [isLoggedIn, currentUser]);

  return (
    <div className="app">
      <AppContext.Provider value={contextValue}>
        <Header />

        <main className="app__main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/my-account"
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/login"
              element={
                <ProtectedRoute anonymous>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute anonymous>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </AppContext.Provider>
    </div>
  );
}

export default App;
