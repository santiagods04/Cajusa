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

  const contextValue = useMemo(() => ({
    isLoggedIn,
    currentUser,
    setIsLoggedIn,
    setCurrentUser,
    handleSignOut,
    handleAuthSuccess,
    handleRegistration,
  }), [isLoggedIn, currentUser]);

  async function handleRegistration(payload) {
    const user = await auth.register(payload);
    navigate("/login");
    return user;
  }

  function handleAuthSuccess(user) {
    setIsLoggedIn(true);
    setCurrentUser(user);
  }

  function handleSignOut() {
    removeUserId();
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/");
  }

  useEffect(() => {
    const id = token.getToken();
    if (!id) return;

    api.getUserById(id)
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.log(err);
        removeUserId();
        setIsLoggedIn(false);
        setCurrentUser(null);
      });
  }, []);

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
