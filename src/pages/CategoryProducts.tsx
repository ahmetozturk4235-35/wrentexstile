import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

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
}

export default function CategoryProducts() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products?category_id=${id}`),
          fetch('/api/categories')
        ]);
        
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          
          setProducts(productsData);
          const currentCategory = categoriesData.find((c: Category) => c.id === parseInt(id || '0'));
          setCategory(currentCategory || null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  const currentLang = i18n.language as 'tr' | 'en' | 'ar';
  const categoryName = category ? category[`name_${currentLang}` as keyof Category] as string : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold mb-4 text-stone-900">{categoryName}</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          {t('products')}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-stone-500 py-12">
          Bu kategoride henüz ürün bulunmamaktadır.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col"
            >
              <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-stone-100 relative">
                <img
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
                  alt={product[`name_${currentLang}` as keyof Product] as string}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${product.id}/600/600`; }}
                />
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 hover:text-stone-600 transition-colors">
                    {product[`name_${currentLang}` as keyof Product] as string}
                  </h3>
                </Link>
                <p className="text-stone-600 text-sm mb-4 line-clamp-2 flex-grow">
                  {product[`description_${currentLang}` as keyof Product] as string}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                  <span className="text-2xl font-serif font-bold text-stone-900">
                    ₺{product.price.toFixed(2)}
                  </span>
                  <Link to={`/product/${product.id}`} className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors">
                    {t('buy_now')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
