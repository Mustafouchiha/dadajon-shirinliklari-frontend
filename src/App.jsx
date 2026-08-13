import { useState, useEffect, useRef } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import OperatorPage from "./pages/OperatorPage";
import { authAPI, productsAPI, operatorAPI, settingsAPI, getToken, setToken, clearAuth, ping } from "./services/api";
import { Home as HomeIcon, CakeSlice, ShoppingCart, Package, User } from "lucide-react";

const savedUser = () => {
  try { return JSON.parse(localStorage.getItem("dt_user")) || null; }
  catch { return null; }
};

const savedCart = () => {
  try { return JSON.parse(localStorage.getItem("dt_cart")) || []; }
  catch { return []; }
};

const TABS = [
  { id: "home", label: "Bosh sahifa", icon: HomeIcon },
  { id: "catalog", label: "Katalog", icon: CakeSlice },
  { id: "cart", label: "Savat", icon: ShoppingCart },
  { id: "orders", label: "Buyurtmalar", icon: Package },
  { id: "profile", label: "Profil", icon: User },
];

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-[#A93446]">
      {count}
    </span>
  );
}

function LoadingSplash() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#FBF6EF] flex-col gap-3.5">
      <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center text-3xl shadow-lg animate-pulse" style={{ background: "linear-gradient(135deg,#A93446,#4A2E22)" }}>
        🍰
      </div>
      <div className="text-lg font-black text-[#4A2E22]">Dadajon Tort</div>
    </div>
  );
}

export default function App() {
  const cachedUser = savedUser();

  const [user, setUser] = useState(cachedUser);
  const [booting, setBooting] = useState(true);
  const [nav, setNav] = useState("home");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(savedCart);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [isMainOperator, setIsMainOperator] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState(null);
  const [appLogo, setAppLogo] = useState("");
  const pollRef = useRef(null);

  const loggedIn = !!user && !!getToken();

  useEffect(() => {
    localStorage.setItem("dt_cart", JSON.stringify(cart));
  }, [cart]);

  const loadProducts = () => {
    productsAPI.getAll().then(setProducts).catch(() => {});
  };

  const loadOperatorStatus = () => {
    if (!getToken()) { setIsOperator(false); setIsMainOperator(false); return; }
    operatorAPI.getMe().then((res) => {
      setIsOperator(!!res.isOperator);
      setIsMainOperator(!!res.isMainOperator);
    });
  };

  // Server warmup
  useEffect(() => {
    ping();
    const warmup = [3000, 7000, 13000].map((d) => setTimeout(ping, d));
    const keepAlive = setInterval(ping, 4 * 60 * 1000);
    return () => { warmup.forEach(clearTimeout); clearInterval(keepAlive); };
  }, []);

  useEffect(() => {
    settingsAPI.get("app_logo").then((r) => setAppLogo(r.value || "")).catch(() => {});
  }, []);

  // Silent auto-login: Telegram tgToken / initData
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tgToken = params.get("tgToken");
    if (tgToken) window.history.replaceState({}, "", window.location.pathname);

    (async () => {
      try {
        if (tgToken) {
          const data = await authAPI.loginWithTgToken(tgToken);
          setToken(data.token);
          localStorage.setItem("dt_user", JSON.stringify(data.user));
          setUser(data.user);
        } else if (getToken()) {
          try {
            const me = await authAPI.me();
            setUser(me);
            localStorage.setItem("dt_user", JSON.stringify(me));
          } catch {
            clearAuth();
            setUser(null);
          }
        } else {
          const initData = window.Telegram?.WebApp?.initData;
          if (initData) {
            try {
              const data = await authAPI.tgInit(initData);
              setToken(data.token);
              localStorage.setItem("dt_user", JSON.stringify(data.user));
              setUser(data.user);
            } catch { /* guest */ }
          }
        }
      } catch { /* silent */ }
      loadProducts();
      loadOperatorStatus();
      setBooting(false);
    })();

    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
  }, []);

  useEffect(() => {
    loadOperatorStatus();
  }, [user]);

  // Real-time-ish polling for catalog
  useEffect(() => {
    pollRef.current = setInterval(loadProducts, 15_000);
    return () => clearInterval(pollRef.current);
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, weight: product.weight, photo: product.photo, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setNav("home");
    loadOperatorStatus();
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setIsOperator(false);
    setIsMainOperator(false);
    setOperatorOpen(false);
    setNav("home");
  };

  const requireAuth = () => {
    if (loggedIn) return true;
    setNav("login");
    return false;
  };

  const goCheckout = () => {
    if (!requireAuth()) return;
    setCheckoutOpen(true);
  };

  const goCategory = (cat) => {
    setCatalogCategory(cat);
    setNav("catalog");
  };

  const handleOrderSuccess = (order) => {
    setSuccessOrder(order);
    setCheckoutOpen(false);
    setCart([]);
  };

  if (booting) return <LoadingSplash />;

  if (!loggedIn && nav === "login") {
    return <LoginPage onLogin={handleLogin} appLogo={appLogo} />;
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let content;
  if (successOrder) {
    content = <OrderSuccessPage order={successOrder} onDone={() => { setSuccessOrder(null); setNav("orders"); }} />;
  } else if (checkoutOpen) {
    content = <CheckoutPage cart={cart} user={user} onBack={() => setCheckoutOpen(false)} onSuccess={handleOrderSuccess} />;
  } else if (operatorOpen && isOperator) {
    content = <OperatorPage onBack={() => setOperatorOpen(false)} user={user} isMainOperator={isMainOperator} />;
  } else if (nav === "home") {
    content = <HomePage user={user} products={products} addToCart={addToCart} goCatalog={() => setNav("catalog")} goCategory={goCategory} />;
  } else if (nav === "catalog") {
    content = <CatalogPage products={products} addToCart={addToCart} initialCategory={catalogCategory} />;
  } else if (nav === "cart") {
    content = <CartPage cart={cart} updateQty={updateQty} goCatalog={() => setNav("catalog")} goCheckout={goCheckout} />;
  } else if (nav === "orders") {
    content = loggedIn ? <OrdersPage /> : <LoginPage onLogin={handleLogin} appLogo={appLogo} />;
  } else {
    content = loggedIn
      ? <ProfilePage user={user} setUser={(u) => { setUser(u); localStorage.setItem("dt_user", JSON.stringify(u)); }} isOperator={isOperator} onOpenOperator={() => setOperatorOpen(true)} onLogout={handleLogout} />
      : <LoginPage onLogin={handleLogin} appLogo={appLogo} />;
  }

  const showNav = !checkoutOpen && !successOrder && !operatorOpen;

  return (
    <div className="font-sans bg-[#EDE3D6] min-h-screen flex justify-center">
      <div className="w-full max-w-[480px] bg-[#FBF6EF] min-h-screen relative shadow-[0_0_40px_rgba(0,0,0,0.06)]" style={{ paddingBottom: showNav ? 78 : 0 }}>
        {content}

        {showNav && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center justify-around px-2 py-2.5 bg-white/97 backdrop-blur-md border-t border-[#F0E4D6] z-30">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = nav === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setNav(t.id)}
                  className="relative flex flex-col items-center gap-0.5 px-1.5 py-1 min-w-0"
                >
                  <Icon size={20} strokeWidth={active ? 2.1 : 1.7} className={active ? "text-[#A93446]" : "text-[#B9A793]"} />
                  {t.id === "cart" && <Badge count={cartCount} />}
                  <span className={`text-[9.5px] whitespace-nowrap ${active ? "text-[#A93446] font-semibold" : "text-[#B9A793]"}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
