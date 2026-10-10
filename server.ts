import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

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

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')));

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

function savePosts(posts: any[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving posts file:', err);
  }
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

const AUTH_FILE = path.join(__dirname, 'data', 'auth.json');

// Admin verify
app.post('/api/admin/verify', (req, res) => {
  const { password, hash } = req.body;

  try {
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (authData && authData.passwordHash) {
        if (hash && hash === authData.passwordHash) {
          return res.json({ success: true, token: 'amarmetro-secure-token' });
        }
      }
    }
  } catch (e) {
    console.error('Error reading auth file:', e);
  }

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
    const dir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ passwordHash: newHash, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
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

// Update post (Admin)
app.put('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, excerpt, content, category, coverImage, tags, author, status } = req.body;

  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === id);

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

  posts = posts.filter((p: any) => p.id !== id);

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

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
