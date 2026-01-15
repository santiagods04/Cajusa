import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import Products from "./pages/protected/admin/Products";
import api from "./utils/api";
import * as auth from "./utils/auth";
import * as token from "./utils/token";
import AppContext from "./context/AppContext";


function App() {
  const navigate = useNavigate();
  //states user authorization  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  //states products management
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  //authorization
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
    setProducts([]);
    setProductsLoading(false);
    setProductsError('');
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

  //Products management
  function onProductsReload() {
    setProductsLoading(true);
    setProductsError('');

    return api.getProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        return data;
      })
      .catch((err) => {
        setProducts([]);
        setProductsError(err?.message || 'No se pudieron cargar los productos.');
        throw err;
      })
      .finally(() => setProductsLoading(false));
  }

  function onProductCreate() {
    navigate('/dashboard/products/new');
  }

  function onProductEdit(id) {
    navigate(`/dashboard/products/${id}/edit`);
  }

  function onProductDelete(id) {
    setProductsError('');

    return api.deleteProduct(id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      })
      .catch((err) => {
        setProductsError(err?.message || 'No se pudo borrar el producto.');
        throw err;
      });
  }

  const contextValue = {
    isLoggedIn,
    currentUser,
    setIsLoggedIn,
    setCurrentUser,
    handleSignOut,
    handleLogin,
    handleRegistration,
    products,
    productsLoading,
    productsError,
    onProductsReload,
    onProductCreate,
    onProductEdit,
    onProductDelete,
  };

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
            <Route
              path="/dashboard/products"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Products />
                </ProtectedRoute>
              }
            />
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
