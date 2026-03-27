import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
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
  image_urls?: string[];
  amazon_url?: string;
  etsy_url?: string;
  trendyol_url?: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
  category_name_tr: string;
  category_name_en: string;
  category_name_ar: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
          if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          
          // Track product view
          fetch(`/api/analytics/view/${id}`, { method: 'POST' }).catch(console.error);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Ürün bulunamadı.</div>;
  }

  const currentLang = i18n.language as 'tr' | 'en' | 'ar';
  const name = product[`name_${currentLang}` as keyof Product] as string;
  const description = product[`description_${currentLang}` as keyof Product] as string;
  const categoryName = product[`category_name_${currentLang}` as keyof Product] as string;

  const allImages = Array.from(new Set([
    product.image_url || `https://picsum.photos/seed/${product.id}/800/800`,
    ...(product.image_urls || [])
  ])).filter(Boolean);

  const handleWhatsAppClick = () => {
    const message = `Merhaba, ${name} (ID: ${product.id}) ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`;
    const whatsappUrl = `https://wa.me/905455284262?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Lütfen bir renk seçin.');
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Lütfen bir ebat seçin.');
      return;
    }
    
    addToCart(product, 1, selectedColor, selectedSize);
    
    // Track add to cart
    fetch(`/api/analytics/cart/${product.id}`, { method: 'POST' }).catch(console.error);
    
    alert('Ürün sepete eklendi!');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 shadow-xl group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={allImages[currentImageIndex]}
                alt={name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${product.id}/800/800`; }}
              />
            </AnimatePresence>
            
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-900" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowRight className="w-5 h-5 text-stone-900" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden snap-start transition-all ${
                    currentImageIndex === idx ? 'ring-2 ring-stone-900 ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${product.id}/200/200`; }} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-stone-100 text-stone-600 text-sm font-semibold tracking-wider uppercase mb-4">
              {categoryName}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">
              {name}
            </h1>
            <p className="text-3xl font-serif text-stone-900 mb-6">
              ₺{product.price.toFixed(2)}
            </p>
            <div className="prose prose-stone prose-lg text-stone-600">
              <p>{description}</p>
            </div>

            {/* Variants */}
            <div className="mt-8 space-y-6">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-900 mb-3">Renk Seçimi</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedColor === color 
                            ? 'border-stone-900 bg-stone-900 text-white' 
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-900 mb-3">Ebat Seçimi</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedSize === size 
                            ? 'border-stone-900 bg-stone-900 text-white' 
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {product.stock !== undefined && (
                <div className="text-sm font-medium">
                  {product.stock > 0 ? (
                    <span className="text-green-600">Stokta Var ({product.stock} adet)</span>
                  ) : (
                    <span className="text-red-600">Stokta Yok</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-stone-200">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white transition-colors shadow-lg ${
                product.stock === 0 
                  ? 'bg-stone-400 cursor-not-allowed' 
                  : 'bg-stone-900 hover:bg-stone-800 shadow-stone-900/20'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
            </button>

            <button 
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t('order_via_whatsapp', 'WhatsApp ile Sipariş Ver')}
            </button>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {product.trendyol_url && (
                <a 
                  href={product.trendyol_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl text-stone-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-600 transition-colors border border-orange-200"
                >
                  Trendyol <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
              {product.etsy_url && (
                <a 
                  href={product.etsy_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl text-stone-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-600 transition-colors border border-orange-200"
                >
                  Etsy <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
              {product.amazon_url && (
                <a 
                  href={product.amazon_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 transition-colors border border-stone-200"
                >
                  Amazon <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
