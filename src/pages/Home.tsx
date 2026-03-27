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
          { id: 'whatsapp', color: 'bg-[#25D366]', label: 'WhatsApp' },
          { id: 'trendyol', color: 'bg-[#F27A1A]', label: 'Trendyol' },
          { id: 'hepsiburada', color: 'bg-[#FF6000]', label: 'Hepsiburada' },
          { id: 'amazon', color: 'bg-[#FF9900]', label: 'Amazon' },
          { id: 'etsy', color: 'bg-[#F16126]', label: 'Etsy' },
        ].map((social) => {
          const url = content[`social_${social.id}`]?.[currentLang] || '#';
          return (
            <a
              key={social.id}
              href={url}
              target={url !== '#' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`w-12 h-12 flex items-center justify-center rounded-l-xl shadow-lg hover:-translate-x-2 transition-transform duration-300 ${social.color}`}
              title={social.label}
              onClick={(e) => {
                if (url === '#') {
                  e.preventDefault();
                  alert('URL daha sonra eklenecek.');
                }
              }}
            >
              {social.id === 'whatsapp' && (
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              )}
              {social.id === 'trendyol' && (
                <span className="text-white font-bold text-sm">TY</span>
              )}
              {social.id === 'hepsiburada' && (
                <span className="text-white font-bold text-sm">HB</span>
              )}
              {social.id === 'amazon' && (
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M.045 18.02c.072-.116.187-.124.348-.022 2.344 1.474 4.882 2.21 7.613 2.21 1.965 0 3.928-.448 5.89-1.345.388-.176.69-.249.904-.218.215.031.324.201.329.51.004.31-.157.584-.484.822-1.167.852-2.593 1.51-4.28 1.972-1.685.462-3.283.693-4.793.693-3.128 0-5.876-.875-8.246-2.626-.16-.118-.197-.268-.108-.449zm21.83-3.873c-.18-.404-.54-.72-1.076-.944-.538-.224-1.098-.336-1.678-.336-.548 0-1.07.103-1.566.31-.498.206-.87.49-1.115.852-.246.36-.232.65.04.865.27.214.624.3 1.064.26.44-.04.788-.083 1.04-.132.256-.048.476-.063.66-.044.184.018.28.11.288.278.008.168-.096.38-.312.64-.216.258-.516.467-.9.626-.384.16-.78.24-1.188.24-.804 0-1.4-.258-1.788-.776-.388-.518-.548-1.214-.48-2.088.06-.748.24-1.368.54-1.86.3-.492.696-.882 1.188-1.17.492-.288 1.02-.486 1.584-.594.564-.108 1.14-.162 1.728-.162 1.04 0 1.86.164 2.46.492.36.196.54.476.54.84 0 .404-.176.854-.528 1.35l-.504.35zM13.916 8.396c0-.672-.18-1.15-.54-1.434-.36-.284-.792-.426-1.296-.426-.396 0-.792.08-1.188.24-.396.16-.684.386-.864.678l-.048.096c.192.264.288.576.288.936 0 .888-.396 1.62-1.188 2.196l.048.048c.456-.12.9-.18 1.332-.18.984 0 1.764.246 2.34.738.348-.492.588-1.002.72-1.53.132-.528.198-1.014.198-1.458l.198.096z"/></svg>
              )}
              {social.id === 'etsy' && (
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M8.559 3.074c0-.395.011-.727.033-.994h5.867c.078 0 .131.048.16.143l.734 3.275a.15.15 0 01-.137.191h-.166a.156.156 0 01-.15-.117c-.457-1.488-1.32-2.467-3.021-2.467H9.933c-.26 0-.389.108-.389.326v6.606h1.983c1.248 0 1.891-.629 2.197-2.098a.156.156 0 01.152-.123h.18a.144.144 0 01.143.164l-.21 2.455.032 2.531a.144.144 0 01-.143.152h-.18a.157.157 0 01-.152-.127c-.25-1.453-.901-2.073-2.144-2.073H9.544v5.637c0 .902.209 1.395.736 1.623.454.195 1.199.26 2.229.26 2.243 0 3.385-.791 4.281-3.092a.155.155 0 01.145-.1h.19a.144.144 0 01.138.185l-1.058 3.539a.18.18 0 01-.174.134H5.596a.144.144 0 01-.143-.164.157.157 0 01.134-.137c1.16-.152 1.59-.527 1.59-1.389V5.162c0-.861-.43-1.236-1.59-1.389a.157.157 0 01-.134-.137.144.144 0 01.143-.164h2.82l.143-.398z"/></svg>
              )}
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
