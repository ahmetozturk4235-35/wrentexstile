import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import CategoryProducts from './pages/CategoryProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { Settings, Globe, ShoppingCart, MapPin, Phone } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { items } = useCart();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl]);

  useEffect(() => {
    // Track site visit once per session
    if (!sessionStorage.getItem('visited')) {
      fetch('/api/analytics/visit', { method: 'POST' }).catch(console.error);
      sessionStorage.setItem('visited', 'true');
    }
  }, []);

  return (
    <div className={`min-h-screen bg-stone-50 text-stone-900 font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="font-serif text-3xl tracking-tighter font-bold text-stone-900">Wrentexstile</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('home')}
              </Link>
              <a href="/#about" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('about')}
              </a>
              <a href="/#categories" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('categories')}
              </a>

              <Link to="/cart" className="relative text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* Language Selector */}
              <div className="relative group ml-4">
                <button className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase">{i18n.language}</span>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-stone-100">
                  <div className="py-1">
                    <button onClick={() => changeLanguage('tr')} className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Türkçe</button>
                    <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">English</button>
                    <button onClick={() => changeLanguage('ar')} className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">العربية</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-serif text-2xl tracking-tighter font-bold text-white mb-4 block">Wrentexstile</span>
              <p className="text-sm text-stone-400 max-w-xs">
                Profesyoneller için yüksek kaliteli tekstil ürünleri. Trendyol, Etsy ve Amazon üzerinden tüm dünyaya gönderim.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hızlı Linkler</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/#about" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="/#categories" className="hover:text-white transition-colors">Kategoriler</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">İletişim</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 text-stone-400 flex-shrink-0" />
                  <span>+90 545 528 42 62</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-stone-400 flex-shrink-0" />
                  <span>Ulubatlıhasan mahallesi başkonak sokak No:3/J Karatay-Konya</span>
                </li>
                <li>Email: info@wrentexstile.com</li>
                <li>Satış Kanalları: Trendyol, Etsy, Amazon</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 flex justify-between items-center">
            <p className="text-sm text-stone-500">&copy; {new Date().getFullYear()} Wrentexstile. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Link at Bottom Right */}
      <Link
        to="/admin"
        className="fixed bottom-4 right-4 bg-stone-900 text-white p-3 rounded-full shadow-lg hover:bg-stone-800 transition-colors z-50 group"
        title={t('admin')}
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/category/:id" element={<Layout><CategoryProducts /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/admin" element={<Layout><Admin /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
      </Routes>
    </CartProvider>
  );
}
