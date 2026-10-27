import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Enable Gzip/Brotli compression for all JSON, HTML, CSS, JS responses to boost PageSpeed
app.use(compression());

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Long-term immutable caching for fonts and static uploads
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));
app.use(
  '/fonts',
  express.static(path.join(__dirname, 'public', 'fonts'), {
    maxAge: '365d',
    immutable: true,
  })
);

// Helper to ensure data directory and file exist
function getPosts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading posts file:', err);
    return [];
  }
}

const PUBLIC_POSTS_FILE = path.join(__dirname, 'public', 'data', 'posts.json');
const PRESET_IMAGES_FILE = path.join(__dirname, 'data', 'preset_images.json');
const PUBLIC_PRESET_IMAGES_FILE = path.join(__dirname, 'public', 'data', 'preset_images.json');

const INITIAL_DEFAULT_PRESETS = [
  {
    id: 'preset-1',
    name: 'মেট্রো ট্রেন ও উড়াল ভায়াডাক্ট',
    url: 'https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1200&q=80',
    isDefault: true,
  },
  {
    id: 'preset-2',
    name: 'আধুনিক প্ল্যাটফর্ম ও ট্রেন আগমন',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    isDefault: true,
  },
  {
    id: 'preset-3',
    name: 'উড়াল রেল লাইন ও ট্রানজিট ব্রিজ',
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    isDefault: true,
  },
  {
    id: 'preset-4',
    name: 'স্টেশন কনকোর্স ও যাত্রীবান্ধব প্রবেশপথ',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    isDefault: true,
  },
  {
    id: 'preset-5',
    name: 'সন্ধ্যায় আলোকিত আধুনিক রেলওয়ে হাব',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    isDefault: true,
  },
];

function getPresetImages() {
  try {
    if (fs.existsSync(PRESET_IMAGES_FILE)) {
      const data = fs.readFileSync(PRESET_IMAGES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading preset images:', err);
  }
  return INITIAL_DEFAULT_PRESETS;
}

function savePresetImages(images: any[]) {
  try {
    const payload = JSON.stringify(images, null, 2);
    fs.mkdirSync(path.dirname(PRESET_IMAGES_FILE), { recursive: true });
    fs.writeFileSync(PRESET_IMAGES_FILE, payload, 'utf-8');
    fs.mkdirSync(path.dirname(PUBLIC_PRESET_IMAGES_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_PRESET_IMAGES_FILE, payload, 'utf-8');
  } catch (err) {
    console.error('Error saving preset images:', err);
  }
}

function savePosts(posts: any[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = JSON.stringify(posts, null, 2);
    fs.writeFileSync(DATA_FILE, payload, 'utf-8');

    const pubDir = path.dirname(PUBLIC_POSTS_FILE);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_POSTS_FILE, payload, 'utf-8');
  } catch (err) {
    console.error('Error saving posts file:', err);
  }
}

// Analytics and Google Analytics persistence
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.json');
const PUBLIC_ANALYTICS_FILE = path.join(__dirname, 'public', 'data', 'analytics.json');
const GA_CONFIG_FILE = path.join(__dirname, 'data', 'analytics_config.json');
const PUBLIC_GA_CONFIG_FILE = path.join(__dirname, 'public', 'data', 'analytics_config.json');

// Real-time active visitors map (tracks active visitors within 5 minutes)
const activeVisitorsMap = new Map<string, number>();

function getAnalyticsData() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading analytics data:', err);
  }
  return {
    totalVisits: 15420,
    todayDate: new Date().toISOString().slice(0, 10),
    todayVisits: 920,
    uniqueVisitorsCount: 9860,
    mobileVisits: 11410,
    desktopVisits: 4010,
    dailyVisits: {},
    pageViews: {},
    referrers: {},
    updatedAt: new Date().toISOString(),
  };
}

function saveAnalyticsData(data: any) {
  try {
    const payload = JSON.stringify(data, null, 2);
    fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, payload, 'utf-8');
    fs.mkdirSync(path.dirname(PUBLIC_ANALYTICS_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_ANALYTICS_FILE, payload, 'utf-8');
  } catch (err) {
    console.error('Error saving analytics data:', err);
  }
}

function getGaConfigFile() {
  try {
    if (fs.existsSync(GA_CONFIG_FILE)) {
      const data = fs.readFileSync(GA_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading GA config:', err);
  }
  return {
    measurementId: 'G-7L9X8K2M1Q',
    isEnabled: true,
    debugMode: false,
    trackPageviews: true,
    trackClicks: true,
    updatedAt: new Date().toISOString(),
  };
}

function saveGaConfigFile(cfg: any) {
  try {
    const payload = JSON.stringify(cfg, null, 2);
    fs.mkdirSync(path.dirname(GA_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(GA_CONFIG_FILE, payload, 'utf-8');
    fs.mkdirSync(path.dirname(PUBLIC_GA_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_GA_CONFIG_FILE, payload, 'utf-8');
  } catch (err) {
    console.error('Error saving GA config:', err);
  }
}

// Inject Google Analytics snippet into HTML head
function injectGoogleAnalytics(html: string, gaConfig: any): string {
  if (!gaConfig || !gaConfig.isEnabled || !gaConfig.measurementId || !gaConfig.measurementId.trim().startsWith('G-')) {
    return html;
  }
  const id = gaConfig.measurementId.trim();
  const scriptTag = `
  <!-- Google Analytics 4 (GA4) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}', { page_path: window.location.pathname });
  </script>`;

  if (html.includes('</head>')) {
    return html.replace('</head>', `${scriptTag}\n</head>`);
  }
  return html;
}

// REST API Endpoints
app.get('/api/posts', (req, res) => {
  const { status, category, search } = req.query;
  let posts = getPosts();

  if (status && status !== 'all') {
    posts = posts.filter((p: any) => p.status === status);
  }

  if (category && category !== 'all') {
    posts = posts.filter((p: any) => p.category === category);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const query = search.toLowerCase().trim();
    posts = posts.filter(
      (p: any) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(query)))
    );
  }

  // Sort newest first
  posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: posts.length, posts });
});

app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const postIndex = posts.findIndex((p: any) => p.id === id || p.slug === id);

  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  // Increment views
  posts[postIndex].views = (posts[postIndex].views || 0) + 1;
  savePosts(posts);

  res.json({ success: true, post: posts[postIndex] });
});

const ADS_FILE = path.join(__dirname, 'data', 'ads.json');
const PUBLIC_ADS_FILE = path.join(__dirname, 'public', 'data', 'ads.json');

// Ads Configuration Endpoints
app.get('/api/ads', (req, res) => {
  try {
    if (fs.existsSync(ADS_FILE)) {
      const data = fs.readFileSync(ADS_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
  } catch (e) {
    console.error('Error reading ads config:', e);
  }
  // Fallback defaults
  res.json({
    googleAdSense: { publisherId: '', autoAdsEnabled: false },
    leaderboard: { enabled: true, type: 'default' },
    inArticle: { enabled: true, type: 'default' },
    sidebar: { enabled: true, type: 'default' }
  });
});

app.post('/api/ads', (req, res) => {
  try {
    const config = req.body;
    const dir = path.dirname(ADS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADS_FILE, JSON.stringify(config, null, 2), 'utf-8');

    // Also sync to public/data/ads.json for static builds
    try {
      const pubDir = path.dirname(PUBLIC_ADS_FILE);
      if (!fs.existsSync(pubDir)) {
        fs.mkdirSync(pubDir, { recursive: true });
      }
      fs.writeFileSync(PUBLIC_ADS_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (pubErr) {
      console.warn('Could not sync to public ads file:', pubErr);
    }

    return res.json({ success: true, message: 'বিজ্ঞাপন কনফিগারেশন সংরক্ষিত হয়েছে।' });
  } catch (err: any) {
    console.error('Error saving ads config:', err);
    return res.status(500).json({ success: false, message: 'ত্রুটি: ' + err.message });
  }
});

const AUTH_FILE = path.join(__dirname, 'data', 'auth.json');
const PUBLIC_AUTH_FILE = path.join(__dirname, 'public', 'data', 'auth.json');

// Admin get auth status
app.get('/api/admin/auth', (_req, res) => {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (authData && authData.passwordHash && authData.passwordHash.trim() !== '') {
        return res.json({ hasCustomPassword: true, passwordHash: authData.passwordHash });
      }
    }
  } catch (e) {
    console.error('Error reading auth file:', e);
  }
  return res.json({ hasCustomPassword: false, passwordHash: '' });
});

// Admin verify
app.post('/api/admin/verify', (req, res) => {
  const { password, hash } = req.body;

  try {
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (authData && authData.passwordHash && authData.passwordHash.trim() !== '') {
        if (hash && hash === authData.passwordHash) {
          return res.json({ success: true, token: 'amarmetro-secure-token' });
        }
        return res.status(401).json({ success: false, message: 'ভুল এডমিন পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' });
      }
    }
  } catch (e) {
    console.error('Error reading auth file:', e);
  }

  // Fallback ONLY when no custom password exists in data/auth.json
  if (password === 'admin123' || password === 'metro2026' || password === 'admin') {
    return res.json({ success: true, token: 'demo-admin-token-valid' });
  }
  return res.status(401).json({ success: false, message: 'ভুল এডমিন পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' });
});

// Admin change password
app.post('/api/admin/change-password', (req, res) => {
  try {
    const { newHash } = req.body;
    if (!newHash) {
      return res.status(400).json({ success: false, message: 'পাসওয়ার্ড হ্যাশ প্রয়োজন।' });
    }
    const payload = JSON.stringify({ passwordHash: newHash, updatedAt: new Date().toISOString() }, null, 2);

    // Save to data/auth.json
    const dir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, payload, 'utf-8');

    // Save to public/data/auth.json
    const pubDir = path.dirname(PUBLIC_AUTH_FILE);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_AUTH_FILE, payload, 'utf-8');

    return res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে সার্ভারে সংরক্ষিত হয়েছে।' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি: ' + err.message });
  }
});

// Image Upload endpoint (saves images to disk in /uploads/)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'ছবি প্রদান করা হয়নি।' });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Extract base64 part if it has data URL prefix
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const dataBuffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');

    const ext = filename && path.extname(filename) ? path.extname(filename) : '.jpg';
    const safeName = `img-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, dataBuffer);
    res.json({ success: true, url: `/uploads/${safeName}`, filename: safeName });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'ছবি আপলোড ব্যর্থ হয়েছে: ' + err.message });
  }
});

// Create new post (Admin)
app.post('/api/posts', (req, res) => {
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const posts = getPosts();
  const now = new Date().toISOString();
  const slug =
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .substring(0, 80) || `post-${Date.now()}`;

  // Estimate read time
  const wordCount = (content || '').trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${readMinutes} মিনিট`;

  const newPost = {
    id: `post-${Date.now()}`,
    slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title.trim(),
    excerpt: (excerpt || content.substring(0, 160) + '...').trim(),
    content: content.trim(),
    coverImage:
      coverImage && coverImage.trim() !== ''
        ? coverImage.trim()
        : 'https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1200&q=80',
    category: category || 'খবর ও আপডেট',
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['মেট্রো'],
    author: {
      name: 'এডমিন',
      role: 'amarmetro.com',
    },
    status: status === 'draft' ? 'draft' : 'published',
    readTime,
    views: 1,
    createdAt: now,
    updatedAt: now,
  };

  posts.unshift(newPost);
  savePosts(posts);

  res.status(201).json({ success: true, message: 'পোস্ট সফলভাবে প্রকাশিত হয়েছে', post: newPost });
});

// Like a post (Persistent like counter)
app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  posts[index].likes = (posts[index].likes || 0) + 1;
  savePosts(posts);

  res.json({ success: true, likes: posts[index].likes, message: 'লাইক সফলভাবে সংরক্ষিত হয়েছে' });
});

// Unlike a post (Toggle like off)
app.post('/api/posts/:id/unlike', (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  posts[index].likes = Math.max(0, (posts[index].likes || 0) - 1);
  savePosts(posts);

  res.json({ success: true, likes: posts[index].likes, message: 'লাইক প্রত্যাহার করা হয়েছে' });
});

// Visitor Analytics Tracking Endpoints
app.post('/api/stats/visit', (req, res) => {
  try {
    const { visitorId, path: pagePath, title, referrer, isMobile } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const analytics = getAnalyticsData();

    // 1. Update active visitors map
    const vId = visitorId || 'anon-' + Math.random().toString(36).substring(2, 8);
    activeVisitorsMap.set(vId, Date.now());

    // 2. Increment total visits
    analytics.totalVisits = (analytics.totalVisits || 0) + 1;

    // 3. Increment today's visits
    if (analytics.todayDate === todayStr) {
      analytics.todayVisits = (analytics.todayVisits || 0) + 1;
    } else {
      analytics.todayDate = todayStr;
      analytics.todayVisits = 1;
    }

    // 4. Track device breakdown
    if (isMobile) {
      analytics.mobileVisits = (analytics.mobileVisits || 0) + 1;
    } else {
      analytics.desktopVisits = (analytics.desktopVisits || 0) + 1;
    }

    // 5. Track daily visits breakdown
    if (!analytics.dailyVisits) analytics.dailyVisits = {};
    if (!analytics.dailyVisits[todayStr]) {
      const bnDay = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
      analytics.dailyVisits[todayStr] = { visits: 0, uniques: 0, label: bnDay };
    }
    analytics.dailyVisits[todayStr].visits = (analytics.dailyVisits[todayStr].visits || 0) + 1;

    // 6. Track page views
    if (!analytics.pageViews) analytics.pageViews = {};
    const normPath = pagePath || '/';
    if (!analytics.pageViews[normPath]) {
      analytics.pageViews[normPath] = { path: normPath, title: title || normPath, views: 0 };
    }
    analytics.pageViews[normPath].views += 1;
    if (title && analytics.pageViews[normPath].title !== title) {
      analytics.pageViews[normPath].title = title;
    }

    // 7. Track referrers
    if (referrer) {
      if (!analytics.referrers) analytics.referrers = {};
      let refLabel = 'অন্যান্য ওয়েবসাইট';
      if (referrer.includes('google.')) refLabel = 'গুগল সার্চ (Organic Google Search)';
      else if (referrer.includes('facebook.') || referrer.includes('fb.')) refLabel = 'ফেসবুক ও সোশ্যাল মিডিয়া (Facebook)';
      else if (referrer.includes('whatsapp.')) refLabel = 'হোয়াটসঅ্যাপ শেয়ার (WhatsApp)';
      else if (referrer.includes('t.co') || referrer.includes('twitter.') || referrer.includes('x.com')) refLabel = 'টুইটার / X';
      else if (referrer.includes('amarmetro.com')) refLabel = 'সরাসরি প্রবেশ (Direct amarmetro.com)';
      
      analytics.referrers[refLabel] = (analytics.referrers[refLabel] || 0) + 1;
    }

    analytics.updatedAt = now.toISOString();
    saveAnalyticsData(analytics);

    res.json({ success: true, totalVisits: analytics.totalVisits, todayVisits: analytics.todayVisits });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Real-time visitor heartbeat ping
app.post('/api/stats/ping', (req, res) => {
  const { visitorId } = req.body;
  const vId = visitorId || 'anon-' + Math.random().toString(36).substring(2, 8);
  activeVisitorsMap.set(vId, Date.now());

  const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
  let realActive = 0;
  for (const [key, lastSeen] of activeVisitorsMap.entries()) {
    if (lastSeen < threeMinutesAgo) {
      activeVisitorsMap.delete(key);
    } else {
      realActive++;
    }
  }
  res.json({ success: true, activeNow: Math.max(1, realActive) });
});

app.get('/api/stats/summary', (_req, res) => {
  try {
    const analytics = getAnalyticsData();
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Clean up inactive visitors (inactive for > 3 minutes)
    const threeMinutesAgo = now - 3 * 60 * 1000;
    let realActive = 0;
    for (const [key, lastSeen] of activeVisitorsMap.entries()) {
      if (lastSeen < threeMinutesAgo) {
        activeVisitorsMap.delete(key);
      } else {
        realActive++;
      }
    }

    // Genuine active online count: strictly based on real active sessions
    // Minimum 1 (the visitor actively viewing/querying right now)
    let activeNow = Math.max(1, realActive);

    // Consistency rule: todayVisits must always be at least activeNow
    // (active users online right now cannot be greater than total visits today)
    const todayVisits = Math.max(analytics.todayVisits || 1, activeNow);
    if (activeNow > todayVisits) {
      activeNow = todayVisits;
    }

    // Calculate mobile vs desktop percentages
    const totalDevices = (analytics.mobileVisits || 1) + (analytics.desktopVisits || 1);
    const mobilePercentage = Math.round(((analytics.mobileVisits || 1) / totalDevices) * 100);
    const desktopPercentage = 100 - mobilePercentage;

    // Format 7-day stats
    const dailyKeys = Object.keys(analytics.dailyVisits || {}).sort().slice(-7);
    const dailyStats = dailyKeys.map((k) => ({
      date: k,
      label: analytics.dailyVisits[k].label || k,
      visits: analytics.dailyVisits[k].visits || 0,
      uniques: analytics.dailyVisits[k].uniques || Math.round((analytics.dailyVisits[k].visits || 0) * 0.72),
    }));

    // Format top pages
    const topPages = Object.values(analytics.pageViews || {})
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);

    // Format top referrers
    const topReferrers = Object.entries(analytics.referrers || {})
      .map(([source, count]) => ({ source, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const summary = {
      totalVisits: analytics.totalVisits || 15420,
      todayVisits: analytics.todayVisits || 920,
      uniqueVisitors: analytics.uniqueVisitorsCount || Math.round((analytics.totalVisits || 15420) * 0.65),
      activeNow,
      mobilePercentage,
      desktopPercentage,
      dailyStats,
      topPages,
      topReferrers,
      updatedAt: analytics.updatedAt || new Date().toISOString(),
    };

    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Google Analytics Config Endpoints
app.get('/api/analytics/config', (_req, res) => {
  const cfg = getGaConfigFile();
  res.json({ success: true, config: cfg });
});

// AdSense & Ads Configuration File paths & Sync
const ADS_CONFIG_FILE = path.join(__dirname, 'data', 'ads.json');
const PUBLIC_ADS_CONFIG_FILE = path.join(__dirname, 'public', 'data', 'ads.json');
const ADS_TXT_FILE = path.join(__dirname, 'public', 'ads.txt');
const INDEX_HTML_FILE = path.join(__dirname, 'index.html');

function getAdsConfigFile() {
  try {
    if (fs.existsSync(ADS_CONFIG_FILE)) {
      const data = fs.readFileSync(ADS_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading ads config:', err);
  }
  return null;
}

function updateAdSenseFiles(pubId: string) {
  if (!pubId || !pubId.trim()) return;
  const cleanPub = pubId.trim();
  const rawNumber = cleanPub.replace(/^(ca-)?pub-/, '');
  const pubWithPub = `pub-${rawNumber}`;
  const pubWithCa = `ca-pub-${rawNumber}`;

  // 1. Update public/ads.txt
  try {
    const adsTxtContent = `# Google AdSense ads.txt for amarmetro.com\ngoogle.com, ${pubWithPub}, DIRECT, f08c47fec0942fa0\n`;
    fs.writeFileSync(ADS_TXT_FILE, adsTxtContent, 'utf-8');
    const distAdsTxt = path.join(__dirname, 'dist', 'ads.txt');
    if (fs.existsSync(path.dirname(distAdsTxt))) {
      fs.writeFileSync(distAdsTxt, adsTxtContent, 'utf-8');
    }
  } catch (e) {
    console.error('Error updating ads.txt:', e);
  }

  // 2. Update index.html head meta and script tag for Google AdSense verification crawler
  try {
    if (fs.existsSync(INDEX_HTML_FILE)) {
      let html = fs.readFileSync(INDEX_HTML_FILE, 'utf-8');
      
      // Update or add <meta name="google-adsense-account" content="...">
      if (html.includes('name="google-adsense-account"')) {
        html = html.replace(/<meta\s+name=["']google-adsense-account["']\s+content=["'][^"']*["']\s*\/?>/gi, `<meta name="google-adsense-account" content="${pubWithCa}" id="google-adsense-meta" />`);
      } else if (html.includes('</head>')) {
        html = html.replace('</head>', `  <meta name="google-adsense-account" content="${pubWithCa}" id="google-adsense-meta" />\n</head>`);
      }

      // Update script tag
      const scriptTag = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubWithCa}" crossorigin="anonymous" id="google-adsense-script"></script>`;
      if (html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
        html = html.replace(/<script\s+async\s+src=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"']*["']\s+crossorigin=["']anonymous["'][^>]*><\/script>/gi, scriptTag);
      } else if (html.includes('</head>')) {
        html = html.replace('</head>', `  ${scriptTag}\n</head>`);
      }

      fs.writeFileSync(INDEX_HTML_FILE, html, 'utf-8');
    }
  } catch (e) {
    console.error('Error updating index.html for AdSense:', e);
  }
}

// Ads & AdSense Config Endpoints
app.get('/api/ads', (_req, res) => {
  const cfg = getAdsConfigFile();
  res.json(cfg || {});
});

app.post('/api/ads', (req, res) => {
  try {
    const config = req.body;
    if (!config) {
      return res.status(400).json({ success: false, message: 'বিজ্ঞাপন কনফিগারেশন পাওয়া যায়নি' });
    }

    const payload = JSON.stringify(config, null, 2);
    fs.mkdirSync(path.dirname(ADS_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(ADS_CONFIG_FILE, payload, 'utf-8');

    fs.mkdirSync(path.dirname(PUBLIC_ADS_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_ADS_CONFIG_FILE, payload, 'utf-8');

    // Auto-update ads.txt and index.html if publisherId is provided
    if (config.googleAdSense && config.googleAdSense.publisherId) {
      updateAdSenseFiles(config.googleAdSense.publisherId);
    }

    res.json({ success: true, message: 'বিজ্ঞাপন সেটিংস ও ads.txt সফলভাবে আপডেট হয়েছে', config });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Contact Us Inquiries Endpoint (for AdSense & reader communication)
const CONTACTS_FILE = path.join(__dirname, 'data', 'contact_inquiries.json');
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'সকল আবশ্যকীয় তথ্য প্রদান করুন।' });
    }

    let inquiries: any[] = [];
    if (fs.existsSync(CONTACTS_FILE)) {
      try {
        inquiries = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
      } catch {}
    }

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'সাধারণ জিজ্ঞাসা').trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);
    fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(inquiries.slice(0, 100), null, 2), 'utf-8');

    res.json({ success: true, message: 'আপনার বার্তাটি সফলভাবে জমা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/analytics/config', (req, res) => {
  try {
    const { measurementId, isEnabled, debugMode, trackPageviews, trackClicks } = req.body;
    if (measurementId && !measurementId.trim().startsWith('G-')) {
      return res.status(400).json({ success: false, message: 'Google Analytics 4 Measurement ID must start with "G-" (e.g. G-XXXXXXXXXX)' });
    }
    const current = getGaConfigFile();
    const updated = {
      ...current,
      measurementId: measurementId !== undefined ? measurementId.trim() : current.measurementId,
      isEnabled: isEnabled !== undefined ? !!isEnabled : current.isEnabled,
      debugMode: debugMode !== undefined ? !!debugMode : current.debugMode,
      trackPageviews: trackPageviews !== undefined ? !!trackPageviews : current.trackPageviews,
      trackClicks: trackClicks !== undefined ? !!trackClicks : current.trackClicks,
      updatedAt: new Date().toISOString(),
    };

    saveGaConfigFile(updated);
    res.json({ success: true, message: 'গুগল এনালিটিকস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে', config: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Preset Cover Images Management API
app.get('/api/preset-images', (_req, res) => {
  const images = getPresetImages();
  res.json({ success: true, count: images.length, images });
});

app.post('/api/preset-images', (req, res) => {
  try {
    const { name, url, base64Data } = req.body;
    let finalUrl = url;

    if (base64Data) {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const dataBuffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');
      const safeName = `preset-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.jpg`;
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, dataBuffer);
      finalUrl = `/uploads/${safeName}`;
    }

    if (!finalUrl) {
      return res.status(400).json({ success: false, message: 'ছবির লিংক বা ফাইল প্রদান করুন' });
    }

    const images = getPresetImages();
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: (name || 'মেট্রোরেল ছবি').trim(),
      url: finalUrl,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    images.push(newPreset);
    savePresetImages(images);

    res.status(201).json({ success: true, message: 'নতুন প্রস্তুত ছবি যুক্ত করা হয়েছে', preset: newPreset, images });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'ছবি সংরক্ষণ ব্যর্থ: ' + err.message });
  }
});

app.delete('/api/preset-images/:id', (req, res) => {
  const { id } = req.params;
  let images = getPresetImages();
  const initialCount = images.length;
  images = images.filter((img: any) => img.id !== id && img.url !== id);

  if (images.length === initialCount) {
    return res.status(404).json({ success: false, message: 'ছবি খুঁজে পাওয়া যায়নি' });
  }

  savePresetImages(images);
  res.json({ success: true, message: 'প্রস্তুত ছবি সফলভাবে মুছে ফেলা হয়েছে', images });
});

// Update post (Admin)
app.put('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;

  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const existing = posts[index];
  const wordCount = (content || existing.content || '').trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${readMinutes} মিনিট`;

  posts[index] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    excerpt: excerpt !== undefined ? excerpt.trim() : existing.excerpt,
    content: content !== undefined ? content.trim() : existing.content,
    category: category !== undefined ? category : existing.category,
    coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : existing.tags,
    author: author !== undefined ? { ...existing.author, ...author } : existing.author,
    status: status !== undefined ? status : existing.status,
    readTime,
    updatedAt: new Date().toISOString(),
  };

  savePosts(posts);
  res.json({ success: true, message: 'পোস্ট সফলভাবে আপডেট করা হয়েছে', post: posts[index] });
});

// Delete post (Admin)
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  let posts = getPosts();
  const initialLength = posts.length;

  posts = posts.filter((p: any) => p.id !== id && p.slug !== id);

  if (posts.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  savePosts(posts);
  res.json({ success: true, message: 'পোস্ট সফলভাবে মুছে ফেলা হয়েছে' });
});

// Live Metro Status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    line: 'MRT Line-6',
    status: 'normal',
    statusTextBn: 'ট্রেন চলাচল স্বাভাবিক',
    statusTextEn: 'Normal Service',
    peakHeadway: '৬ মিনিট',
    offPeakHeadway: '১০ মিনিট',
    operatingHours: 'সকাল ০৭:১০ - রাত ০৯:৪০',
    activeStations: 16,
    announcement: 'মতিঝিল-কমলাপুর সম্প্রসারণ কাজ দ্রুত এগিয়ে চলেছে। যাত্রীদের অনুরোধ করা হচ্ছে স্টেশনে টিকিট বা এমআরটি পাস ব্যবহার করার জন্য।',
  });
});

// Helper to inject specific post meta tags for social media link sharing (WhatsApp, Facebook, Twitter, Telegram, LinkedIn)
function renderHtmlWithPostMeta(template: string, post: any, req: express.Request) {
  const host = req.get('host') || 'amarmetro.com';
  const protocol = req.protocol || 'https';
  const fullOrigin = `${protocol}://${host}`;
  const postUrl = `${fullOrigin}/?post=${encodeURIComponent(post.slug || post.id)}`;
  const title = `${post.title} | Amar Metro - আমার মেট্রো`;
  const desc = post.excerpt || 'ঢাকা মেট্রো রেল এমআরটি লাইন-৬ এর বিস্তারিত গাইড ও প্রতিবেদন।';
  const imgUrl = (post.coverImage || '').startsWith('http')
    ? post.coverImage
    : `${fullOrigin}${post.coverImage}`;

  let html = template;
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="description" content="${desc}" />`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:description" content="${desc}" />`);
  html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:image" content="${imgUrl}" />`);
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/gi, `<meta property="og:url" content="${postUrl}" />`);
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/gi, `<link rel="canonical" href="${postUrl}" />`);
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:description" content="${desc}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/gi, `<meta name="twitter:image" content="${imgUrl}" />`);

  return injectGoogleAnalytics(html, getGaConfigFile());
}

function findRequestedPost(req: express.Request) {
  let postParam = req.query.post as string;
  if (!postParam) {
    const postMatch = req.path.match(/^\/(?:post|article)\/(.+)$/);
    if (postMatch) {
      postParam = postMatch[1];
    }
  }
  if (!postParam) return null;

  const decodedParam = decodeURIComponent(postParam).toLowerCase();
  const posts = getPosts();
  return (
    posts.find(
      (p: any) =>
        (p.slug && p.slug.toLowerCase() === decodedParam) ||
        (p.id && p.id.toLowerCase() === decodedParam)
    ) || null
  );
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Vite hashed static assets (immutable 1 year caching)
    app.use(
      '/assets',
      express.static(path.join(__dirname, 'dist', 'assets'), {
        maxAge: '365d',
        immutable: true,
      })
    );

    // General static files (1 day caching)
    app.use(
      express.static(path.join(__dirname, 'dist'), {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            // Never cache index.html so users get latest updates instantly
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const post = findRequestedPost(req);
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      if (post && fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const rendered = renderHtmlWithPostMeta(rawHtml, post, req);
        return res.send(rendered);
      }
      res.sendFile(indexPath);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // In dev mode, handle post permalinks to inject post meta for social previews
    app.use(async (req, res, next) => {
      const isHtmlReq = req.headers.accept && req.headers.accept.includes('text/html');
      if (req.method === 'GET' && isHtmlReq && !req.path.startsWith('/api') && !req.path.startsWith('/@') && !req.path.startsWith('/node_modules')) {
        const post = findRequestedPost(req);
        if (post) {
          try {
            const rawTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
            const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
            const rendered = renderHtmlWithPostMeta(transformed, post, req);
            res.setHeader('Content-Type', 'text/html');
            return res.send(rendered);
          } catch (e) {
            console.error('Dev SSR error:', e);
          }
        }
      }
      vite.middlewares(req, res, next);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
