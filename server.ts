import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import Iyzipay from 'iyzipay';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cloudinary initialization
let cloudinaryConfigured = false;
try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    cloudinaryConfigured = true;
    console.log('Cloudinary connected:', cloudName);
  } else {
    console.log('Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  }
} catch (err: any) {
  console.error('Cloudinary init error:', err.message);
}

// Multer setup for file uploads (temporary storage in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece görsel dosyaları yüklenebilir.'));
    }
  }
});

const db = new Database('database.sqlite');

// Initialize Iyzipay
let iyzipay: Iyzipay | null = null;
export function getIyzipay() {
  if (!iyzipay) {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    if (apiKey && secretKey) {
      iyzipay = new Iyzipay({
        apiKey: apiKey,
        secretKey: secretKey,
        uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
      });
    }
  }
  return iyzipay;
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_tr TEXT,
    description_en TEXT,
    description_ar TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    amazon_url TEXT,
    etsy_url TEXT,
    trendyol_url TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value_tr TEXT,
    value_en TEXT,
    value_ar TEXT
  );

  CREATE TABLE IF NOT EXISTS site_visits (
    date TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0
  );
`);

// Add new columns if they don't exist (for existing DBs)
const addColumnIfNotExists = (table: string, column: string, type: string) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      console.error(`Error adding column ${column} to ${table}:`, e);
    }
  }
};

addColumnIfNotExists('products', 'amazon_url', 'TEXT');
addColumnIfNotExists('products', 'etsy_url', 'TEXT');
addColumnIfNotExists('products', 'trendyol_url', 'TEXT');
addColumnIfNotExists('products', 'image_urls', 'TEXT');
addColumnIfNotExists('categories', 'image_url', 'TEXT');

// New columns for variants and analytics
addColumnIfNotExists('products', 'colors', 'TEXT');
addColumnIfNotExists('products', 'sizes', 'TEXT');
addColumnIfNotExists('products', 'stock', 'INTEGER DEFAULT 0');
addColumnIfNotExists('products', 'views', 'INTEGER DEFAULT 0');
addColumnIfNotExists('products', 'cart_adds', 'INTEGER DEFAULT 0');

// Seed initial data if empty (check categories to determine if this is a fresh DB)
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (catCount.count === 0) {
  const insertContent = db.prepare('INSERT INTO content (key, value_tr, value_en, value_ar) VALUES (?, ?, ?, ?)');
  insertContent.run(
    'about_us',
    'Wrentexstile olarak, tekstil sektöründeki köklü tecrübemizle en kaliteli ürünleri sizlerle buluşturuyoruz. Üretim yelpazemizde yer alan okul sıra örtüsü, barista önlükleri, mutfak ve şef önlükleri, garson ve ressam önlükleri ile profesyonellerin ihtiyaçlarına şık çözümler sunuyoruz. Ayrıca çocuk ikaz yeleği ve zarif masa örtüsü çeşitlerimizle tekstile dair ürünler konusunda geniş bir yelpazeye sahibiz. Trendyol, Etsy ve Amazon üzerinden Amerika ve BAE (Birleşik Arap Emirlikleri) başta olmak üzere tüm dünyaya gururla ihracat yapıyoruz. Modern tasarımlarımız ve dayanıklı kumaşlarımızla Wrentexstile kalitesini her dikişte hissedeceksiniz.',
    'As Wrentexstile, we bring you the highest quality products with our deep-rooted experience in the textile industry. We offer stylish solutions to the needs of professionals with our school desk covers, barista aprons, kitchen and chef aprons, waiter and painter aprons in our production range. We also have a wide range of textile products with our children\'s warning vests and elegant tablecloth varieties. We proudly export all over the world, especially to the USA and UAE (United Arab Emirates), via Trendyol, Etsy, and Amazon. You will feel the Wrentexstile quality in every stitch with our modern designs and durable fabrics.',
    'بصفتنا Wrentexstile، نقدم لك منتجات بأعلى جودة من خلال خبرتنا العميقة في صناعة النسيج. نقدم حلولاً أنيقة لاحتياجات المحترفين من خلال أغطية مقاعد المدارس، ومآزر الباريستا، ومآزر المطبخ والطهاة، ومآزر النوادل والرسامين في مجموعة إنتاجنا. لدينا أيضًا مجموعة واسعة من منتجات النسيج مع سترات تحذير الأطفال وأنواع مفارش المائدة الأنيقة. نحن نفخر بالتصدير إلى جميع أنحاء العالم، وخاصة إلى الولايات المتحدة الأمريكية والإمارات العربية المتحدة، عبر Trendyol و Etsy و Amazon. ستشعر بجودة Wrentexstile في كل غرزة مع تصميماتنا الحديثة وأقمشتنا المتينة.'
  );
  insertContent.run(
    'services',
    'Wrentexstile olarak, tekstile dair ürünler üretiminde öncü markalardan biriyiz. Kurumsal ve bireysel müşterilerimiz için özel tasarım okul sıra örtüsü, profesyonel mutfaklar için şef ve barista önlükleri, restoranlar için garson önlükleri ve sanatçılar için ressam önlükleri üretiyoruz. Güvenlik standartlarına uygun çocuk ikaz yeleği ve mekanlarınıza şıklık katacak masa örtüsü tasarımlarımızla hizmetinizdeyiz. E-ticaret platformları Trendyol, Etsy ve Amazon aracılığıyla, Amerika ve BAE pazarları dahil olmak üzere global çapta hızlı ve güvenilir teslimat sağlıyoruz.',
    'As Wrentexstile, we are one of the leading brands in the production of textile products. We produce custom-designed school desk covers for our corporate and individual customers, chef and barista aprons for professional kitchens, waiter aprons for restaurants, and painter aprons for artists. We are at your service with our children\'s warning vests that comply with safety standards and tablecloth designs that will add elegance to your spaces. Through e-commerce platforms Trendyol, Etsy, and Amazon, we provide fast and reliable delivery globally, including the US and UAE markets.',
    'بصفتنا Wrentexstile، نحن إحدى العلامات التجارية الرائدة في إنتاج منتجات النسيج. نحن ننتج أغطية مقاعد مدرسية مصممة خصيصًا لعملائنا من الشركات والأفراد، ومآزر طهاة وباريستا للمطابخ الاحترافية، ومآزر نوادل للمطاعم، ومآزر رسامين للفنانين. نحن في خدمتك من خلال سترات تحذير الأطفال التي تتوافق مع معايير السلامة وتصميمات مفارش المائدة التي ستضفي أناقة على مساحاتك. من خلال منصات التجارة الإلكترونية Trendyol و Etsy و Amazon، نقدم توصيلًا سريعًا وموثوقًا على مستوى العالم، بما في ذلك أسواق الولايات المتحدة والإمارات العربية المتحدة.'
  );

  insertContent.run(
    'hero_title',
    'Wrentexstile ile Kaliteyi Hissedin',
    'Feel the Quality with Wrentexstile',
    'اشعر بالجودة مع Wrentexstile'
  );
  insertContent.run(
    'hero_subtitle',
    'Profesyoneller için özel tasarım önlükler ve tekstil ürünleri.',
    'Custom designed aprons and textile products for professionals.',
    'مآزر مصممة خصيصًا ومنتجات نسيجية للمحترفين.'
  );
  insertContent.run(
    'hero_image',
    'https://picsum.photos/seed/textile/1920/1080?blur=2',
    'https://picsum.photos/seed/textile/1920/1080?blur=2',
    'https://picsum.photos/seed/textile/1920/1080?blur=2'
  );
  insertContent.run(
    'about_us_image',
    'https://picsum.photos/seed/about/800/1000',
    'https://picsum.photos/seed/about/800/1000',
    'https://picsum.photos/seed/about/800/1000'
  );
  insertContent.run(
    'services_image',
    'https://picsum.photos/seed/services/1920/1080?blur=2',
    'https://picsum.photos/seed/services/1920/1080?blur=2',
    'https://picsum.photos/seed/services/1920/1080?blur=2'
  );
  const insertCategory = db.prepare('INSERT INTO categories (name_tr, name_en, name_ar, image_url) VALUES (?, ?, ?, ?)');
  const cat1 = insertCategory.run('Önlükler', 'Aprons', 'مآزر', 'https://picsum.photos/seed/cat1/600/600');
  const cat2 = insertCategory.run('Masa Örtüleri', 'Tablecloths', 'مفارش المائدة', 'https://picsum.photos/seed/cat2/600/600');
  const cat3 = insertCategory.run('Okul Ürünleri', 'School Products', 'منتجات مدرسية', 'https://picsum.photos/seed/cat3/600/600');
  const cat4 = insertCategory.run('İş Güvenliği', 'Work Safety', 'سلامة العمل', 'https://picsum.photos/seed/cat4/600/600');

  const insertProduct = db.prepare('INSERT INTO products (category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertProduct.run(cat1.lastInsertRowid, 'Barista Önlüğü', 'Barista Apron', 'مئزر باريستا', 'Şık ve dayanıklı barista önlüğü.', 'Stylish and durable barista apron.', 'مريلة باريستا أنيقة ومتينة.', 250, 'https://picsum.photos/seed/apron1/600/600');
  insertProduct.run(cat1.lastInsertRowid, 'Şef Önlüğü', 'Chef Apron', 'مئزر الشيف', 'Profesyonel mutfaklar için şef önlüğü.', 'Chef apron for professional kitchens.', 'مريلة طاهٍ للمطابخ الاحترافية.', 300, 'https://picsum.photos/seed/apron2/600/600');
  insertProduct.run(cat2.lastInsertRowid, 'Zarif Masa Örtüsü', 'Elegant Tablecloth', 'مفرش طاولة أنيق', 'Leke tutmaz masa örtüsü.', 'Stain-resistant tablecloth.', 'مفرش طاولة مقاوم للبقع.', 150, 'https://picsum.photos/seed/tablecloth/600/600');
  insertProduct.run(cat3.lastInsertRowid, 'Okul Sıra Örtüsü', 'School Desk Cover', 'غطاء مقعد المدرسة', 'Dayanıklı okul sıra örtüsü.', 'Durable school desk cover.', 'غطاء مكتب مدرسي متين.', 100, 'https://picsum.photos/seed/deskcover/600/600');
  insertProduct.run(cat4.lastInsertRowid, 'Çocuk İkaz Yeleği', 'Children\'s Warning Vest', 'سترة تحذير للأطفال', 'Fosforlu çocuk ikaz yeleği.', 'Phosphorescent children\'s warning vest.', 'سترة تحذير فسفورية للأطفال.', 80, 'https://picsum.photos/seed/vest/600/600');
}

// Add extra content keys if they don't exist (for existing DBs)
const insertContentIfNotExists = db.prepare('INSERT OR IGNORE INTO content (key, value_tr, value_en, value_ar) VALUES (?, ?, ?, ?)');
insertContentIfNotExists.run('hero_image', 'https://picsum.photos/seed/textile/1920/1080?blur=2', 'https://picsum.photos/seed/textile/1920/1080?blur=2', 'https://picsum.photos/seed/textile/1920/1080?blur=2');
insertContentIfNotExists.run('about_us_image', 'https://picsum.photos/seed/about/800/1000', 'https://picsum.photos/seed/about/800/1000', 'https://picsum.photos/seed/about/800/1000');
insertContentIfNotExists.run('services_image', 'https://picsum.photos/seed/services/1920/1080?blur=2', 'https://picsum.photos/seed/services/1920/1080?blur=2', 'https://picsum.photos/seed/services/1920/1080?blur=2');
insertContentIfNotExists.run('social_whatsapp', '#', '#', '#');
insertContentIfNotExists.run('social_trendyol', '#', '#', '#');
insertContentIfNotExists.run('social_hepsiburada', '#', '#', '#');
insertContentIfNotExists.run('social_amazon', '#', '#', '#');
insertContentIfNotExists.run('social_etsy', '#', '#', '#');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Image Upload API
  app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Görsel dosyası gerekli.' });
      }

      if (!cloudinaryConfigured) {
        return res.status(500).json({ error: 'Cloudinary yapılandırılmamış. .env dosyasını kontrol edin.' });
      }

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'wrentexstile' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      res.json({ url: result.secure_url });
    } catch (err: any) {
      console.error('Upload error:', err.message);
      res.status(500).json({ error: 'Görsel yükleme hatası: ' + err.message });
    }
  });

  // API Routes
  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    const { name_tr, name_en, name_ar, image_url } = req.body;
    const stmt = db.prepare('INSERT INTO categories (name_tr, name_en, name_ar, image_url) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name_tr, name_en, name_ar, image_url);
    res.json({ id: result.lastInsertRowid, name_tr, name_en, name_ar, image_url });
  });

  app.put('/api/categories/:id', (req, res) => {
    const { name_tr, name_en, name_ar, image_url } = req.body;
    const stmt = db.prepare('UPDATE categories SET name_tr = ?, name_en = ?, name_ar = ?, image_url = ? WHERE id = ?');
    stmt.run(name_tr, name_en, name_ar, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/categories/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE category_id = ?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/products', (req, res) => {
    const categoryId = req.query.category_id;
    let products;
    if (categoryId) {
      products = db.prepare('SELECT p.*, c.name_tr as category_name_tr, c.name_en as category_name_en, c.name_ar as category_name_ar FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ?').all(categoryId);
    } else {
      products = db.prepare('SELECT p.*, c.name_tr as category_name_tr, c.name_en as category_name_en, c.name_ar as category_name_ar FROM products p LEFT JOIN categories c ON p.category_id = c.id').all();
    }

    products = products.map((p: any) => ({
      ...p,
      image_urls: p.image_urls ? JSON.parse(p.image_urls) : (p.image_url ? [p.image_url] : []),
      colors: p.colors ? JSON.parse(p.colors) : [],
      sizes: p.sizes ? JSON.parse(p.sizes) : []
    }));

    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product: any = db.prepare('SELECT p.*, c.name_tr as category_name_tr, c.name_en as category_name_en, c.name_ar as category_name_ar FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(req.params.id);
    if (product) {
      product.image_urls = product.image_urls ? JSON.parse(product.image_urls) : (product.image_url ? [product.image_url] : []);
      product.colors = product.colors ? JSON.parse(product.colors) : [];
      product.sizes = product.sizes ? JSON.parse(product.sizes) : [];
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.post('/api/products', (req, res) => {
    const { category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url, image_urls, amazon_url, etsy_url, trendyol_url, colors, sizes, stock } = req.body;
    const stmt = db.prepare('INSERT INTO products (category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url, image_urls, amazon_url, etsy_url, trendyol_url, colors, sizes, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url, image_urls ? JSON.stringify(image_urls) : null, amazon_url, etsy_url, trendyol_url, colors ? JSON.stringify(colors) : null, sizes ? JSON.stringify(sizes) : null, stock || 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/products/:id', (req, res) => {
    const { category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url, image_urls, amazon_url, etsy_url, trendyol_url, colors, sizes, stock } = req.body;
    const stmt = db.prepare('UPDATE products SET category_id = ?, name_tr = ?, name_en = ?, name_ar = ?, description_tr = ?, description_en = ?, description_ar = ?, price = ?, image_url = ?, image_urls = ?, amazon_url = ?, etsy_url = ?, trendyol_url = ?, colors = ?, sizes = ?, stock = ? WHERE id = ?');
    stmt.run(category_id, name_tr, name_en, name_ar, description_tr, description_en, description_ar, price, image_url, image_urls ? JSON.stringify(image_urls) : null, amazon_url, etsy_url, trendyol_url, colors ? JSON.stringify(colors) : null, sizes ? JSON.stringify(sizes) : null, stock || 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/content', (req, res) => {
    const content = db.prepare('SELECT * FROM content').all();
    const result: any = {};
    for (const item of content as any[]) {
      result[item.key] = {
        tr: item.value_tr,
        en: item.value_en,
        ar: item.value_ar
      };
    }
    res.json(result);
  });

  app.put('/api/content/:key', (req, res) => {
    const { tr, en, ar } = req.body;
    const stmt = db.prepare('UPDATE content SET value_tr = ?, value_en = ?, value_ar = ? WHERE key = ?');
    stmt.run(tr, en, ar, req.params.key);
    res.json({ success: true });
  });

  // Analytics APIs
  app.post('/api/analytics/visit', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`INSERT INTO site_visits (date, count) VALUES (?, 1) ON CONFLICT(date) DO UPDATE SET count = count + 1`).run(today);
    res.json({ success: true });
  });

  app.post('/api/analytics/view/:id', (req, res) => {
    db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/analytics/cart/:id', (req, res) => {
    db.prepare('UPDATE products SET cart_adds = cart_adds + 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/analytics', (req, res) => {
    const totalVisits = db.prepare('SELECT SUM(count) as total FROM site_visits').get() as { total: number };
    const productsStats = db.prepare('SELECT id, name_tr, views, cart_adds FROM products ORDER BY views DESC').all();
    res.json({
      totalVisits: totalVisits.total || 0,
      products: productsStats
    });
  });

  app.post('/api/checkout/initialize', (req, res) => {
    const { buyer, items, totalPrice } = req.body;
    const iyzipay = getIyzipay();

    if (!iyzipay) {
      return res.status(500).json({
        status: 'error',
        errorMessage: 'Iyzico API anahtarları eksik. Lütfen .env dosyasını kontrol edin.'
      });
    }

    const request = {
      locale: 'tr',
      conversationId: Date.now().toString(),
      price: totalPrice.toString(),
      paidPrice: totalPrice.toString(),
      currency: 'TRY',
      basketId: 'B' + Date.now().toString(),
      paymentGroup: 'PRODUCT',
      callbackUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/checkout/callback` : 'http://localhost:3000/api/checkout/callback',
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: 'BY789',
        name: buyer.name,
        surname: buyer.surname,
        gsmNumber: buyer.phone,
        email: buyer.email,
        identityNumber: buyer.identityNumber,
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: buyer.address,
        ip: req.ip || '85.34.78.112',
        city: buyer.city,
        country: buyer.country,
        zipCode: buyer.zipCode
      },
      shippingAddress: {
        contactName: buyer.name + ' ' + buyer.surname,
        city: buyer.city,
        country: buyer.country,
        address: buyer.address,
        zipCode: buyer.zipCode
      },
      billingAddress: {
        contactName: buyer.name + ' ' + buyer.surname,
        city: buyer.city,
        country: buyer.country,
        address: buyer.address,
        zipCode: buyer.zipCode
      },
      basketItems: items.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        category1: item.category || 'Genel',
        itemType: 'PHYSICAL',
        price: (item.price * item.quantity).toString()
      }))
    };

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', errorMessage: 'Ödeme sistemi hatası.' });
      }
      res.json(result);
    });
  });

  app.post('/api/checkout/callback', (req, res) => {
    const iyzipay = getIyzipay();
    if (!iyzipay) {
      return res.redirect('/?payment=error&message=iyzico_not_configured');
    }

    const token = req.body.token;
    if (!token) {
      return res.redirect('/?payment=error&message=missing_token');
    }

    iyzipay.checkoutForm.retrieve({
      locale: 'tr',
      conversationId: Date.now().toString(),
      token: token
    }, (err: any, result: any) => {
      if (err) {
        console.error('Iyzico retrieve error:', err);
        return res.redirect('/?payment=error');
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        res.redirect('/?payment=success');
      } else {
        res.redirect(`/?payment=error&message=${encodeURIComponent(result.errorMessage || 'Ödeme başarısız')}`);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
