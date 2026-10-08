// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var DATA_FILE = path.join(__dirname, "data", "posts.json");
var UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use("/uploads", express.static(UPLOADS_DIR));
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
function savePosts(posts) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving posts file:", err);
  }
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
app.post("/api/admin/verify", (req, res) => {
  const { password } = req.body;
  if (password === "admin123" || password === "metro2026" || password === "admin") {
    return res.json({ success: true, token: "demo-admin-token-valid" });
  }
  return res.status(401).json({ success: false, message: "\u09AD\u09C1\u09B2 \u098F\u09A1\u09AE\u09BF\u09A8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
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
app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id);
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
  posts = posts.filter((p) => p.id !== id);
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
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
