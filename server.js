// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import compression from "compression";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var DATA_FILE = path.join(__dirname, "data", "posts.json");
var UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use(compression());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
app.use(
  "/fonts",
  express.static(path.join(__dirname, "public", "fonts"), {
    maxAge: "365d",
    immutable: true
  })
);
function getPosts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading posts file:", err);
    return [];
  }
}
var PUBLIC_POSTS_FILE = path.join(__dirname, "public", "data", "posts.json");
var PRESET_IMAGES_FILE = path.join(__dirname, "data", "preset_images.json");
var PUBLIC_PRESET_IMAGES_FILE = path.join(__dirname, "public", "data", "preset_images.json");
var INITIAL_DEFAULT_PRESETS = [
  {
    id: "preset-1",
    name: "\u09AE\u09C7\u099F\u09CD\u09B0\u09CB \u099F\u09CD\u09B0\u09C7\u09A8 \u0993 \u0989\u09A1\u09BC\u09BE\u09B2 \u09AD\u09BE\u09AF\u09BC\u09BE\u09A1\u09BE\u0995\u09CD\u099F",
    url: "https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1200&q=80",
    isDefault: true
  },
  {
    id: "preset-2",
    name: "\u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u0993 \u099F\u09CD\u09B0\u09C7\u09A8 \u0986\u0997\u09AE\u09A8",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
    isDefault: true
  },
  {
    id: "preset-3",
    name: "\u0989\u09A1\u09BC\u09BE\u09B2 \u09B0\u09C7\u09B2 \u09B2\u09BE\u0987\u09A8 \u0993 \u099F\u09CD\u09B0\u09BE\u09A8\u099C\u09BF\u099F \u09AC\u09CD\u09B0\u09BF\u099C",
    url: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
    isDefault: true
  },
  {
    id: "preset-4",
    name: "\u09B8\u09CD\u099F\u09C7\u09B6\u09A8 \u0995\u09A8\u0995\u09CB\u09B0\u09CD\u09B8 \u0993 \u09AF\u09BE\u09A4\u09CD\u09B0\u09C0\u09AC\u09BE\u09A8\u09CD\u09A7\u09AC \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6\u09AA\u09A5",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    isDefault: true
  },
  {
    id: "preset-5",
    name: "\u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u0986\u09B2\u09CB\u0995\u09BF\u09A4 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09B0\u09C7\u09B2\u0993\u09AF\u09BC\u09C7 \u09B9\u09BE\u09AC",
    url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
    isDefault: true
  }
];
function getPresetImages() {
  try {
    if (fs.existsSync(PRESET_IMAGES_FILE)) {
      const data = fs.readFileSync(PRESET_IMAGES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Error reading preset images:", err);
  }
  return INITIAL_DEFAULT_PRESETS;
}
function savePresetImages(images) {
  try {
    const payload = JSON.stringify(images, null, 2);
    fs.mkdirSync(path.dirname(PRESET_IMAGES_FILE), { recursive: true });
    fs.writeFileSync(PRESET_IMAGES_FILE, payload, "utf-8");
    fs.mkdirSync(path.dirname(PUBLIC_PRESET_IMAGES_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_PRESET_IMAGES_FILE, payload, "utf-8");
  } catch (err) {
    console.error("Error saving preset images:", err);
  }
}
function savePosts(posts) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = JSON.stringify(posts, null, 2);
    fs.writeFileSync(DATA_FILE, payload, "utf-8");
    const pubDir = path.dirname(PUBLIC_POSTS_FILE);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_POSTS_FILE, payload, "utf-8");
  } catch (err) {
    console.error("Error saving posts file:", err);
  }
}
var ANALYTICS_FILE = path.join(__dirname, "data", "analytics.json");
var PUBLIC_ANALYTICS_FILE = path.join(__dirname, "public", "data", "analytics.json");
var GA_CONFIG_FILE = path.join(__dirname, "data", "analytics_config.json");
var PUBLIC_GA_CONFIG_FILE = path.join(__dirname, "public", "data", "analytics_config.json");
var activeVisitorsMap = /* @__PURE__ */ new Map();
function getAnalyticsData() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading analytics data:", err);
  }
  return {
    totalVisits: 15420,
    todayDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    todayVisits: 920,
    uniqueVisitorsCount: 9860,
    mobileVisits: 11410,
    desktopVisits: 4010,
    dailyVisits: {},
    pageViews: {},
    referrers: {},
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function saveAnalyticsData(data) {
  try {
    const payload = JSON.stringify(data, null, 2);
    fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, payload, "utf-8");
    fs.mkdirSync(path.dirname(PUBLIC_ANALYTICS_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_ANALYTICS_FILE, payload, "utf-8");
  } catch (err) {
    console.error("Error saving analytics data:", err);
  }
}
function getGaConfigFile() {
  try {
    if (fs.existsSync(GA_CONFIG_FILE)) {
      const data = fs.readFileSync(GA_CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading GA config:", err);
  }
  return {
    measurementId: "G-7L9X8K2M1Q",
    isEnabled: true,
    debugMode: false,
    trackPageviews: true,
    trackClicks: true,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function saveGaConfigFile(cfg) {
  try {
    const payload = JSON.stringify(cfg, null, 2);
    fs.mkdirSync(path.dirname(GA_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(GA_CONFIG_FILE, payload, "utf-8");
    fs.mkdirSync(path.dirname(PUBLIC_GA_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_GA_CONFIG_FILE, payload, "utf-8");
  } catch (err) {
    console.error("Error saving GA config:", err);
  }
}
function injectGoogleAnalytics(html, gaConfig) {
  if (!gaConfig || !gaConfig.isEnabled || !gaConfig.measurementId || !gaConfig.measurementId.trim().startsWith("G-")) {
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
  if (html.includes("</head>")) {
    return html.replace("</head>", `${scriptTag}
</head>`);
  }
  return html;
}
app.get("/api/posts", (req, res) => {
  const { status, category, search } = req.query;
  let posts = getPosts();
  if (status && status !== "all") {
    posts = posts.filter((p) => p.status === status);
  }
  if (category && category !== "all") {
    posts = posts.filter((p) => p.category === category);
  }
  if (search && typeof search === "string" && search.trim() !== "") {
    const query = search.toLowerCase().trim();
    posts = posts.filter(
      (p) => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query) || p.tags && p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, count: posts.length, posts });
});
app.get("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);
  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  posts[postIndex].views = (posts[postIndex].views || 0) + 1;
  savePosts(posts);
  res.json({ success: true, post: posts[postIndex] });
});
var ADS_FILE = path.join(__dirname, "data", "ads.json");
var PUBLIC_ADS_FILE = path.join(__dirname, "public", "data", "ads.json");
app.get("/api/ads", (req, res) => {
  try {
    if (fs.existsSync(ADS_FILE)) {
      const data = fs.readFileSync(ADS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
  } catch (e) {
    console.error("Error reading ads config:", e);
  }
  res.json({
    googleAdSense: { publisherId: "", autoAdsEnabled: false },
    leaderboard: { enabled: true, type: "default" },
    inArticle: { enabled: true, type: "default" },
    sidebar: { enabled: true, type: "default" }
  });
});
app.post("/api/ads", (req, res) => {
  try {
    const config = req.body;
    const dir = path.dirname(ADS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ADS_FILE, JSON.stringify(config, null, 2), "utf-8");
    try {
      const pubDir = path.dirname(PUBLIC_ADS_FILE);
      if (!fs.existsSync(pubDir)) {
        fs.mkdirSync(pubDir, { recursive: true });
      }
      fs.writeFileSync(PUBLIC_ADS_FILE, JSON.stringify(config, null, 2), "utf-8");
    } catch (pubErr) {
      console.warn("Could not sync to public ads file:", pubErr);
    }
    return res.json({ success: true, message: "\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error("Error saving ads config:", err);
    return res.status(500).json({ success: false, message: "\u09A4\u09CD\u09B0\u09C1\u099F\u09BF: " + err.message });
  }
});
var AUTH_FILE = path.join(__dirname, "data", "auth.json");
var PUBLIC_AUTH_FILE = path.join(__dirname, "public", "data", "auth.json");
app.get("/api/admin/auth", (_req, res) => {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
      if (authData && authData.passwordHash && authData.passwordHash.trim() !== "") {
        return res.json({ hasCustomPassword: true, passwordHash: authData.passwordHash });
      }
    }
  } catch (e) {
    console.error("Error reading auth file:", e);
  }
  return res.json({ hasCustomPassword: false, passwordHash: "" });
});
app.post("/api/admin/verify", (req, res) => {
  const { password, hash } = req.body;
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
      if (authData && authData.passwordHash && authData.passwordHash.trim() !== "") {
        if (hash && hash === authData.passwordHash) {
          return res.json({ success: true, token: "amarmetro-secure-token" });
        }
        return res.status(401).json({ success: false, message: "\u09AD\u09C1\u09B2 \u098F\u09A1\u09AE\u09BF\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
      }
    }
  } catch (e) {
    console.error("Error reading auth file:", e);
  }
  if (password === "admin123" || password === "metro2026" || password === "admin") {
    return res.json({ success: true, token: "demo-admin-token-valid" });
  }
  return res.status(401).json({ success: false, message: "\u09AD\u09C1\u09B2 \u098F\u09A1\u09AE\u09BF\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
});
app.post("/api/admin/change-password", (req, res) => {
  try {
    const { newHash } = req.body;
    if (!newHash) {
      return res.status(400).json({ success: false, message: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B9\u09CD\u09AF\u09BE\u09B6 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964" });
    }
    const payload = JSON.stringify({ passwordHash: newHash, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2);
    const dir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, payload, "utf-8");
    const pubDir = path.dirname(PUBLIC_AUTH_FILE);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_AUTH_FILE, payload, "utf-8");
    return res.json({ success: true, message: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF: " + err.message });
  }
});
app.post("/api/upload", (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: "\u099B\u09AC\u09BF \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF\u0964" });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const dataBuffer = matches ? Buffer.from(matches[2], "base64") : Buffer.from(base64Data, "base64");
    const ext = filename && path.extname(filename) ? path.extname(filename) : ".jpg";
    const safeName = `img-${Date.now()}-${Math.floor(1e3 + Math.random() * 9e3)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, dataBuffer);
    res.json({ success: true, url: `/uploads/${safeName}`, filename: safeName });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "\u099B\u09AC\u09BF \u0986\u09AA\u09B2\u09CB\u09A1 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7: " + err.message });
  }
});
app.post("/api/posts", (req, res) => {
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content are required" });
  }
  const posts = getPosts();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const slug = title.toLowerCase().trim().replace(/[^\w\s\u0980-\u09FF-]/g, "").replace(/[\s_-]+/g, "-").substring(0, 80) || `post-${Date.now()}`;
  const wordCount = (content || "").trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${readMinutes} \u09AE\u09BF\u09A8\u09BF\u099F`;
  const newPost = {
    id: `post-${Date.now()}`,
    slug: `${slug}-${Math.floor(1e3 + Math.random() * 9e3)}`,
    title: title.trim(),
    excerpt: (excerpt || content.substring(0, 160) + "...").trim(),
    content: content.trim(),
    coverImage: coverImage && coverImage.trim() !== "" ? coverImage.trim() : "https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1200&q=80",
    category: category || "\u0996\u09AC\u09B0 \u0993 \u0986\u09AA\u09A1\u09C7\u099F",
    tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : ["\u09AE\u09C7\u099F\u09CD\u09B0\u09CB"],
    author: {
      name: "\u098F\u09A1\u09AE\u09BF\u09A8",
      role: "amarmetro.com"
    },
    status: status === "draft" ? "draft" : "published",
    readTime,
    views: 1,
    createdAt: now,
    updatedAt: now
  };
  posts.unshift(newPost);
  savePosts(posts);
  res.status(201).json({ success: true, message: "\u09AA\u09CB\u09B8\u09CD\u099F \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7", post: newPost });
});
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  posts[index].likes = (posts[index].likes || 0) + 1;
  savePosts(posts);
  res.json({ success: true, likes: posts[index].likes, message: "\u09B2\u09BE\u0987\u0995 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7" });
});
app.post("/api/posts/:id/unlike", (req, res) => {
  const { id } = req.params;
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  posts[index].likes = Math.max(0, (posts[index].likes || 0) - 1);
  savePosts(posts);
  res.json({ success: true, likes: posts[index].likes, message: "\u09B2\u09BE\u0987\u0995 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7" });
});
app.post("/api/stats/visit", (req, res) => {
  try {
    const { visitorId, path: pagePath, title, referrer, isMobile } = req.body;
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const analytics = getAnalyticsData();
    const vId = visitorId || "anon-" + Math.random().toString(36).substring(2, 8);
    activeVisitorsMap.set(vId, Date.now());
    analytics.totalVisits = (analytics.totalVisits || 0) + 1;
    if (analytics.todayDate === todayStr) {
      analytics.todayVisits = (analytics.todayVisits || 0) + 1;
    } else {
      analytics.todayDate = todayStr;
      analytics.todayVisits = 1;
    }
    if (isMobile) {
      analytics.mobileVisits = (analytics.mobileVisits || 0) + 1;
    } else {
      analytics.desktopVisits = (analytics.desktopVisits || 0) + 1;
    }
    if (!analytics.dailyVisits) analytics.dailyVisits = {};
    if (!analytics.dailyVisits[todayStr]) {
      const bnDay = now.toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
      analytics.dailyVisits[todayStr] = { visits: 0, uniques: 0, label: bnDay };
    }
    analytics.dailyVisits[todayStr].visits = (analytics.dailyVisits[todayStr].visits || 0) + 1;
    if (!analytics.pageViews) analytics.pageViews = {};
    const normPath = pagePath || "/";
    if (!analytics.pageViews[normPath]) {
      analytics.pageViews[normPath] = { path: normPath, title: title || normPath, views: 0 };
    }
    analytics.pageViews[normPath].views += 1;
    if (title && analytics.pageViews[normPath].title !== title) {
      analytics.pageViews[normPath].title = title;
    }
    if (referrer) {
      if (!analytics.referrers) analytics.referrers = {};
      let refLabel = "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F";
      if (referrer.includes("google.")) refLabel = "\u0997\u09C1\u0997\u09B2 \u09B8\u09BE\u09B0\u09CD\u099A (Organic Google Search)";
      else if (referrer.includes("facebook.") || referrer.includes("fb.")) refLabel = "\u09AB\u09C7\u09B8\u09AC\u09C1\u0995 \u0993 \u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE (Facebook)";
      else if (referrer.includes("whatsapp.")) refLabel = "\u09B9\u09CB\u09AF\u09BC\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA \u09B6\u09C7\u09DF\u09BE\u09B0 (WhatsApp)";
      else if (referrer.includes("t.co") || referrer.includes("twitter.") || referrer.includes("x.com")) refLabel = "\u099F\u09C1\u0987\u099F\u09BE\u09B0 / X";
      else if (referrer.includes("amarmetro.com")) refLabel = "\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6 (Direct amarmetro.com)";
      analytics.referrers[refLabel] = (analytics.referrers[refLabel] || 0) + 1;
    }
    analytics.updatedAt = now.toISOString();
    saveAnalyticsData(analytics);
    res.json({ success: true, totalVisits: analytics.totalVisits, todayVisits: analytics.todayVisits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/stats/ping", (req, res) => {
  const { visitorId } = req.body;
  const vId = visitorId || "anon-" + Math.random().toString(36).substring(2, 8);
  activeVisitorsMap.set(vId, Date.now());
  const threeMinutesAgo = Date.now() - 3 * 60 * 1e3;
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
app.get("/api/stats/summary", (_req, res) => {
  try {
    const analytics = getAnalyticsData();
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1e3;
    const threeMinutesAgo = now - 3 * 60 * 1e3;
    let realActive = 0;
    for (const [key, lastSeen] of activeVisitorsMap.entries()) {
      if (lastSeen < threeMinutesAgo) {
        activeVisitorsMap.delete(key);
      } else {
        realActive++;
      }
    }
    let activeNow = Math.max(1, realActive);
    const todayVisits = Math.max(analytics.todayVisits || 1, activeNow);
    if (activeNow > todayVisits) {
      activeNow = todayVisits;
    }
    const totalDevices = (analytics.mobileVisits || 1) + (analytics.desktopVisits || 1);
    const mobilePercentage = Math.round((analytics.mobileVisits || 1) / totalDevices * 100);
    const desktopPercentage = 100 - mobilePercentage;
    const dailyKeys = Object.keys(analytics.dailyVisits || {}).sort().slice(-7);
    const dailyStats = dailyKeys.map((k) => ({
      date: k,
      label: analytics.dailyVisits[k].label || k,
      visits: analytics.dailyVisits[k].visits || 0,
      uniques: analytics.dailyVisits[k].uniques || Math.round((analytics.dailyVisits[k].visits || 0) * 0.72)
    }));
    const topPages = Object.values(analytics.pageViews || {}).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
    const topReferrers = Object.entries(analytics.referrers || {}).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 6);
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
      updatedAt: analytics.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/analytics/config", (_req, res) => {
  const cfg = getGaConfigFile();
  res.json({ success: true, config: cfg });
});
var ADS_CONFIG_FILE = path.join(__dirname, "data", "ads.json");
var PUBLIC_ADS_CONFIG_FILE = path.join(__dirname, "public", "data", "ads.json");
var ADS_TXT_FILE = path.join(__dirname, "public", "ads.txt");
var INDEX_HTML_FILE = path.join(__dirname, "index.html");
function getAdsConfigFile() {
  try {
    if (fs.existsSync(ADS_CONFIG_FILE)) {
      const data = fs.readFileSync(ADS_CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading ads config:", err);
  }
  return null;
}
function updateAdSenseFiles(pubId) {
  if (!pubId || !pubId.trim()) return;
  const cleanPub = pubId.trim();
  const rawNumber = cleanPub.replace(/^(ca-)?pub-/, "");
  const pubWithPub = `pub-${rawNumber}`;
  const pubWithCa = `ca-pub-${rawNumber}`;
  try {
    const adsTxtContent = `# Google AdSense ads.txt for amarmetro.com
google.com, ${pubWithPub}, DIRECT, f08c47fec0942fa0
`;
    fs.writeFileSync(ADS_TXT_FILE, adsTxtContent, "utf-8");
    const distAdsTxt = path.join(__dirname, "dist", "ads.txt");
    if (fs.existsSync(path.dirname(distAdsTxt))) {
      fs.writeFileSync(distAdsTxt, adsTxtContent, "utf-8");
    }
  } catch (e) {
    console.error("Error updating ads.txt:", e);
  }
  try {
    if (fs.existsSync(INDEX_HTML_FILE)) {
      let html = fs.readFileSync(INDEX_HTML_FILE, "utf-8");
      if (html.includes('name="google-adsense-account"')) {
        html = html.replace(/<meta\s+name=["']google-adsense-account["']\s+content=["'][^"']*["']\s*\/?>/gi, `<meta name="google-adsense-account" content="${pubWithCa}" id="google-adsense-meta" />`);
      } else if (html.includes("</head>")) {
        html = html.replace("</head>", `  <meta name="google-adsense-account" content="${pubWithCa}" id="google-adsense-meta" />
</head>`);
      }
      const scriptTag = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubWithCa}" crossorigin="anonymous" id="google-adsense-script"></script>`;
      if (html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
        html = html.replace(/<script\s+async\s+src=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"']*["']\s+crossorigin=["']anonymous["'][^>]*><\/script>/gi, scriptTag);
      } else if (html.includes("</head>")) {
        html = html.replace("</head>", `  ${scriptTag}
</head>`);
      }
      fs.writeFileSync(INDEX_HTML_FILE, html, "utf-8");
    }
  } catch (e) {
    console.error("Error updating index.html for AdSense:", e);
  }
}
app.get("/api/ads", (_req, res) => {
  const cfg = getAdsConfigFile();
  res.json(cfg || {});
});
app.post("/api/ads", (req, res) => {
  try {
    const config = req.body;
    if (!config) {
      return res.status(400).json({ success: false, message: "\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" });
    }
    const payload = JSON.stringify(config, null, 2);
    fs.mkdirSync(path.dirname(ADS_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(ADS_CONFIG_FILE, payload, "utf-8");
    fs.mkdirSync(path.dirname(PUBLIC_ADS_CONFIG_FILE), { recursive: true });
    fs.writeFileSync(PUBLIC_ADS_CONFIG_FILE, payload, "utf-8");
    if (config.googleAdSense && config.googleAdSense.publisherId) {
      updateAdSenseFiles(config.googleAdSense.publisherId);
    }
    res.json({ success: true, message: "\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09AA\u09A8 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u0993 ads.txt \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u09DF\u09C7\u099B\u09C7", config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
var CONTACTS_FILE = path.join(__dirname, "data", "contact_inquiries.json");
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "\u09B8\u0995\u09B2 \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u09C0\u09DF \u09A4\u09A5\u09CD\u09AF \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    let inquiries = [];
    if (fs.existsSync(CONTACTS_FILE)) {
      try {
        inquiries = JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf-8"));
      } catch {
      }
    }
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: (subject || "\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE").trim(),
      message: message.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    inquiries.unshift(newInquiry);
    fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(inquiries.slice(0, 100), null, 2), "utf-8");
    res.json({ success: true, message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u099C\u09AE\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/analytics/config", (req, res) => {
  try {
    const { measurementId, isEnabled, debugMode, trackPageviews, trackClicks } = req.body;
    if (measurementId && !measurementId.trim().startsWith("G-")) {
      return res.status(400).json({ success: false, message: 'Google Analytics 4 Measurement ID must start with "G-" (e.g. G-XXXXXXXXXX)' });
    }
    const current = getGaConfigFile();
    const updated = {
      ...current,
      measurementId: measurementId !== void 0 ? measurementId.trim() : current.measurementId,
      isEnabled: isEnabled !== void 0 ? !!isEnabled : current.isEnabled,
      debugMode: debugMode !== void 0 ? !!debugMode : current.debugMode,
      trackPageviews: trackPageviews !== void 0 ? !!trackPageviews : current.trackPageviews,
      trackClicks: trackClicks !== void 0 ? !!trackClicks : current.trackClicks,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveGaConfigFile(updated);
    res.json({ success: true, message: "\u0997\u09C1\u0997\u09B2 \u098F\u09A8\u09BE\u09B2\u09BF\u099F\u09BF\u0995\u09B8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7", config: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/api/preset-images", (_req, res) => {
  const images = getPresetImages();
  res.json({ success: true, count: images.length, images });
});
app.post("/api/preset-images", (req, res) => {
  try {
    const { name, url, base64Data } = req.body;
    let finalUrl = url;
    if (base64Data) {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const dataBuffer = matches ? Buffer.from(matches[2], "base64") : Buffer.from(base64Data, "base64");
      const safeName = `preset-${Date.now()}-${Math.floor(1e3 + Math.random() * 9e3)}.jpg`;
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, dataBuffer);
      finalUrl = `/uploads/${safeName}`;
    }
    if (!finalUrl) {
      return res.status(400).json({ success: false, message: "\u099B\u09AC\u09BF\u09B0 \u09B2\u09BF\u0982\u0995 \u09AC\u09BE \u09AB\u09BE\u0987\u09B2 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8" });
    }
    const images = getPresetImages();
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: (name || "\u09AE\u09C7\u099F\u09CD\u09B0\u09CB\u09B0\u09C7\u09B2 \u099B\u09AC\u09BF").trim(),
      url: finalUrl,
      isDefault: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    images.push(newPreset);
    savePresetImages(images);
    res.status(201).json({ success: true, message: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u099B\u09AC\u09BF \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7", preset: newPreset, images });
  } catch (err) {
    res.status(500).json({ success: false, message: "\u099B\u09AC\u09BF \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: " + err.message });
  }
});
app.delete("/api/preset-images/:id", (req, res) => {
  const { id } = req.params;
  let images = getPresetImages();
  const initialCount = images.length;
  images = images.filter((img) => img.id !== id && img.url !== id);
  if (images.length === initialCount) {
    return res.status(404).json({ success: false, message: "\u099B\u09AC\u09BF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF" });
  }
  savePresetImages(images);
  res.json({ success: true, message: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u099B\u09AC\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7", images });
});
app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  const existing = posts[index];
  const wordCount = (content || existing.content || "").trim().split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${readMinutes} \u09AE\u09BF\u09A8\u09BF\u099F`;
  posts[index] = {
    ...existing,
    title: title !== void 0 ? title.trim() : existing.title,
    excerpt: excerpt !== void 0 ? excerpt.trim() : existing.excerpt,
    content: content !== void 0 ? content.trim() : existing.content,
    category: category !== void 0 ? category : existing.category,
    coverImage: coverImage !== void 0 ? coverImage : existing.coverImage,
    tags: tags !== void 0 ? Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter(Boolean) : existing.tags,
    author: author !== void 0 ? { ...existing.author, ...author } : existing.author,
    status: status !== void 0 ? status : existing.status,
    readTime,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  savePosts(posts);
  res.json({ success: true, message: "\u09AA\u09CB\u09B8\u09CD\u099F \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7", post: posts[index] });
});
app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  let posts = getPosts();
  const initialLength = posts.length;
  posts = posts.filter((p) => p.id !== id && p.slug !== id);
  if (posts.length === initialLength) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  savePosts(posts);
  res.json({ success: true, message: "\u09AA\u09CB\u09B8\u09CD\u099F \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7" });
});
app.get("/api/status", (_req, res) => {
  res.json({
    line: "MRT Line-6",
    status: "normal",
    statusTextBn: "\u099F\u09CD\u09B0\u09C7\u09A8 \u099A\u09B2\u09BE\u099A\u09B2 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995",
    statusTextEn: "Normal Service",
    peakHeadway: "\u09EC \u09AE\u09BF\u09A8\u09BF\u099F",
    offPeakHeadway: "\u09E7\u09E6 \u09AE\u09BF\u09A8\u09BF\u099F",
    operatingHours: "\u09B8\u0995\u09BE\u09B2 \u09E6\u09ED:\u09E7\u09E6 - \u09B0\u09BE\u09A4 \u09E6\u09EF:\u09EA\u09E6",
    activeStations: 16,
    announcement: "\u09AE\u09A4\u09BF\u099D\u09BF\u09B2-\u0995\u09AE\u09B2\u09BE\u09AA\u09C1\u09B0 \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3 \u0995\u09BE\u099C \u09A6\u09CD\u09B0\u09C1\u09A4 \u098F\u0997\u09BF\u09AF\u09BC\u09C7 \u099A\u09B2\u09C7\u099B\u09C7\u0964 \u09AF\u09BE\u09A4\u09CD\u09B0\u09C0\u09A6\u09C7\u09B0 \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u0995\u09B0\u09BE \u09B9\u099A\u09CD\u099B\u09C7 \u09B8\u09CD\u099F\u09C7\u09B6\u09A8\u09C7 \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BE \u098F\u09AE\u0986\u09B0\u099F\u09BF \u09AA\u09BE\u09B8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF\u0964"
  });
});
function renderHtmlWithPostMeta(template, post, req) {
  const host = req.get("host") || "amarmetro.com";
  const protocol = req.protocol || "https";
  const fullOrigin = `${protocol}://${host}`;
  const postUrl = `${fullOrigin}/?post=${encodeURIComponent(post.slug || post.id)}`;
  const title = `${post.title} | Amar Metro - \u0986\u09AE\u09BE\u09B0 \u09AE\u09C7\u099F\u09CD\u09B0\u09CB`;
  const desc = post.excerpt || "\u09A2\u09BE\u0995\u09BE \u09AE\u09C7\u099F\u09CD\u09B0\u09CB \u09B0\u09C7\u09B2 \u098F\u09AE\u0986\u09B0\u099F\u09BF \u09B2\u09BE\u0987\u09A8-\u09EC \u098F\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0997\u09BE\u0987\u09A1 \u0993 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8\u0964";
  const imgUrl = (post.coverImage || "").startsWith("http") ? post.coverImage : `${fullOrigin}${post.coverImage}`;
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
function findRequestedPost(req) {
  let postParam = req.query.post;
  if (!postParam) {
    const postMatch = req.path.match(/^\/(?:post|article)\/(.+)$/);
    if (postMatch) {
      postParam = postMatch[1];
    }
  }
  if (!postParam) return null;
  const decodedParam = decodeURIComponent(postParam).toLowerCase();
  const posts = getPosts();
  return posts.find(
    (p) => p.slug && p.slug.toLowerCase() === decodedParam || p.id && p.id.toLowerCase() === decodedParam
  ) || null;
}
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(
      "/assets",
      express.static(path.join(__dirname, "dist", "assets"), {
        maxAge: "365d",
        immutable: true
      })
    );
    app.use(
      express.static(path.join(__dirname, "dist"), {
        maxAge: "1d",
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          }
        }
      })
    );
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      const post = findRequestedPost(req);
      const indexPath = path.join(__dirname, "dist", "index.html");
      if (post && fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        const rendered = renderHtmlWithPostMeta(rawHtml, post, req);
        return res.send(rendered);
      }
      res.sendFile(indexPath);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(async (req, res, next) => {
      const isHtmlReq = req.headers.accept && req.headers.accept.includes("text/html");
      if (req.method === "GET" && isHtmlReq && !req.path.startsWith("/api") && !req.path.startsWith("/@") && !req.path.startsWith("/node_modules")) {
        const post = findRequestedPost(req);
        if (post) {
          try {
            const rawTemplate = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
            const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
            const rendered = renderHtmlWithPostMeta(transformed, post, req);
            res.setHeader("Content-Type", "text/html");
            return res.send(rendered);
          } catch (e) {
            console.error("Dev SSR error:", e);
          }
        }
      }
      vite.middlewares(req, res, next);
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
