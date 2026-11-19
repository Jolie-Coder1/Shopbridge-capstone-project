
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, ShoppingBag, CookingPot, Globe2, Star, Plus, Minus, X,
  RefreshCw, MapPin, Phone, Mail, Trash2, ArrowRight, ChefHat,
  CreditCard, Menu
} from "lucide-react";
import i18n, { setShopLanguage } from "./i18n";

const LANGUAGES = [
  ["en", "English"],
  ["rw", "Kinyarwanda"],
  ["fr", "Français"],
  ["zh", "简体中文"],
  ["sw", "Kiswahili"],
  ["ar", "العربية"]
];

const DEMO_RWF_RATE = 1400;

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: "Stainless Steel Cooking Pot",
    description: "A durable cooking pot for everyday family meals.",
    category: "cookware",
    price: 28,
    rating: 4.8,
    discountPercentage: 10,
    thumbnail: "https://images.unsplash.com/photo-1584990347449-a2d5b3f8c8a8?w=700"
  },
  {
    id: 2,
    title: "Non-Stick Frying Pan",
    description: "A practical non-stick pan for frying and sautéing.",
    category: "cookware",
    price: 22,
    rating: 4.7,
    discountPercentage: 5,
    thumbnail: "https://images.unsplash.com/photo-1592156328697-079f6ee9e9a6?w=700"
  },
  {
    id: 3,
    title: "Electric Kitchen Blender",
    description: "Blend fruits, vegetables and ingredients with ease.",
    category: "appliances",
    price: 55,
    rating: 4.6,
    discountPercentage: 8,
    thumbnail: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700"
  },
  {
    id: 4,
    title: "Wooden Cooking Utensils",
    description: "A useful set of wooden tools for daily cooking.",
    category: "utensils",
    price: 15,
    rating: 4.5,
    discountPercentage: 0,
    thumbnail: "https://images.unsplash.com/photo-1584990347449-a2d5b3f8c8a8?w=700"
  },
  {
    id: 5,
    title: "Ceramic Dinner Plate Set",
    description: "Elegant plates for family meals and special occasions.",
    category: "tableware",
    price: 30,
    rating: 4.7,
    discountPercentage: 5,
    thumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700"
  },
  {
    id: 6,
    title: "Kitchen Storage Containers",
    description: "Keep dry ingredients organized and fresh.",
    category: "storage",
    price: 18,
    rating: 4.4,
    discountPercentage: 0,
    thumbnail: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=700"
  }
];

const CATEGORY_OPTIONS = [
  { id: "all", key: "all" },
  { id: "cookware", key: "cookware" },
  { id: "appliances", key: "appliances" },
  { id: "utensils", key: "utensils" },
  { id: "tableware", key: "tableware" },
  { id: "storage", key: "storage" }
];

function formatRwf(amount) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(amount * DEMO_RWF_RATE);
}

function normalizeApiProduct(product) {
  return {
    ...product,
    category: "cookware",
    rating: Number(product.rating || 0),
    discountPercentage: Number(product.discountPercentage || 0)
  };
}

export default function App() {
  const { t } = useTranslation();

  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopbridge-cart") || "{}");
    } catch {
      return {};
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("shopbridge-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  async function loadProducts() {
    setLoading(true);
    setApiError(false);

    try {
      const response = await fetch(
        "https://dummyjson.com/products/category/kitchen-accessories?limit=30"
      );

      if (!response.ok) throw new Error("Could not load products");

      const data = await response.json();

      if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error("No products returned");
      }

      setProducts(data.products.map(normalizeApiProduct));
    } catch {
      setProducts(SAMPLE_PRODUCTS);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Translate the sample products without changing API product information.
  function getProductTitle(product) {
    const sample = SAMPLE_PRODUCTS.find(
      item => item.title === product.title
    );

    return sample ? t(`product${sample.id}`) : product.title;
  }

  function getProductDescription(product) {
    const sample = SAMPLE_PRODUCTS.find(
      item => item.title === product.title
    );

    return sample
      ? t(`description${sample.id}`)
      : product.description;
  }

  function getCategoryName(productCategory) {
    return t(productCategory, { defaultValue: productCategory });
  }

  const visibleProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory =
        category === "all" || product.category === category;

      const translatedText = [
        product.title,
        product.description,
        getProductTitle(product),
        getProductDescription(product)
      ].join(" ").toLowerCase();

      return (
        matchesCategory &&
        translatedText.includes(search.toLowerCase())
      );
    });
  }, [products, category, search, language]);

  const cartItems = Object.values(cart);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity, 0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addToCart(product) {
    setCart(currentCart => ({
      ...currentCart,
      [product.id]: {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: (currentCart[product.id]?.quantity || 0) + 1
      }
    }));

    showNotice(
      t("added", { product: getProductTitle(product) })
    );
  }

  function changeQuantity(id, amount) {
    setCart(currentCart => {
      const updatedCart = { ...currentCart };

      if (!updatedCart[id]) return currentCart;

      updatedCart[id] = {
        ...updatedCart[id],
        quantity: updatedCart[id].quantity + amount
      };

      if (updatedCart[id].quantity <= 0) {
        delete updatedCart[id];
      }

      return updatedCart;
    });
  }

  function removeFromCart(id) {
    setCart(currentCart => {
      const updatedCart = { ...currentCart };
      delete updatedCart[id];
      return updatedCart;
    });
  }

  function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setShopLanguage(selectedLanguage);
  }

  function handleCheckout() {
    showNotice(t("paymentNotice"));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ShopBridge home">
          <span className="brand-mark">
            <CookingPot size={28} />
          </span>
          <span className="brand-name">
            Shop<span>Bridge</span>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={23} />
        </button>

        <nav
          className={`main-nav ${mobileMenuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>
            {t("home")}
          </a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            {t("about")}
          </a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
            {t("contact")}
          </a>
        </nav>

        <div className="header-search">
          <Search size={19} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
          />
        </div>

        <div className="header-actions">
          <label className="language-picker">
            <Globe2 size={18} />
            <span className="sr-only">{t("language")}</span>
            <select value={language} onChange={handleLanguageChange}>
              {LANGUAGES.map(([code, name]) => (
                <option value={code} key={code}>{name}</option>
              ))}
            </select>
          </label>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`${t("cart")} ${cartCount}`}
          >
            <ShoppingBag size={19} />
            <span>{t("cart")}</span>
            <b>{cartCount}</b>
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">{t("welcome")}</span>

            <h1>
              {t("heroTitle")}
              <span> {t("heroHighlight")}</span>
            </h1>

            <p>{t("heroDescription")}</p>

            <a href="#products" className="primary-button hero-button">
              {t("shopNow")} <ArrowRight size={18} />
            </a>

            <div className="hero-note">
              <ChefHat size={18} />
              <span>{t("heroNote")}</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Kitchen cookware illustration">
            <div className="hero-circle hero-circle-one" />
            <div className="hero-circle hero-circle-two" />

            <div className="hero-pot">
              <CookingPot size={125} strokeWidth={1.2} />
            </div>

            <div className="hero-floating-card">
              <Star size={17} fill="currentColor" />
              {t("quality")}
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t("shopKitchen")}</span>
              <h2>{t("collection")}</h2>
              <p>{t("collectionDescription")}</p>
            </div>

            <span className="product-count">
              {visibleProducts.length} {t("products")}
            </span>
          </div>

          <div className="catalog-layout">
            <aside className="filters">
              <h3>{t("categories")}</h3>

              {CATEGORY_OPTIONS.map(item => (
                <button
                  key={item.id}
                  className={category === item.id ? "filter active" : "filter"}
                  onClick={() => setCategory(item.id)}
                >
                  {t(item.key)}
                </button>
              ))}
            </aside>

            <section className="catalog" aria-live="polite">
              {loading && (
                <div className="state-message">
                  <RefreshCw className="spin" size={20} />
                  {t("loading")}
                </div>
              )}

              {apiError && !loading && (
                <div className="api-notice">
                  {t("error")}
                  <button onClick={loadProducts}>{t("retry")}</button>
                </div>
              )}

              {!loading && visibleProducts.length === 0 && (
                <div className="state-message">
                  {t("noProducts")}
                </div>
              )}

              <div className="product-grid">
                {!loading && visibleProducts.map(product => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={getProductTitle(product)}
                          loading="lazy"
                        />
                      ) : (
                        <CookingPot size={65} />
                      )}

                      {product.discountPercentage > 0 && (
                        <span className="discount">
                          -{Math.round(product.discountPercentage)}%
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {getCategoryName(product.category)}
                      </span>

                      <h3>{getProductTitle(product)}</h3>

                      <p className="product-description">
                        {getProductDescription(product)}
                      </p>

                      <div className="rating">
                        <Star size={15} fill="currentColor" />
                        <b>{Number(product.rating || 0).toFixed(1)}</b>
                        <span>{t("rating")}</span>
                      </div>

                      <div className="product-bottom">
                        <div>
                          <strong>{formatRwf(product.price)}</strong>
                          <small>{t("estimatedPrice")}</small>
                        </div>

                        <button
                          className="add-button"
                          onClick={() => addToCart(product)}
                          aria-label={`${t("add")} ${getProductTitle(product)}`}
                        >
                          <Plus size={19} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <p className="exchange-note">{t("exchangeNote")}</p>
        </section>

        <section className="info-grid">
          <section className="info-section" id="about">
            <span className="eyebrow">{t("aboutEyebrow")}</span>
            <h2>{t("aboutTitle")}</h2>
            <p>{t("aboutText1")}</p>
            <p>{t("aboutText2")}</p>

            <a href="#products" className="text-link">
              {t("explore")} <ArrowRight size={17} />
            </a>
          </section>

          <section className="info-section contact-section" id="contact">
            <span className="eyebrow">{t("helpEyebrow")}</span>
            <h2>{t("contactTitle")}</h2>

            <div className="contact-details">
              <div className="contact-item">
                <MapPin size={23} />
                <div>
                  <h3>{t("location")}</h3>
                  <p>Kigali, Rwanda</p>
                </div>
              </div>

              <div className="contact-item">
                <Phone size={23} />
                <div>
                  <h3>{t("helpline")}</h3>
                  <a href="tel:0783317460">0783317460</a>
                </div>
              </div>

              <div className="contact-item">
                <Mail size={23} />
                <div>
                  <h3>{t("emailSupport")}</h3>
                  <p>{t("emailText")}</p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">
            <CookingPot size={25} />
          </span>
          <span className="brand-name">
            Shop<span>Bridge</span>
          </span>
        </a>

        <p>{t("footerTagline")}</p>

        <div className="footer-links">
          <a href="#home">{t("home")}</a>
          <a href="#about">{t("about")}</a>
          <a href="#contact">{t("contact")}</a>
        </div>

        <a className="footer-phone" href="tel:0783317460">
          <Phone size={18} /> 0783317460
        </a>

        <small>
          © {new Date().getFullYear()} ShopBridge. {t("rights")}
        </small>
      </footer>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={event => event.stopPropagation()}
            aria-label={t("cart")}
          >
            <div className="drawer-head">
              <div>
                <span className="eyebrow">{t("yourSelection")}</span>
                <h2>{t("yourCart")} ({cartCount})</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
                aria-label={t("cart")}
              >
                <X size={23} />
              </button>
            </div>

            {cartCount === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={45} />
                <h3>{t("emptyCart")}</h3>
                <p>{t("emptyCartText")}</p>

                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  {t("continueShopping")}
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(item => {
                    const sample = SAMPLE_PRODUCTS.find(
                      product => product.title === item.title
                    );

                    const translatedTitle = sample
                      ? t(`product${sample.id}`)
                      : item.title;

                    return (
                      <div className="cart-item" key={item.id}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={translatedTitle} />
                        ) : (
                          <div className="cart-item-placeholder">
                            <CookingPot size={28} />
                          </div>
                        )}

                        <div className="cart-item-info">
                          <b>{translatedTitle}</b>
                          <strong>{formatRwf(item.price)}</strong>

                          <div className="quantity">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              aria-label={t("decrease")}
                            >
                              <Minus size={14} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              aria-label={t("increase")}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <button
                          className="remove-item"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={t("remove")}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-total">
                  <div className="total-line">
                    <span>{t("estimatedTotal")}</span>
                    <strong>{formatRwf(cartTotal)}</strong>
                  </div>

                  <small>{t("priceWarning")}</small>

                  <button
                    className="checkout-button"
                    onClick={handleCheckout}
                  >
                    <CreditCard size={19} />
                    {t("checkout")}
                  </button>

                  <a className="checkout-help" href="tel:0783317460">
                    {t("needHelp")} 0783317460
                  </a>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
