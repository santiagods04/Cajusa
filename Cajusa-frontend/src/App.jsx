import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Popup from "./components/Popup/Popup";
import PopupOverlay from "./components/Popup/PopupOverlay";
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

  // popup state
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);
  const [productSubmitError, setProductSubmitError] = useState('');
  const [activePopup, setActivePopup] = useState(null);
  const [popupProps, setPopupProps] = useState({});
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [overlayProps, setOverlayProps] = useState({});

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

  function onUpdatePersonalData(payload) {
    return api.updatePersonalData(payload).then((updatedUser) => {
      setCurrentUser(updatedUser);
      return updatedUser;
    });
  }

  function onUpdateEmail(payload) {
    return api.updateEmail(payload).then((updatedUser) => {
      setCurrentUser(updatedUser);
      return updatedUser;
    });
  }

  function onUpdatePassword(payload) {
    return api.updatePassword(payload);
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
  const onProductsReload = useCallback((params = {}) => {
    setProductsLoading(true);
    setProductsError("");

    return api.getProducts(params)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        return data;
      })
      .catch((err) => {
        setProducts([]);
        setProductsError(err?.message || "No se pudieron cargar los productos.");
        throw err;
      })
      .finally(() => setProductsLoading(false));
  }, []);

  const getProductsRaw = useCallback((params = {}) => api.getProducts(params), []);
  const getProductByIdRaw = useCallback((id) => api.getProductById(id), []);

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

  function openImagePopup({ images, startIndex = 0, alt = "" } = {}) {
    setPopupProps({ images, startIndex, alt });
    setActivePopup("image-product");
  }
  function openInfoToolTipPopup({
    title = "En construcción",
    message = "En construcción, visítame en una próxima ocasión",
  } = {}) {
    setPopupProps({ title, message });
    setActivePopup("info-tooltip");
  }

  function openCreateProductPopup() {
    setPopupProps({ mode: "create", product: null });
    setActivePopup("product-form");
    setProductSubmitError('');
  }

  function openEditProductPopup(product) {
    setPopupProps({ mode: "edit", product });
    setActivePopup("product-form");
    setProductSubmitError('');
  }

  function closePopup() {
    setActivePopup(null);
    setPopupProps({});
    setProductSubmitError("");
  }

  function openImageOverlay(imageUrl) {
    setOverlayProps({ imageUrl });
    setActiveOverlay("image");
  }

  function closeOverlay() {
    setActiveOverlay(null);
    setOverlayProps({});
  }

  function handleProductSubmit(payload) {
    setProductSubmitLoading(true);
    setProductSubmitError('');

    if (popupProps?.mode === "create") {
      return api.createProduct(payload)
        .then((created) => {
          setProducts((prev) => [created, ...prev]);
          closePopup();
          return created;
        })
        .catch((err) => {
          setProductSubmitError(err?.message || 'No se pudo crear el producto.');
          throw err;
        })
        .finally(() => setProductSubmitLoading(false));
    }

    // edit
    const id = popupProps?.product?._id;
    const { code, ...data } = payload;
    return api.updateProduct(id, data)
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        closePopup();
        return updated;
      })
      .catch((err) => {
        setProductSubmitError(err?.message || 'No se pudo actualizar el producto.');
        throw err;
      })
      .finally(() => setProductSubmitLoading(false));
  }


  const contextValue = {
    isLoggedIn,
    currentUser,
    setIsLoggedIn,
    setCurrentUser,
    handleSignOut,
    handleLogin,
    handleRegistration,
    onUpdatePersonalData,
    onUpdateEmail,
    onUpdatePassword,
    products,
    productsLoading,
    productsError,
    onProductsReload,
    getProductsRaw,
    getProductByIdRaw,
    onProductDelete,
    activePopup,
    popupProps,
    openCreateProductPopup,
    openEditProductPopup,
    openInfoToolTipPopup,
    openImagePopup,
    closePopup,
    activeOverlay,
    overlayProps,
    openImageOverlay,
    closeOverlay,
    handleProductSubmit,
    productSubmitLoading,
    productSubmitError,
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

        <Popup />
        <PopupOverlay />

        <Footer />
      </AppContext.Provider>
    </div>
  );
}

export default App;
