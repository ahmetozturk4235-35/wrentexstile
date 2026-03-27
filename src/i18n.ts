import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: {
          home: "Ana Sayfa",
          about: "Hakkımızda",
          services: "Hizmetlerimiz",
          products: "Ürünlerimiz",
          contact: "İletişim",
          admin: "Yönetici Paneli",
          admin_dashboard: "Yönetici Paneli",
          categories: "Kategoriler",
          add_category: "Kategori Ekle",
          edit: "Düzenle",
          delete: "Sil",
          save: "Kaydet",
          cancel: "İptal",
          name_tr: "Ad (Türkçe)",
          name_en: "Ad (İngilizce)",
          name_ar: "Ad (Arapça)",
          add_product: "Ürün Ekle",
          price: "Fiyat",
          image_url: "Görsel URL",
          description_tr: "Açıklama (Türkçe)",
          description_en: "Açıklama (İngilizce)",
          description_ar: "Açıklama (Arapça)",
          category: "Kategori",
          content_management: "İçerik Yönetimi",
          about_us_content: "Hakkımızda İçeriği",
          services_content: "Hizmetlerimiz İçeriği",
          update: "Güncelle",
          language: "Dil",
          buy_now: "Satın Al",
          all_products: "Tüm Ürünler",
          hero_title: "Wrentexstile ile Kaliteyi Hissedin",
          hero_subtitle: "Profesyoneller için özel tasarım önlükler ve tekstil ürünleri.",
          view_products: "Ürünleri İncele",
          order_via_whatsapp: "WhatsApp ile Sipariş Ver"
        }
      },
      en: {
        translation: {
          home: "Home",
          about: "About Us",
          services: "Services",
          products: "Products",
          contact: "Contact",
          admin: "Admin Panel",
          admin_dashboard: "Admin Dashboard",
          categories: "Categories",
          add_category: "Add Category",
          edit: "Edit",
          delete: "Delete",
          save: "Save",
          cancel: "Cancel",
          name_tr: "Name (Turkish)",
          name_en: "Name (English)",
          name_ar: "Name (Arabic)",
          add_product: "Add Product",
          price: "Price",
          image_url: "Image URL",
          description_tr: "Description (Turkish)",
          description_en: "Description (English)",
          description_ar: "Description (Arabic)",
          category: "Category",
          content_management: "Content Management",
          about_us_content: "About Us Content",
          services_content: "Services Content",
          update: "Update",
          language: "Language",
          buy_now: "Buy Now",
          all_products: "All Products",
          hero_title: "Feel the Quality with Wrentexstile",
          hero_subtitle: "Custom designed aprons and textile products for professionals.",
          view_products: "View Products",
          order_via_whatsapp: "Order via WhatsApp"
        }
      },
      ar: {
        translation: {
          home: "الرئيسية",
          about: "معلومات عنا",
          services: "خدماتنا",
          products: "منتجاتنا",
          contact: "اتصل بنا",
          admin: "لوحة الإدارة",
          admin_dashboard: "لوحة الإدارة",
          categories: "فئات",
          add_category: "إضافة فئة",
          edit: "تعديل",
          delete: "حذف",
          save: "حفظ",
          cancel: "إلغاء",
          name_tr: "الاسم (التركية)",
          name_en: "الاسم (الإنجليزية)",
          name_ar: "الاسم (العربية)",
          add_product: "إضافة منتج",
          price: "السعر",
          image_url: "رابط الصورة",
          description_tr: "الوصف (التركية)",
          description_en: "الوصف (الإنجليزية)",
          description_ar: "الوصف (العربية)",
          category: "فئة",
          content_management: "إدارة المحتوى",
          about_us_content: "محتوى معلومات عنا",
          services_content: "محتوى خدماتنا",
          update: "تحديث",
          language: "لغة",
          buy_now: "اشتري الآن",
          all_products: "جميع المنتجات",
          hero_title: "اشعر بالجودة مع Wrentexstile",
          hero_subtitle: "مآزر مصممة خصيصًا ومنتجات نسيجية للمحترفين.",
          view_products: "عرض المنتجات",
          order_via_whatsapp: "اطلب عبر الواتساب"
        }
      }
    },
    lng: "tr",
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
