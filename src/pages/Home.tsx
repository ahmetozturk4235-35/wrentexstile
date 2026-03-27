import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Globe2, CheckCircle2, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  category_id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr: string;
  description_en: string;
  description_ar: string;
  price: number;
  image_url: string;
  category_name_tr: string;
  category_name_en: string;
  category_name_ar: string;
}

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  image_url: string;
}

interface Content {
  [key: string]: {
    tr: string;
    en: string;
    ar: string;
  };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<{ status: 'success' | 'error', message?: string } | null>(null);

  useEffect(() => {
    const status = searchParams.get('payment');
    const message = searchParams.get('message');
    if (status === 'success') {
      setPaymentStatus({ status: 'success' });
      clearCart();
      // Remove query params
      searchParams.delete('payment');
      setSearchParams(searchParams);
    } else if (status === 'error') {
      setPaymentStatus({ status: 'error', message: message || 'Ödeme işlemi başarısız oldu.' });
      // Remove query params
      searchParams.delete('payment');
      searchParams.delete('message');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, clearCart]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, contentRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/content')
        ]);
        const categoriesData = await categoriesRes.json();
        const contentData = await contentRes.json();
        setCategories(categoriesData);
        setContent(contentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  const currentLang = i18n.language as 'tr' | 'en' | 'ar';

  return (
    <div>
      {/* Payment Status Toast */}
      {paymentStatus && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl shadow-lg flex items-start gap-3 ${
              paymentStatus.status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {paymentStatus.status === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {paymentStatus.status === 'success' ? 'Ödeme Başarılı!' : 'Ödeme Başarısız'}
              </h3>
              <p className="text-sm mt-1 opacity-90">
                {paymentStatus.status === 'success' 
                  ? 'Siparişiniz başarıyla alındı. Teşekkür ederiz.' 
                  : paymentStatus.message}
              </p>
            </div>
            <button 
              onClick={() => setPaymentStatus(null)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Floating Social Icons */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-2">
        {[
          { id: 'whatsapp', color: 'bg-[#25D366]', icon: 'whatsapp/white' },
          { id: 'trendyol', color: 'bg-[#F27A1A]', icon: 'trendyol/white', fallbackText: 'TY' },
          { id: 'hepsiburada', color: 'bg-[#FF6000]', icon: 'hepsiburada/white', fallbackText: 'HB' },
          { id: 'amazon', color: 'bg-[#FF9900]', icon: 'amazon/white' },
          { id: 'etsy', color: 'bg-[#F16126]', icon: 'etsy/white' },
        ].map((social) => {
          const url = content[`social_${social.id}`]?.[currentLang] || '#';
          return (
            <a
              key={social.id}
              href={url}
              target={url !== '#' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`w-12 h-12 flex items-center justify-center rounded-l-xl shadow-lg hover:-translate-x-2 transition-transform duration-300 ${social.color}`}
              title={social.id.charAt(0).toUpperCase() + social.id.slice(1)}
              onClick={(e) => {
                if (url === '#') {
                  e.preventDefault();
                  alert('URL daha sonra eklenecek.');
                }
              }}
            >
              <img 
                src={`https://cdn.simpleicons.org/${social.icon}`} 
                alt={social.id} 
                className="w-6 h-6"
                onError={(e) => {
                  // If simpleicons fails (e.g., for local Turkish brands), show fallback text
                  if (social.fallbackText) {
                    e.currentTarget.style.display = 'none';
                    const span = document.createElement('span');
                    span.className = 'text-white font-bold text-sm';
                    span.innerText = social.fallbackText;
                    e.currentTarget.parentElement?.appendChild(span);
                  }
                }}
              />
            </a>
          );
        })}
      </div>

      {/* Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={content.hero_image?.tr || "https://picsum.photos/seed/textile/1920/1080?blur=2"}
            alt="Textile background"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/textile/1920/1080?blur=2"; }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 leading-tight">
              {content.hero_title?.[currentLang] || t('hero_title')}
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 mb-10 max-w-2xl">
              {content.hero_subtitle?.[currentLang] || t('hero_subtitle')}
            </p>
            <a 
              href="#categories" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-stone-900 bg-white hover:bg-stone-100 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {t('view_products')}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-stone-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Kalite</h3>
              <p className="text-stone-600">En iyi kumaşlar ve usta işçilik.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-stone-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dayanıklı Tasarım</h3>
              <p className="text-stone-600">Zorlu çalışma koşullarına uygun.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Globe2 className="w-6 h-6 text-stone-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Gönderim</h3>
              <p className="text-stone-600">Trendyol, Etsy ve Amazon ile tüm dünyaya.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4 text-stone-900">{t('categories')}</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Özenle tasarlanmış, yüksek kaliteli ürün koleksiyonumuzu kategorilere göre keşfedin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col"
              >
                <Link to={`/category/${category.id}`} className="block aspect-square overflow-hidden bg-stone-100 relative">
                  <img
                    src={category.image_url || `https://picsum.photos/seed/cat${category.id}/600/600`}
                    alt={category[`name_${currentLang}` as keyof Category] as string}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/cat${category.id}/600/600`; }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-serif font-bold text-white text-center px-4 drop-shadow-lg">
                      {category[`name_${currentLang}` as keyof Category] as string}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif font-bold mb-6 text-stone-900">{t('about')}</h2>
              <div className="prose prose-stone prose-lg text-stone-600 leading-relaxed">
                {content.about_us?.[currentLang]}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={content.about_us_image?.tr || "https://picsum.photos/seed/about/800/1000"}
                  alt="About Wrentexstile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/about/800/1000"; }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <p className="font-serif text-3xl font-bold text-stone-900">10+</p>
                <p className="text-sm text-stone-500 uppercase tracking-wider font-semibold">Yıllık Tecrübe</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={content.services_image?.tr || "https://picsum.photos/seed/services/800/1000"}
                  alt="Services"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/services/800/1000"; }}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl font-serif font-bold mb-6 text-stone-900">{t('services')}</h2>
              <div className="prose prose-stone prose-lg text-stone-600 leading-relaxed">
                {content.services?.[currentLang]}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
