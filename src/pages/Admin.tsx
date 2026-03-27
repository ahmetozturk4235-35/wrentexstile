import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Save, X, BarChart3, Eye, ShoppingCart, MousePointerClick, ImageOff, Upload, Loader2 } from 'lucide-react';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23a8a29e"%3E%3Crect width="200" height="200" fill="%23e7e5e4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14" font-family="sans-serif"%3EGörsel Yok%3C/text%3E%3C/svg%3E';

function ImgWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src || FALLBACK_IMG}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== FALLBACK_IMG) {
          target.src = FALLBACK_IMG;
        }
      }}
    />
  );
}

function ImagePreview({ url }: { url: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!url || !url.trim()) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    const img = new Image();
    img.onload = () => setStatus('ok');
    img.onerror = () => setStatus('error');
    img.src = url;
  }, [url]);

  if (!url || !url.trim()) return null;

  return (
    <div className="mt-2">
      {status === 'loading' && (
        <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">Yükleniyor...</div>
      )}
      {status === 'ok' && (
        <img src={url} alt="Önizleme" className="w-20 h-20 object-cover rounded-lg border border-green-300" />
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
          <ImageOff className="w-4 h-4" />
          <span>Görsel yüklenemedi. Lütfen doğrudan görsel bağlantısı (URL) kullanın.</span>
        </div>
      )}
    </div>
  );
}

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onUploaded(data.url);
      } else {
        alert(data.error || 'Yükleme hatası');
      }
    } catch (err) {
      alert('Görsel yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...</>
        ) : (
          <><Upload className="w-4 h-4" /> Dosya Yükle</>
        )}
      </button>
    </div>
  );
}

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  image_url: string;
}

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
  image_urls: string[];
  amazon_url: string;
  etsy_url: string;
  trendyol_url: string;
  colors: string[];
  sizes: string[];
  stock: number;
}

interface Content {
  [key: string]: {
    tr: string;
    en: string;
    ar: string;
  };
}

interface Analytics {
  totalVisits: number;
  products: {
    id: number;
    name_tr: string;
    views: number;
    cart_adds: number;
  }[];
}

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'content' | 'analytics'>('products');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Content>({});
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);

  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, contRes, analyticsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/content'),
        fetch('/api/analytics')
      ]);
      setCategories(await catRes.json());
      setProducts(await prodRes.json());
      setContent(await contRes.json());
      setAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const method = editingCategory.id === 0 ? 'POST' : 'PUT';
    const url = editingCategory.id === 0 ? '/api/categories' : `/api/categories/${editingCategory.id}`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCategory)
    });

    setEditingCategory(null);
    fetchData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Emin misiniz? Bu kategoriye ait tüm ürünler de silinecektir.')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const method = editingProduct.id === 0 ? 'POST' : 'PUT';
    const url = editingProduct.id === 0 ? '/api/products' : `/api/products/${editingProduct.id}`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });

    setEditingProduct(null);
    fetchData();
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Emin misiniz?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Content Actions
  const handleSaveContent = async (key: string) => {
    await fetch(`/api/content/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content[key])
    });
    alert('İçerik güncellendi.');
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-stone-900">{t('admin_dashboard')}</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-stone-200 mb-8 overflow-x-auto">
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'products' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
          onClick={() => setActiveTab('products')}
        >
          {t('products')}
        </button>
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
          onClick={() => setActiveTab('categories')}
        >
          {t('categories')}
        </button>
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'content' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
          onClick={() => setActiveTab('content')}
        >
          İçerik Yönetimi
        </button>
        <button
          className={`pb-4 px-4 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'analytics' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="w-4 h-4" />
          İstatistikler
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-900">{t('products')}</h2>
              <button
                onClick={() => setEditingProduct({ id: 0, category_id: categories[0]?.id || 0, name_tr: '', name_en: '', name_ar: '', description_tr: '', description_en: '', description_ar: '', price: 0, image_url: '', image_urls: [], amazon_url: '', etsy_url: '', trendyol_url: '', colors: [], sizes: [], stock: 0 })}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> {t('add_product')}
              </button>
            </div>

            {editingProduct && (
              <form onSubmit={handleSaveProduct} className="mb-8 bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('category')}</label>
                    <select
                      value={editingProduct.category_id}
                      onChange={e => setEditingProduct({...editingProduct, category_id: parseInt(e.target.value)})}
                      className="w-full p-2 border border-stone-300 rounded-md bg-white"
                      required
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('price')} (₺)</label>
                    <input
                      type="number" step="0.01"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      className="w-full p-2 border border-stone-300 rounded-md" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_tr')}</label>
                    <input type="text" value={editingProduct.name_tr} onChange={e => setEditingProduct({...editingProduct, name_tr: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_en')}</label>
                    <input type="text" value={editingProduct.name_en} onChange={e => setEditingProduct({...editingProduct, name_en: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_ar')}</label>
                    <input type="text" value={editingProduct.name_ar} onChange={e => setEditingProduct({...editingProduct, name_ar: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('image_url')} (Ana Görsel)</label>
                    <div className="flex gap-2">
                      <input type="text" value={editingProduct.image_url || ''} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} className="flex-1 p-2 border border-stone-300 rounded-md" placeholder="https://example.com/gorsel.jpg veya dosya yükleyin" />
                      <ImageUploadButton onUploaded={(url) => setEditingProduct({...editingProduct, image_url: url})} />
                    </div>
                    <ImagePreview url={editingProduct.image_url || ''} />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-stone-700">Ek Görseller (Her satıra bir URL)</label>
                      <ImageUploadButton onUploaded={(url) => setEditingProduct({...editingProduct, image_urls: [...(editingProduct.image_urls || []), url]})} />
                    </div>
                    <textarea
                      value={editingProduct.image_urls?.join('\n') || ''}
                      onChange={e => setEditingProduct({...editingProduct, image_urls: e.target.value.split('\n').filter(url => url.trim() !== '')})}
                      className="w-full p-2 border border-stone-300 rounded-md"
                      rows={3}
                      placeholder={"https://example.com/gorsel1.jpg\nhttps://example.com/gorsel2.jpg"}
                    />
                    {editingProduct.image_urls && editingProduct.image_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {editingProduct.image_urls.map((url, idx) => (
                          <ImagePreview key={idx} url={url} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Amazon URL</label>
                    <input type="text" value={editingProduct.amazon_url || ''} onChange={e => setEditingProduct({...editingProduct, amazon_url: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Etsy URL</label>
                    <input type="text" value={editingProduct.etsy_url || ''} onChange={e => setEditingProduct({...editingProduct, etsy_url: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Trendyol URL</label>
                    <input type="text" value={editingProduct.trendyol_url || ''} onChange={e => setEditingProduct({...editingProduct, trendyol_url: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Stok Adedi</label>
                    <input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Renk Seçenekleri (Virgülle ayırın)</label>
                    <input
                      type="text"
                      value={editingProduct.colors?.join(', ') || ''}
                      onChange={e => setEditingProduct({...editingProduct, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="w-full p-2 border border-stone-300 rounded-md"
                      placeholder="Kırmızı, Mavi, Siyah"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Ebat Seçenekleri (Virgülle ayırın)</label>
                    <input
                      type="text"
                      value={editingProduct.sizes?.join(', ') || ''}
                      onChange={e => setEditingProduct({...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className="w-full p-2 border border-stone-300 rounded-md"
                      placeholder="S, M, L, XL veya 40x40, 50x50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('description_tr')}</label>
                    <textarea value={editingProduct.description_tr} onChange={e => setEditingProduct({...editingProduct, description_tr: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('description_en')}</label>
                    <textarea value={editingProduct.description_en} onChange={e => setEditingProduct({...editingProduct, description_en: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('description_ar')}</label>
                    <textarea value={editingProduct.description_ar} onChange={e => setEditingProduct({...editingProduct, description_ar: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" rows={2} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900">{t('cancel')}</button>
                  <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center">
                    <Save className="w-4 h-4 mr-2" /> {t('save')}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Görsel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ürün Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ImgWithFallback src={p.image_url} alt={p.name_tr} className="w-12 h-12 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{p.name_tr}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{categories.find(c => c.id === p.category_id)?.name_tr}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">₺{p.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setEditingProduct(p)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-900">{t('categories')}</h2>
              <button
                onClick={() => setEditingCategory({ id: 0, name_tr: '', name_en: '', name_ar: '', image_url: '' })}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> {t('add_category')}
              </button>
            </div>

            {editingCategory && (
              <form onSubmit={handleSaveCategory} className="mb-8 bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_tr')}</label>
                    <input type="text" value={editingCategory.name_tr} onChange={e => setEditingCategory({...editingCategory, name_tr: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_en')}</label>
                    <input type="text" value={editingCategory.name_en} onChange={e => setEditingCategory({...editingCategory, name_en: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t('name_ar')}</label>
                    <input type="text" value={editingCategory.name_ar} onChange={e => setEditingCategory({...editingCategory, name_ar: e.target.value})} className="w-full p-2 border border-stone-300 rounded-md" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Görsel URL</label>
                    <div className="flex gap-2">
                      <input type="text" value={editingCategory.image_url || ''} onChange={e => setEditingCategory({...editingCategory, image_url: e.target.value})} className="flex-1 p-2 border border-stone-300 rounded-md" placeholder="https://example.com/gorsel.jpg veya dosya yükleyin" />
                      <ImageUploadButton onUploaded={(url) => setEditingCategory({...editingCategory, image_url: url})} />
                    </div>
                    <ImagePreview url={editingCategory.image_url || ''} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900">{t('cancel')}</button>
                  <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center">
                    <Save className="w-4 h-4 mr-2" /> {t('save')}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Görsel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Türkçe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">English</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">العربية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ImgWithFallback src={c.image_url} alt={c.name_tr} className="w-12 h-12 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{c.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{c.name_tr}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{c.name_en}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{c.name_ar}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setEditingCategory(c)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            {Object.keys(content).map(key => {
              const isImage = key.includes('image');
              const isUrl = isImage || key.includes('social');
              return (
              <div key={key} className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4 capitalize">{key.replace(/_/g, ' ')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Türkçe</label>
                    {isUrl ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={content[key].tr}
                            onChange={e => setContent({...content, [key]: {...content[key], tr: e.target.value}})}
                            className="flex-1 p-3 border border-stone-300 rounded-md"
                            placeholder="https://example.com/gorsel.jpg"
                          />
                          {isImage && <ImageUploadButton onUploaded={(url) => setContent({...content, [key]: {...content[key], tr: url}})} />}
                        </div>
                        {isImage && <ImagePreview url={content[key].tr} />}
                      </>
                    ) : (
                      <textarea
                        value={content[key].tr}
                        onChange={e => setContent({...content, [key]: {...content[key], tr: e.target.value}})}
                        className="w-full p-3 border border-stone-300 rounded-md" rows={4}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">English</label>
                    {isUrl ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={content[key].en}
                            onChange={e => setContent({...content, [key]: {...content[key], en: e.target.value}})}
                            className="flex-1 p-3 border border-stone-300 rounded-md"
                            placeholder="https://example.com/image.jpg"
                          />
                          {isImage && <ImageUploadButton onUploaded={(url) => setContent({...content, [key]: {...content[key], en: url}})} />}
                        </div>
                        {isImage && <ImagePreview url={content[key].en} />}
                      </>
                    ) : (
                      <textarea
                        value={content[key].en}
                        onChange={e => setContent({...content, [key]: {...content[key], en: e.target.value}})}
                        className="w-full p-3 border border-stone-300 rounded-md" rows={4}
                      />
                    )}
                  </div>
                  <div dir="rtl">
                    <label className="block text-sm font-medium text-stone-700 mb-1 text-right">العربية</label>
                    {isUrl ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={content[key].ar}
                            onChange={e => setContent({...content, [key]: {...content[key], ar: e.target.value}})}
                            className="flex-1 p-3 border border-stone-300 rounded-md text-right"
                            placeholder="https://example.com/image.jpg"
                          />
                          {isImage && <ImageUploadButton onUploaded={(url) => setContent({...content, [key]: {...content[key], ar: url}})} />}
                        </div>
                        {isImage && <ImagePreview url={content[key].ar} />}
                      </>
                    ) : (
                      <textarea
                        value={content[key].ar}
                        onChange={e => setContent({...content, [key]: {...content[key], ar: e.target.value}})}
                        className="w-full p-3 border border-stone-300 rounded-md text-right" rows={4}
                      />
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveContent(key)}
                      className="bg-stone-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" /> {t('update')}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-stone-900">İstatistikler</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500">Toplam Site Ziyareti</p>
                    <p className="text-3xl font-bold text-stone-900">{analytics.totalVisits}</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500">Toplam Sepete Ekleme</p>
                    <p className="text-3xl font-bold text-stone-900">
                      {analytics.products.reduce((acc, p) => acc + (p.cart_adds || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <MousePointerClick className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500">Toplam Ürün Görüntüleme</p>
                    <p className="text-3xl font-bold text-stone-900">
                      {analytics.products.reduce((acc, p) => acc + (p.views || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
                <h3 className="font-bold text-stone-900">Ürün Performansı</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ürün Adı</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Görüntülenme</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Sepete Eklenme</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Dönüşüm Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200">
                    {analytics.products.map((p) => {
                      const conversionRate = p.views > 0 ? ((p.cart_adds / p.views) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{p.name_tr}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 text-right">{p.views || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 text-right">{p.cart_adds || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              parseFloat(conversionRate) > 5 ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'
                            }`}>
                              %{conversionRate}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
