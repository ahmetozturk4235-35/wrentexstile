import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();
  const currentLang = i18n.language as 'tr' | 'en' | 'ar';

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Sepetiniz Boş</h2>
        <p className="text-stone-500 mb-8">Sepetinizde henüz ürün bulunmamaktadır.</p>
        <Link to="/#categories" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-stone-900 hover:bg-stone-800 transition-colors">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-stone-900">Sepetim</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, index) => (
            <div key={`${item.product.id}-${item.color}-${item.size}-${index}`} className="flex gap-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
              <img
                src={item.product.image_url || `https://picsum.photos/seed/${item.product.id}/200/200`}
                alt={item.product[`name_${currentLang}`]}
                className="w-24 h-24 object-cover rounded-xl"
                onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${item.product.id}/200/200`; }}
              />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{item.product[`name_${currentLang}`]}</h3>
                    <p className="text-stone-500 text-sm mt-1">{item.product[`category_name_${currentLang}`]}</p>
                    {(item.color || item.size) && (
                      <p className="text-stone-600 text-sm mt-2 flex items-center gap-2">
                        {item.color && <span className="bg-stone-100 px-2 py-1 rounded-md">Renk: {item.color}</span>}
                        {item.size && <span className="bg-stone-100 px-2 py-1 rounded-md">Ebat: {item.size}</span>}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.color, item.size)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.color, item.size)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.color, item.size)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-lg">₺{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-stone-50 p-8 rounded-2xl h-fit sticky top-24">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Sipariş Özeti</h2>
          <div className="space-y-4 text-stone-600 mb-6">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span>₺{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kargo</span>
              <span>Ücretsiz</span>
            </div>
            <div className="border-t border-stone-200 pt-4 flex justify-between font-bold text-stone-900 text-lg">
              <span>Toplam</span>
              <span>₺{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            Ödemeye Geç <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
