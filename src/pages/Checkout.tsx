import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentHtml, setPaymentHtml] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    identityNumber: '',
    address: '',
    city: '',
    country: 'Turkey',
    zipCode: ''
  });

  const currentLang = i18n.language as 'tr' | 'en' | 'ar';

  if (items.length === 0 && !paymentHtml) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer: formData,
          items: items.map(item => ({
            id: item.product.id,
            name: item.product[`name_${currentLang}`],
            category: item.product[`category_name_${currentLang}`],
            price: item.product.price,
            quantity: item.quantity
          })),
          totalPrice: total
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPaymentHtml(data.checkoutFormContent);
        // Clear cart after successful initialization (or later after callback)
        // clearCart(); 
      } else {
        setError(data.errorMessage || 'Ödeme başlatılırken bir hata oluştu.');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (paymentHtml) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif font-bold mb-8 text-stone-900 text-center">Güvenli Ödeme</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
          <div dangerouslySetInnerHTML={{ __html: paymentHtml }} />
          <div id="iyzipay-checkout-form" className="responsive"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-stone-900">Ödeme Bilgileri</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
              Kişisel Bilgiler
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Ad</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Soyad</label>
                <input required type="text" name="surname" value={formData.surname} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">E-posta</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Telefon (örn: +905551234567)</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-2">TC Kimlik No (Fatura için zorunlu)</label>
                <input required type="text" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-2">Adres</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Şehir</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Posta Kodu</label>
                <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all" />
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-stone-900 hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Güvenli Ödemeye Geç
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-stone-50 p-8 rounded-2xl h-fit sticky top-24">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Sipariş Özeti</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}x {item.product[`name_${currentLang}`]}</span>
                <span className="font-medium text-stone-900">₺{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-4 space-y-4 text-stone-600 mb-6">
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
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500 mt-6">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit SSL ile güvenli ödeme (Iyzico)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
