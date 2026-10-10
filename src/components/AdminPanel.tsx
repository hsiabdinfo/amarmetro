import React, { useState } from 'react';
import { BlogPost, PostFormData } from '../types/blog.ts';
import { METRO_CATEGORIES, PRESET_IMAGE_OPTIONS } from '../data/metroData.ts';
import {
  X,
  PlusCircle,
  ListFilter,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Save,
  Send,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Server,
  Globe,
  Key,
  Upload,
  Copy,
  Check,
  Download,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPost[];
  onRefreshPosts: () => Promise<void>;
  lang: 'bn' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  posts,
  onRefreshPosts,
  lang,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('amarmetro_admin_auth') === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin tabs: 'create' | 'manage' | 'guide'
  const [adminTab, setAdminTab] = useState<'create' | 'manage' | 'guide'>('create');
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');

  // New Post Form State (Author strictly set to Admin)
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: 'খবর ও আপডেট',
    coverImage: PRESET_IMAGE_OPTIONS[0].url,
    tags: 'মেট্রো, ঢাকা, ট্রেন',
    authorName: 'এডমিন',
    authorRole: 'amarmetro.com',
    status: 'published',
  });

  // Edit Post State
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Status / Loading messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', lang === 'bn' ? 'শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।' : 'Please upload an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showNotification('success', lang === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে!' : 'Image uploaded successfully!');
          setFormData((prev) => ({ ...prev, coverImage: data.url }));
        } else {
          showNotification('error', data.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('error', 'ছবি আপলোড ব্যর্থ: ' + err.message);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin123' || adminPin === 'admin' || adminPin === 'metro2026' || adminPin === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('amarmetro_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError(lang === 'bn' ? 'ভুল পাসওয়ার্ড! (ডেমো পাসওয়ার্ড: admin123)' : 'Invalid password! (Demo: admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('amarmetro_admin_auth');
  };

  const handleDownloadPostsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'posts.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('success', lang === 'bn' ? 'posts.json ফাইল ডাউনলোড হয়েছে! এটি গিটহাবে data/posts.json এ রিপ্লেস করতে পারেন।' : 'posts.json downloaded successfully!');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('error', lang === 'bn' ? 'শিরোনাম ও বিষয়বস্তু আবশ্যক' : 'Title and content are required');
      return;
    }

    setIsSubmitting(true);
    let serverSaved = false;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          coverImage: formData.coverImage,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          author: {
            name: formData.authorName,
            role: formData.authorRole,
          },
          status: formData.status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          serverSaved = true;
          showNotification(
            'success',
            lang === 'bn'
              ? 'পোস্ট সফলভাবে ব্যাক এন্ডে সংরক্ষিত ও প্রকাশিত হয়েছে!'
              : 'Post successfully published to backend!'
          );
        }
      }
    } catch (err: any) {
      console.warn('Backend API not available, falling back to static storage:', err);
    }

    if (!serverSaved) {
      // Fallback for GitHub Pages / static hosting
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').slice(0, 50) + `-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title.trim(),
        excerpt: (formData.excerpt || formData.content.substring(0, 160) + '...').trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        author: {
          name: 'এডমিন',
          role: 'amarmetro.com',
        },
        readTime: `${Math.max(1, Math.ceil(formData.content.length / 450))} মিনিট`,
        views: 1,
        createdAt: new Date().toISOString().split('T')[0],
        status: formData.status,
      };

      const existingCached = localStorage.getItem('amarmetro_posts_cache');
      const currentPosts: BlogPost[] = existingCached ? JSON.parse(existingCached) : posts;
      const updatedPosts = [newPost, ...currentPosts];
      localStorage.setItem('amarmetro_posts_cache', JSON.stringify(updatedPosts));

      showNotification(
        'success',
        lang === 'bn'
          ? 'পোস্ট লোকাল স্টোরেজে যুক্ত হয়েছে (GitHub Pages মোড)! সবার জন্য স্থায়ী করতে "posts.json ডাউনলোড" করে রিপোজিটরিতে data/posts.json আপডেট করতে পারেন।'
          : 'Post saved locally (GitHub Pages mode). Download posts.json to commit changes permanently.'
      );
    }

    // Reset form
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'খবর ও আপডেট',
      coverImage: PRESET_IMAGE_OPTIONS[0].url,
      tags: 'মেট্রো, ঢাকা, ট্রেন',
      authorName: 'এডমিন',
      authorRole: 'amarmetro.com',
      status: 'published',
    });
    setIsSubmitting(false);
    await onRefreshPosts();
    setAdminTab('manage');
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmitting(true);
    let serverUpdated = false;

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPost.title,
          excerpt: editingPost.excerpt,
          content: editingPost.content,
          category: editingPost.category,
          coverImage: editingPost.coverImage,
          tags: editingPost.tags,
          author: editingPost.author,
          status: editingPost.status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          serverUpdated = true;
          showNotification('success', lang === 'bn' ? 'পোস্ট সফলভাবে আপডেট করা হয়েছে' : 'Post updated successfully');
        }
      }
    } catch (err: any) {
      console.warn('Backend update failed, updating static local state:', err);
    }

    if (!serverUpdated) {
      const existingCached = localStorage.getItem('amarmetro_posts_cache');
      const currentPosts: BlogPost[] = existingCached ? JSON.parse(existingCached) : posts;
      const updatedPosts = currentPosts.map((p) => (p.id === editingPost.id ? editingPost : p));
      localStorage.setItem('amarmetro_posts_cache', JSON.stringify(updatedPosts));
      showNotification('success', lang === 'bn' ? 'পোস্ট সফলভাবে আপডেট হয়েছে (লোকাল স্টোরেজ)' : 'Post updated locally');
    }

    setEditingPost(null);
    setIsSubmitting(false);
    await onRefreshPosts();
  };

  const handleDeletePost = async (id: string, title: string) => {
    const confirmDelete = window.confirm(
      lang === 'bn'
        ? `আপনি কি নিশ্চিতভাবে "${title}" পোস্টটি মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${title}"?`
    );
    if (!confirmDelete) return;

    let serverDeleted = false;
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          serverDeleted = true;
          showNotification('success', lang === 'bn' ? 'পোস্ট মুছে ফেলা হয়েছে' : 'Post deleted successfully');
        }
      }
    } catch (err: any) {
      console.warn('Backend delete failed, removing from local state:', err);
    }

    if (!serverDeleted) {
      const existingCached = localStorage.getItem('amarmetro_posts_cache');
      const currentPosts: BlogPost[] = existingCached ? JSON.parse(existingCached) : posts;
      const updatedPosts = currentPosts.filter((p) => p.id !== id);
      localStorage.setItem('amarmetro_posts_cache', JSON.stringify(updatedPosts));
      showNotification('success', lang === 'bn' ? 'পোস্ট মুছে ফেলা হয়েছে (লোকাল স্টোরেজ)' : 'Post deleted locally');
    }

    await onRefreshPosts();
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    let serverUpdated = false;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        serverUpdated = true;
        showNotification(
          'success',
          newStatus === 'published'
            ? lang === 'bn' ? 'পোস্ট প্রকাশিত করা হয়েছে' : 'Post published'
            : lang === 'bn' ? 'পোস্ট ড্রাফট করা হয়েছে' : 'Post moved to draft'
        );
      }
    } catch (err: any) {
      console.warn('Backend status toggle failed, updating local state:', err);
    }

    if (!serverUpdated) {
      const existingCached = localStorage.getItem('amarmetro_posts_cache');
      const currentPosts: BlogPost[] = existingCached ? JSON.parse(existingCached) : posts;
      const updatedPosts = currentPosts.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p));
      localStorage.setItem('amarmetro_posts_cache', JSON.stringify(updatedPosts));
      showNotification('success', lang === 'bn' ? `স্ট্যাটাস পরিবর্তন: ${newStatus}` : `Status updated to ${newStatus}`);
    }

    await onRefreshPosts();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  amarmetro.com · {lang === 'bn' ? 'ব্যাক এন্ড কন্ট্রোল প্যানেল' : 'Backend Publishing CMS'}
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                  REST API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'সরাসরি ব্লগ পোস্ট তৈরি, সম্পাদন ও প্রকাশনা ব্যবস্থাপনা' : 'Publish and manage posts with persistent backend storage'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'লগআউট' : 'Logout'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!isAuthenticated ? (
            /* Authentication Screen */
            <div className="max-w-md mx-auto py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-slate-900 mb-2">
                {lang === 'bn' ? 'এডমিন অ্যাক্সেস আবশ্যক' : 'Admin Authentication Required'}
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                {lang === 'bn'
                  ? 'amarmetro.com এ পোস্ট প্রকাশ করার জন্য আপনার এডমিন পাসওয়ার্ড লিখুন।'
                  : 'Enter your admin password to publish or modify blog content.'}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder={lang === 'bn' ? 'এডমিন পাসওয়ার্ড লিখুন' : 'Enter admin password'}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  {authError && <p className="text-xs text-rose-600 mt-2 font-medium">{authError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্যানেলে প্রবেশ করুন' : 'Unlock Dashboard'}</span>
                </button>

                {/* Instant Demo Helper */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    {lang === 'bn' ? 'ডেমো এডমিন পাসওয়ার্ড:' : 'Demo Pass:'} <strong className="text-slate-800 font-mono">admin123</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPin('admin123');
                      setIsAuthenticated(true);
                      localStorage.setItem('amarmetro_admin_auth', 'true');
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? '১-ক্লিকে লগইন' : '1-Click Login'}
                  </button>
                </div>
              </form>
            </div>
          ) : editingPost ? (
            /* Editing An Existing Post Screen */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <button
                  onClick={() => setEditingPost(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to list'}</span>
                </button>
                <h4 className="font-bold text-slate-900 text-lg">
                  {lang === 'bn' ? 'পোস্ট সম্পাদনা (Edit Post)' : 'Edit Post'}
                </h4>
              </div>

              <form onSubmit={handleUpdatePost} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'পোস্টের শিরোনাম (Title)' : 'Post Title'}
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {lang === 'bn' ? 'বিভাগ (Category)' : 'Category'}
                    </label>
                    <select
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                    >
                      {METRO_CATEGORIES.filter((c) => c !== 'সব বিভাগ').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {lang === 'bn' ? 'স্ট্যাটাস (Status)' : 'Status'}
                    </label>
                    <select
                      value={editingPost.status}
                      onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                    >
                      <option value="published">{lang === 'bn' ? 'প্রকাশিত (Published)' : 'Published'}</option>
                      <option value="draft">{lang === 'bn' ? 'ড্রাফট (Draft)' : 'Draft'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)' : 'Short Excerpt'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'মূল বিষয়বস্তু (Full Content / Markdown)' : 'Content (Markdown)'}
                  </label>
                  <textarea
                    rows={8}
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes')}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Admin Dashboard */
            <div className="space-y-6">
              {/* Dashboard Navigation Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdminTab('create')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      adminTab === 'create'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নতুন পোস্ট প্রকাশ করুন' : 'Create & Publish Post'}</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('manage')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      adminTab === 'manage'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" />
                    <span>{lang === 'bn' ? `পোস্ট ব্যবস্থাপনা (${posts.length})` : `Manage Posts (${posts.length})`}</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('guide')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      adminTab === 'guide'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'হোস্টিং ও লগইন গাইড' : 'Hosting & Login Guide'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    {lang === 'bn' ? 'মোট পোস্ট:' : 'Total:'} <strong className="text-slate-800">{posts.length}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'bn' ? 'প্রকাশিত:' : 'Published:'}{' '}
                    <strong className="text-emerald-700">{posts.filter((p) => p.status === 'published').length}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'bn' ? 'ড্রাফট:' : 'Drafts:'}{' '}
                    <strong className="text-amber-700">{posts.filter((p) => p.status === 'draft').length}</strong>
                  </span>
                </div>
              </div>

              {/* Tab 1: Create New Post Form */}
              {adminTab === 'create' && (
                <form onSubmit={handleCreatePost} className="space-y-6">
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                        <span>{lang === 'bn' ? 'পোস্টের শিরোনাম *' : 'Post Title *'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{formData.title.length}/100</span>
                      </label>
                      <input
                        type="text"
                        placeholder={
                          lang === 'bn'
                            ? 'যেমন: মেট্রোরেলে এমআরটি পাসের নতুন নিয়ম ও রিচার্জ পদ্ধতি'
                            : 'e.g., Guide to Dhaka Metro MRT Pass & Recharging'
                        }
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        {lang === 'bn' ? 'বিভাগ (Category) *' : 'Category *'}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                      >
                        {METRO_CATEGORIES.filter((c) => c !== 'সব বিভাগ').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)' : 'Short Excerpt'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {lang === 'bn' ? 'হোমপেজ ও কার্ডে প্রদর্শিত হবে' : 'Shown on card preview'}
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        lang === 'bn'
                          ? 'পাঠকদের আকর্ষণ করার মতো ১-২ লাইনের সারসংক্ষেপ লিখুন...'
                          : 'A brief 1-2 sentence summary to hook the reader...'
                      }
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Cover Image & Upload Section */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'পোস্টের ছবি নির্বাচন বা সরাসরি আপলোড' : 'Select or Upload Image'}</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {lang === 'bn' ? 'JPG, PNG, WebP সমর্থিত' : 'JPG, PNG, WebP'}
                      </span>
                    </div>

                    {/* Direct File Upload from Device Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white rounded-xl border border-dashed border-emerald-300">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>
                          {isUploading
                            ? (lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading image...')
                            : (lang === 'bn' ? '📁 কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন' : 'Upload from Device')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>

                      {formData.coverImage.startsWith('/uploads/') && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {lang === 'bn' ? 'আপলোড সফল' : 'Uploaded'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`![মেট্রোরেল ছবি](${formData.coverImage})`);
                              setCopiedMarkdown(true);
                              setTimeout(() => setCopiedMarkdown(false), 2000);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="পোস্টের লেখার ভেতরে ছবি ব্যবহারের কোড কপি করুন"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedMarkdown ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কন্টেন্ট কোড কপি' : 'Copy Tag')}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Presets Option */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        {lang === 'bn' ? 'অথবা মেট্রোরেলের প্রস্তুত ছবি নির্বাচন করুন:' : 'Or choose from presets:'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                        {PRESET_IMAGE_OPTIONS.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormData({ ...formData, coverImage: img.url })}
                            className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              formData.coverImage === img.url
                                ? 'border-emerald-600 ring-2 ring-emerald-300'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-1 text-[9px] text-white font-medium truncate text-center">
                              {img.name}
                            </div>
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'বর্তমান ছবির লিংক বা URL' : 'Current image URL'}
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Main Content with Write / Preview Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'bn' ? 'মূল বিষয়বস্তু (Content - Markdown সমর্থিত) *' : 'Article Body (Markdown) *'}</span>
                      </label>

                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setContentTab('write')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                            contentTab === 'write' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {lang === 'bn' ? 'এডিটর' : 'Write'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentTab('preview')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                            contentTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Preview'}
                        </button>
                      </div>
                    </div>

                    {contentTab === 'write' ? (
                      <div className="space-y-2">
                        {/* Quick Markdown formatting bar */}
                        <div className="flex items-center gap-2 py-1 px-2 bg-slate-100 rounded-lg text-xs text-slate-600">
                          <span className="font-semibold text-slate-500">{lang === 'bn' ? 'টুলস:' : 'Shortcuts:'}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, content: formData.content + '\n## সেকশন শিরোনাম\n' })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer font-bold"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, content: formData.content + '\n### সাব-শিরোনাম\n' })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer font-bold"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, content: formData.content + '\n- পয়েন্ট ১\n- পয়েন্ট ২\n' })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                          >
                            • বুলেট লিস্ট
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, content: formData.content + '\n1. প্রথম ধাপ\n2. দ্বিতীয় ধাপ\n' })}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                          >
                            1. নম্বর লিস্ট
                          </button>
                        </div>

                        <textarea
                          rows={10}
                          placeholder={
                            lang === 'bn'
                              ? 'আপনার আর্টিকেলের বিশদ বিবরণ এখানে লিখুন...\n\n## প্রথম সেকশন\nমেট্রো রেলের সুবিধা...\n\n### গুরুত্বপূর্ণ পয়েন্ট\n- সহজে টিকিট রিচার্জ\n- ১০% নগদ সাশ্রয়'
                              : 'Write detailed article content here (Markdown supported)...'
                          }
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          required
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl min-h-[240px] prose prose-slate max-w-none text-sm">
                        {formData.content ? (
                          formData.content.split('\n').map((line, idx) => {
                            if (line.startsWith('## ')) return <h2 key={idx} className="text-lg font-bold text-slate-900 my-2">{line.replace('## ', '')}</h2>;
                            if (line.startsWith('### ')) return <h3 key={idx} className="text-base font-bold text-slate-900 my-1">{line.replace('### ', '')}</h3>;
                            if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc text-slate-700">{line.replace('- ', '')}</li>;
                            if (/^\d+\.\s/.test(line)) return <li key={idx} className="ml-4 list-decimal text-slate-700">{line.replace(/^\d+\.\s/, '')}</li>;
                            if (line.trim() === '') return <div key={idx} className="h-2"></div>;
                            return <p key={idx} className="text-slate-700 my-1">{line}</p>;
                          })
                        ) : (
                          <p className="text-slate-400 italic">
                            {lang === 'bn' ? 'বিষয়বস্তু লিখলে প্রিভিউ দেখা যাবে' : 'Write content to view preview'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata: Tags, Author, Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {lang === 'bn' ? 'ট্যাগস (কমা দিয়ে আলাদা)' : 'Tags (comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {lang === 'bn' ? 'পোস্ট লেখক (স্থায়ী)' : 'Author (Locked)'}
                      </label>
                      <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>এডমিন (amarmetro.com)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {lang === 'bn' ? 'প্রকাশনা স্ট্যাটাস' : 'Publishing Status'}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        <option value="published">
                          {lang === 'bn' ? 'সরাসরি প্রকাশ (Published)' : 'Published Immediately'}
                        </option>
                        <option value="draft">
                          {lang === 'bn' ? 'ড্রাফট হিসেবে রাখুন (Draft)' : 'Draft only'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? lang === 'bn' ? 'ব্যাক এন্ডে সেভ হচ্ছে...' : 'Saving to Backend...'
                          : lang === 'bn' ? 'পোস্ট ব্যাক এন্ডে পাবলিশ করুন' : 'Publish to Backend'}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Manage Existing Posts */}
              {adminTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h5 className="font-bold text-sm text-slate-800">
                      {lang === 'bn' ? 'সকল ব্লগ পোস্টের তালিকা' : 'All Blog Posts'}
                    </h5>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadPostsJson}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="GitHub এ data/posts.json ফাইল রিপ্লেস করতে এই ফাইলটি ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? '📥 data/posts.json ডাউনলোড' : 'Download posts.json'}</span>
                      </button>
                      <button
                        onClick={() => onRefreshPosts()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                              <span className="font-semibold text-emerald-700">{post.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{post.views || 0} views</span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`font-semibold ${
                                  post.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                              >
                                {post.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                              {post.title}
                            </h4>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                            title="স্ট্যাটাস পরিবর্তন"
                          >
                            {post.status === 'published' ? (lang === 'bn' ? 'ড্রাফট করুন' : 'To Draft') : (lang === 'bn' ? 'পাবলিশ করুন' : 'Publish')}
                          </button>

                          <button
                            onClick={() => setEditingPost(post)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Hosting and Login Instructions */}
              {adminTab === 'guide' && (
                <div className="space-y-6">
                  {/* Guide Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {lang === 'bn' ? 'হোস্টিং ও পোস্ট পাবলিশিং সম্পূর্ণ গাইড' : 'Complete Hosting & Publishing Guide'}
                        </h4>
                        <p className="text-xs text-emerald-200">
                          amarmetro.com ডোমেইন কানেক্ট করা ও ব্লগে পোস্ট ম্যানেজ করার বিস্তারিত নিয়ম
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 1: How to Login & Publish */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Key className="w-5 h-5 text-emerald-600" />
                      <h5 className="font-bold text-base text-slate-900">
                        {lang === 'bn' ? '১. কীভাবে ব্লগ যোগ করার জন্য লগইন করবেন?' : '1. How to Login & Publish Blog Posts'}
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold inline-flex items-center justify-center">
                          ১
                        </span>
                        <h6 className="font-bold text-slate-900 text-sm">গোপন লিংকে প্রবেশ করুন</h6>
                        <p className="leading-relaxed">
                          ব্রাউজারের অ্যাড্রেস বারে সরাসরি লিখুন: <code className="bg-emerald-100 text-emerald-950 font-mono font-bold px-1 rounded">/backend/login</code> (সাধারণ ভিজিটরদের থেকে এই লিংক সম্পূর্ণ গোপন রাখা হয়েছে)।
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold inline-flex items-center justify-center">
                          ২
                        </span>
                        <h6 className="font-bold text-slate-900 text-sm">পাসওয়ার্ড দিয়ে আনলক করুন</h6>
                        <p className="leading-relaxed">
                          পাসওয়ার্ড ফিল্ডে লিখুন: <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">admin123</code> অথবা <strong>"১-ক্লিকে লগইন"</strong> লিংকে চাপুন।
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold inline-flex items-center justify-center">
                          ৩
                        </span>
                        <h6 className="font-bold text-slate-900 text-sm">পোস্ট প্রকাশ করুন</h6>
                        <p className="leading-relaxed">
                          শিরোনাম ও বিবরণ লিখুন। লেখক স্বয়ংক্রিয়ভাবে <strong>এডমিন</strong> হিসেবে সংরক্ষিত হবে। "পোস্ট ব্যাক এন্ডে পাবলিশ করুন" চাপলেই তা তৎক্ষণাৎ ব্লগে লাইভ হবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: How to Host amarmetro.com */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <h5 className="font-bold text-base text-slate-900">
                        {lang === 'bn' ? '২. amarmetro.com সাইটটি কীভাবে হোস্ট করবেন?' : '2. How to Host amarmetro.com'}
                      </h5>
                    </div>

                    {/* cPanel Hosting Guide - Highlighted */}
                    <div className="space-y-3 p-4 bg-emerald-50/60 border-2 border-emerald-500/50 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h6 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>cPanel এ হোস্টিং করার সহজ নিয়ম (Setup Node.js App)</span>
                          <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-2 py-0.5 rounded-sm font-bold">আপনার জন্য প্রস্তাবিত</span>
                        </h6>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed">
                        <p>
                          <strong>ধাপ ১: cPanel এ লগইন করুন</strong> এবং Software সেকশন থেকে <strong>"Setup Node.js App"</strong> আইকনে ক্লিক করুন।
                        </p>
                        <p>
                          <strong>ধাপ ২: "Create Application"</strong> বাটনে ক্লিক করুন।
                        </p>
                        <ul className="list-disc ml-5 space-y-1 text-slate-700">
                          <li><strong>Node.js Version:</strong> <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">18.x</code> অথবা <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">20.x</code> সিলেক্ট করুন।</li>
                          <li><strong>Application Mode:</strong> <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">Production</code> সিলেক্ট করুন।</li>
                          <li><strong>Application Root:</strong> ফোল্ডারের নাম দিন (যেমন: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">amarmetro</code>)।</li>
                          <li><strong>Application URL:</strong> আপনার ডোমেইন নির্বাচন করুন (<code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">amarmetro.com</code>)।</li>
                          <li><strong>Application Startup File:</strong> লিখুন: <code className="bg-emerald-100 text-emerald-900 font-mono font-bold px-1.5 py-0.5 rounded">server.js</code> (অথবা <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">app.js</code>)।</li>
                        </ul>
                        <p>
                          <strong>ধাপ ৩: ফাইল আপলোড করুন</strong><br />
                          cPanel File Manager এ গিয়ে আপনার তৈরি করা অ্যাপ্লিকেশন ফোল্ডারে (<code className="bg-white px-1 py-0.5 rounded font-mono">amarmetro</code>) এই ফাইলগুলো আপলোড করুন:
                          <br />
                          <span className="font-mono text-[11px] text-emerald-900 bg-white p-1.5 rounded border border-emerald-200 inline-block mt-1">
                            dist/ (ফোল্ডার), data/ (ফোল্ডার), package.json, server.js, app.js
                          </span>
                        </p>
                        <p>
                          <strong>ধাপ ৪: ডিপেনডেন্সি ইন্সটল ও রান করুন</strong><br />
                          Node.js App পেজে ফিরে এসে <strong>"Run NPM Install"</strong> বাটনে ক্লিক করুন। এরপর উপরে থাকা <strong>"Restart"</strong> বাটনে চাপলেই আপনার ওয়েবসাইট <strong>amarmetro.com</strong> এ পুরোপুরি চালু হয়ে যাবে!
                        </p>
                      </div>
                    </div>

                    {/* GitHub Pages Hosting Guide */}
                    <div className="space-y-3 p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                        <h6 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>গিটহাব পেজেস (GitHub Pages) এ সাইট আপলোড ও হোস্ট করার নিয়ম</span>
                          <span className="bg-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-sm font-bold">বিনামূল্যে স্ট্যাটিক হোস্টিং</span>
                        </h6>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p>
                          <strong>১. গিটহাব রিপোজিটরি তৈরি:</strong><br />
                          GitHub.com এ গিয়ে একটি নতুন রিপোজিটরি তৈরি করুন (যেমন: <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">amarmetro</code>)।
                        </p>
                        <p>
                          <strong>২. বিল্ড তৈরি করা:</strong><br />
                          আপনার কম্পিউটারের টার্মিনালে কমান্ড চালান: <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">npm run build</code>। এটি একটি সম্পূর্ণ <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">dist/</code> ফোল্ডার তৈরি করবে।
                        </p>
                        <p>
                          <strong>৩. GitHub Pages এ ডিপ্লয় করা:</strong><br />
                          সহজ উপায়ে <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">gh-pages</code> প্যাকেজ ব্যবহার করুন:
                          <br />
                          কমান্ড চালান: <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">npx gh-pages -d dist</code>
                        </p>
                        <p>
                          <strong>৪. কাস্টম ডোমেইন (amarmetro.com) যুক্ত করা:</strong><br />
                          GitHub রিপোজিটরির <strong>Settings</strong> ➔ <strong>Pages</strong> এ যান। "Custom domain" বক্সে <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold">amarmetro.com</code> লিখে Save করুন।
                        </p>
                        <p>
                          <strong>৫. ডোমেইন DNS রেকর্ড:</strong><br />
                          আপনার ডোমেইন প্রোভাইডারে ৪টি GitHub IP এর A Record দিন: <code className="bg-slate-800 text-slate-300 font-mono">185.199.108.153</code>, <code className="bg-slate-800 text-slate-300 font-mono">185.199.109.153</code>, <code className="bg-slate-800 text-slate-300 font-mono">185.199.110.153</code>, <code className="bg-slate-800 text-slate-300 font-mono">185.199.111.153</code> এবং CNAME রেকর্ড: <code className="bg-slate-800 text-slate-300 font-mono">www ➔ &lt;username&gt;.github.io</code>।
                        </p>
                        <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-[11px] text-blue-200">
                          ℹ️ <strong>স্ট্যাটিক হোস্টিং দ্রষ্টব্য:</strong> গিটহাব পেজেস সম্পূর্ণ স্ট্যাটিক হওয়ায় এখানে ব্যাক-এন্ড নোড সার্ভার থাকে না। তাই আপনার সাইটে স্বয়ংক্রিয় ব্রাউজার লোকাল স্টোরেজ ক্যাশিং দেওয়া হয়েছে যাতে স্ট্যাটিক অবস্থাতেও পোস্টগুলো প্রদর্শিত হয়। স্থায়ী ব্যাক-এন্ড ডাটাবেসের জন্য cPanel বা VPS সবচেয়ে সেরা।
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Hosting Option 1 */}
                    <div className="space-y-3">
                      <h6 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                        <span>বিকল্প পদ্ধতি: VPS বা ক্লাউড সার্ভার (DigitalOcean / AWS / Contabo)</span>
                      </h6>
                      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                        <p className="text-slate-400"># ১. সার্ভারে Node.js (v20+) এবং PM2 ইন্সটল করুন:</p>
                        <p className="text-emerald-400">sudo apt update && sudo apt install -y nodejs npm</p>
                        <p className="text-emerald-400">sudo npm install -g pm2</p>
                        <p className="text-slate-400"># ২. প্রোজেক্ট ফোল্ডারে ডিপেনডেন্সি ও প্রোডাকশন বিল্ড করুন:</p>
                        <p className="text-emerald-400">npm install</p>
                        <p className="text-emerald-400">npm run build</p>
                        <p className="text-slate-400"># ৩. ব্যাকগ্রাউন্ড সার্ভার চালু করুন (Port 3000):</p>
                        <p className="text-emerald-400">pm2 start server.ts --name amarmetro --interpreter ./node_modules/.bin/tsx</p>
                        <p className="text-emerald-400">pm2 save && pm2 startup</p>
                      </div>
                    </div>

                    {/* Step-by-step Hosting Option 2 */}
                    <div className="space-y-3">
                      <h6 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>পদ্ধতি খ: ওয়ান-ক্লিক ক্লাউড ডিপ্লয় (Render / Railway / Cloud Run)</span>
                      </h6>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 leading-relaxed">
                        <p>• GitHub এ এই কোড রিপোজিটরি পুশ করুন।</p>
                        <p>• Render.com বা Railway.app এ গিয়ে "New Web Service" নির্বাচন করে রিপো কানেক্ট করুন।</p>
                        <p>• <strong>Build Command:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm install && npm run build</code></p>
                        <p>• <strong>Start Command:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm start</code></p>
                        <p>• এরপর কাস্টম ডোমেইন সেটিংসে <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">amarmetro.com</code> যুক্ত করুন।</p>
                      </div>
                    </div>

                    {/* DNS Records Table */}
                    <div className="space-y-2">
                      <h6 className="text-sm font-bold text-slate-900">
                        {lang === 'bn' ? 'ডোমেইন DNS রেকর্ড সেটআপ (Namecheap / Cloudflare / GoDaddy তে):' : 'DNS Records Setup:'}
                      </h6>
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">রেকর্ড টাইপ</th>
                              <th className="p-2.5">হোস্ট / নাম</th>
                              <th className="p-2.5">ভ্যালু / পয়েন্টিং অ্যাড্রেস</th>
                              <th className="p-2.5">টিটিএল (TTL)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">A</td>
                              <td className="p-2.5 font-mono">@</td>
                              <td className="p-2.5 font-mono">আপনার সার্ভারের পাবলিক IP (e.g. 159.65.x.x)</td>
                              <td className="p-2.5">Auto / 300</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">CNAME</td>
                              <td className="p-2.5 font-mono">www</td>
                              <td className="p-2.5 font-mono">amarmetro.com</td>
                              <td className="p-2.5">Auto / 300</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* SSL setup */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <strong className="block text-emerald-950 font-bold">🔒 বিনামূল্যে HTTPS / SSL সার্টিফিকেট চালু করা:</strong>
                      <p>
                        সার্ভারে Certbot রান করুন: <code className="bg-emerald-200/80 px-1.5 py-0.5 rounded font-mono font-bold">sudo certbot --nginx -d amarmetro.com -d www.amarmetro.com</code>
                      </p>
                      <p>এটি স্বয়ংক্রিয়ভাবে Let's Encrypt এর মাধ্যমে নিরাপদ গ্রীন প্যাডলক (HTTPS) যুক্ত করে দিবে।</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
