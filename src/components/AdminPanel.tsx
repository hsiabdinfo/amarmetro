import React, { useState, useEffect } from 'react';
import { BlogPost, PostFormData } from '../types/blog.ts';
import { METRO_CATEGORIES, PRESET_IMAGE_OPTIONS } from '../data/metroData.ts';
import {
  X,
  PlusCircle,
  ListFilter,
  Eye,
  EyeOff,
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
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Copy,
  Check,
  Download,
  Megaphone,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import {
  verifyAdminPassword,
  changeAdminPassword,
  checkLockoutStatus,
  createAdminSession,
  clearAdminSession,
  isSessionValid,
  getCustomSecretSlug,
  setCustomSecretSlug,
} from '../utils/security.ts';
import { AdConfig, DEFAULT_AD_CONFIG } from '../types/ad.ts';
import { getAdConfig, saveAdConfig } from '../utils/ads.ts';

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
    return isSessionValid();
  });
  const [adminPin, setAdminPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [lockoutStatus, setLockoutStatus] = useState(() => checkLockoutStatus());

  // Password Change and Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePasswords, setShowChangePasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customSlug, setCustomSlug] = useState(() => getCustomSecretSlug());
  const [slugSavedMsg, setSlugSavedMsg] = useState('');

  // Admin tabs: 'create' | 'manage' | 'ads' | 'security' | 'guide'
  const [adminTab, setAdminTab] = useState<'create' | 'manage' | 'ads' | 'security' | 'guide'>('create');
  const [contentTab, setContentTab] = useState<'write' | 'preview'>('write');

  // Ads & AdSense Management State
  const [adConfig, setAdConfig] = useState<AdConfig>(DEFAULT_AD_CONFIG);
  const [adSubTab, setAdSubTab] = useState<'adsense' | 'leaderboard' | 'inArticle' | 'guide'>('adsense');
  const [isSavingAds, setIsSavingAds] = useState(false);
  const [adSaveMsg, setAdSaveMsg] = useState('');
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);

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

  // Quick Change Image State for published posts
  const [quickChangeImagePost, setQuickChangeImagePost] = useState<BlogPost | null>(null);
  const [quickImageSelectedUrl, setQuickImageSelectedUrl] = useState<string>('');
  const [isSavingQuickImage, setIsSavingQuickImage] = useState(false);

  // Status / Loading messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Ads Config when panel opens
  useEffect(() => {
    if (isOpen) {
      getAdConfig().then((cfg) => {
        setAdConfig(cfg);
      });
    }
  }, [isOpen]);

  // High-performance image processor: compresses large mobile photos & uploads (backend API with local data URL fallback)
  const compressAndProcessImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = (e.target?.result as string) || '';
        try {
          const img = new Image();
          img.onload = async () => {
            let width = img.width;
            let height = img.height;
            const maxDimension = 1400;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            let optimizedBase64 = rawDataUrl;
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            }

            // Attempt backend API upload first
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, base64Data: optimizedBase64 }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.url) {
                  return resolve(data.url);
                }
              }
            } catch (err) {
              console.warn('Backend /api/upload unavailable, falling back to optimized base64 data URL:', err);
            }

            // Universal fallback: works even on static GitHub Pages
            resolve(optimizedBase64);
          };
          img.onerror = () => resolve(rawDataUrl);
          img.src = rawDataUrl;
        } catch {
          resolve(rawDataUrl);
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Upload handler for new post creation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', lang === 'bn' ? 'শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।' : 'Please upload an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const processedUrl = await compressAndProcessImage(file);
      if (processedUrl) {
        setFormData((prev) => ({ ...prev, coverImage: processedUrl }));
        showNotification('success', lang === 'bn' ? 'ছবি সফলভাবে যুক্ত হয়েছে!' : 'Image attached successfully!');
      } else {
        showNotification('error', lang === 'bn' ? 'ছবি প্রসেস করা সম্ভব হয়নি' : 'Failed to process image');
      }
    } catch (err: any) {
      showNotification('error', 'ছবি আপলোড ব্যর্থ: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload handler for editing an existing published post
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', lang === 'bn' ? 'শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।' : 'Please upload an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const processedUrl = await compressAndProcessImage(file);
      if (processedUrl) {
        setEditingPost((prev) => (prev ? { ...prev, coverImage: processedUrl } : null));
        showNotification('success', lang === 'bn' ? 'নতুন ছবি সফলভাবে লোড হয়েছে!' : 'New image attached successfully!');
      } else {
        showNotification('error', lang === 'bn' ? 'ছবি প্রসেস করা সম্ভব হয়নি' : 'Failed to process image');
      }
    } catch (err: any) {
      showNotification('error', 'ছবি আপলোড ব্যর্থ: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload handler for quick image change dialog
  const handleQuickImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', lang === 'bn' ? 'শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।' : 'Please upload an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const processedUrl = await compressAndProcessImage(file);
      if (processedUrl) {
        setQuickImageSelectedUrl(processedUrl);
        showNotification('success', lang === 'bn' ? 'নতুন ছবি সফলভাবে বাছাই করা হয়েছে!' : 'Image selected successfully!');
      }
    } catch (err: any) {
      showNotification('error', 'ছবি বাছাই ব্যর্থ: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Quick save changed image for a published post
  const handleSaveQuickImage = async () => {
    if (!quickChangeImagePost || !quickImageSelectedUrl.trim()) return;

    setIsSavingQuickImage(true);
    let serverUpdated = false;

    try {
      const response = await fetch(`/api/posts/${quickChangeImagePost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverImage: quickImageSelectedUrl.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          serverUpdated = true;
          showNotification('success', lang === 'bn' ? 'পোস্টের ছবি সফলভাবে পরিবর্তন ও সংরক্ষণ করা হয়েছে!' : 'Cover image updated successfully!');
        }
      }
    } catch (err: any) {
      console.warn('Backend update failed, updating static local state:', err);
    }

    if (!serverUpdated) {
      const existingCached = localStorage.getItem('amarmetro_posts_cache');
      const currentPosts: BlogPost[] = existingCached ? JSON.parse(existingCached) : posts;
      const updatedPosts = currentPosts.map((p) => (p.id === quickChangeImagePost.id ? { ...p, coverImage: quickImageSelectedUrl.trim() } : p));
      localStorage.setItem('amarmetro_posts_cache', JSON.stringify(updatedPosts));
      showNotification('success', lang === 'bn' ? 'পোস্টের ছবি লোকাল স্টোরেজে সফলভাবে পরিবর্তন হয়েছে!' : 'Cover image updated locally!');
    }

    setQuickChangeImagePost(null);
    setIsSavingQuickImage(false);
    await onRefreshPosts();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const status = checkLockoutStatus();
    if (status.isLocked) {
      setLockoutStatus(status);
      setAuthError(`অতিরিক্ত ভুল পাসওয়ার্ডের কারণে সিস্টেম সাময়িকভাবে লক রয়েছে। আর ${status.remainingMinutes} মিনিট পর চেষ্টা করুন।`);
      return;
    }

    const res = await verifyAdminPassword(adminPin);
    if (res.success) {
      setIsAuthenticated(true);
      setAdminPin('');
      setAuthError('');
      showNotification('success', lang === 'bn' ? 'সফলভাবে এডমিন প্যানেলে প্রবেশ করেছেন!' : 'Admin access granted!');
    } else {
      setAuthError(res.message || 'ভুল পাসওয়ার্ড!');
      setLockoutStatus(checkLockoutStatus());
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setAdminPin('');
    showNotification('success', lang === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out successfully');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordChangeMsg(null);
    const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
    setIsChangingPassword(false);
    if (res.success) {
      setPasswordChangeMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('success', lang === 'bn' ? 'এডমিন পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!' : 'Password updated!');
    } else {
      setPasswordChangeMsg({ type: 'error', text: res.message });
    }
  };

  const handleSaveSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSecretSlug(customSlug);
    setSlugSavedMsg(lang === 'bn' ? 'গোপন হ্যাশট্যাগ সংরক্ষিত হয়েছে!' : 'Secret access slug saved!');
    setTimeout(() => setSlugSavedMsg(''), 4000);
    showNotification('success', lang === 'bn' ? 'গোপন এক্সেস হ্যাশট্যাগ সংরক্ষিত হয়েছে!' : 'Secret slug saved!');
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', textCol: 'text-slate-400', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'দুর্বল (Weak)', color: 'bg-rose-500', textCol: 'text-rose-600', width: '33%' };
    if (score <= 3) return { label: 'মাঝারি (Medium)', color: 'bg-amber-500', textCol: 'text-amber-600', width: '66%' };
    return { label: 'শক্তিশালী ও নিরাপদ (Strong)', color: 'bg-emerald-500', textCol: 'text-emerald-600', width: '100%' };
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

  const handleSaveAds = async () => {
    setIsSavingAds(true);
    setAdSaveMsg('');
    try {
      await saveAdConfig(adConfig);
      setAdSaveMsg(lang === 'bn' ? 'বিজ্ঞাপন সেটিংস সফলভাবে সংরক্ষিত ও লাইভ আপডেট হয়েছে!' : 'Ad settings saved & updated successfully!');
      showNotification('success', lang === 'bn' ? 'বিজ্ঞাপন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Ad settings saved!');
      setTimeout(() => setAdSaveMsg(''), 4500);
    } catch (e: any) {
      showNotification('error', lang === 'bn' ? 'বিজ্ঞাপন সংরক্ষণে ব্যর্থ হয়েছে' : 'Failed to save ad settings');
    } finally {
      setIsSavingAds(false);
    }
  };

  const handleUploadAdImage = async (slotKey: 'leaderboard' | 'inArticle', file: File) => {
    setIsUploadingAdImage(true);
    try {
      const url = await compressAndProcessImage(file);
      if (url) {
        setAdConfig((prev) => ({
          ...prev,
          [slotKey]: {
            ...prev[slotKey],
            imageUrl: url,
          },
        }));
        showNotification('success', lang === 'bn' ? 'ব্যানার ছবি সফলভাবে আপলোড ও যুক্ত হয়েছে' : 'Banner image uploaded');
      }
    } catch (e) {
      showNotification('error', lang === 'bn' ? 'ছবি আপলোডে সমস্যা হয়েছে' : 'Image upload failed');
    } finally {
      setIsUploadingAdImage(false);
    }
  };

  const handleDownloadAdsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ads.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('success', lang === 'bn' ? 'ads.json ফাইল ডাউনলোড হয়েছে! গিটহাবে data/ads.json ফাইলে এটি সেভ করতে পারেন।' : 'ads.json downloaded successfully!');
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

  if (!isOpen) return null;

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
            /* Secure Authentication Screen */
            <div className="max-w-md mx-auto py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-extrabold text-slate-900 mb-2">
                {lang === 'bn' ? 'সুরক্ষিত এডমিন পোর্টাল' : 'Secure Admin Portal'}
              </h4>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'amarmetro.com সাইটের কন্টেন্ট প্রকাশ ও সম্পাদনার জন্য পাসওয়ার্ড প্রদান করুন।'
                  : 'Enter your admin password to access publishing and system management.'}
              </p>

              {lockoutStatus.isLocked ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>{lang === 'bn' ? 'লগইন সাময়িকভাবে স্থগিত!' : 'Login Temporarily Locked!'}</span>
                  </div>
                  <p className="text-xs text-rose-600 leading-relaxed">
                    {lang === 'bn'
                      ? `হ্যাকিং প্রতিরোধে ৫ বার ভুল পাসওয়ার্ড দেওয়ায় সিস্টেম লক করা হয়েছে। অনুগ্রহ করে ${lockoutStatus.remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`
                      : `Access locked after multiple failed attempts. Please wait ${lockoutStatus.remainingMinutes} minutes before retrying.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showLoginPin ? 'text' : 'password'}
                      placeholder={lang === 'bn' ? 'এডমিন পাসওয়ার্ড লিখুন' : 'Enter admin password'}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500 pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showLoginPin ? 'হাইড করুন' : 'পাসওয়ার্ড দেখুন'}
                    >
                      {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium text-left flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নিরাপদ লগইন করুন' : 'Secure Login'}</span>
                  </button>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 text-left flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'bn'
                        ? 'লগইন লিংক ও পোর্টাল সাধারণ ভিজিটরদের কাছে সম্পূর্ণ লুকানো। পাসওয়ার্ড পরিবর্তন করতে লগইন করার পর "নিরাপত্তা ও পাসওয়ার্ড" ট্যাবে যান।'
                        : 'Admin gateway is hidden from visitors. Update your password anytime in Security & Password tab.'}
                    </span>
                  </div>
                </form>
              )}
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

                {/* Cover Image & Upload Section for Editing Post */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'পোস্টের কাভার ছবি পরিবর্তন করুন' : 'Change Cover Image'}</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {lang === 'bn' ? 'JPG, PNG, WebP সমর্থিত' : 'JPG, PNG, WebP'}
                    </span>
                  </div>

                  {/* Current Image Preview & Quick Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                    <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                      <img
                        src={editingPost.coverImage}
                        alt="Current Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {lang === 'bn' ? 'বর্তমান ছবি' : 'Current'}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      {/* Direct File Upload Button */}
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98">
                        <Upload className="w-4 h-4" />
                        <span>
                          {isUploading
                            ? (lang === 'bn' ? 'ছবি আপলোড ও প্রসেসিং হচ্ছে...' : 'Uploading...')
                            : (lang === 'bn' ? '📁 কম্পিউটার বা মোবাইল থেকে নতুন ছবি দিন' : 'Upload from Device')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>

                      {/* Direct URL Input */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                          <span>{lang === 'bn' ? 'অথবা ছবির ডিরেক্ট ওয়েব লিংক (URL):' : 'Or direct image URL:'}</span>
                        </div>
                        <input
                          type="text"
                          placeholder={lang === 'bn' ? 'https://images.unsplash.com/... বা ছবির লিংক' : 'Image URL...'}
                          value={editingPost.coverImage}
                          onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Presets Option */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      {lang === 'bn' ? 'অথবা নিচে থেকে মেট্রোরেলের প্রস্তুত ছবি বেছে নিন (১-ক্লিক):' : 'Or pick from metro presets (1-click):'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {PRESET_IMAGE_OPTIONS.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, coverImage: img.url })}
                          className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            editingPost.coverImage === img.url
                              ? 'border-emerald-600 ring-2 ring-emerald-300'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-0.5 text-[8px] text-white font-medium truncate text-center">
                            {img.name}
                          </div>
                          {editingPost.coverImage === img.url && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
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
                    onClick={() => setAdminTab('ads')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      adminTab === 'ads'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বিজ্ঞাপন ও অ্যাডসেন্স' : 'Ads & AdSense'}</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('security')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                      adminTab === 'security'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড' : 'Security & Password'}</span>
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
                          <div className="relative group shrink-0">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-16 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setQuickChangeImagePost(post);
                                setQuickImageSelectedUrl(post.coverImage);
                              }}
                              className="absolute inset-0 bg-slate-900/60 text-white rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer shadow-xs"
                              title={lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Image'}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          </div>
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
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickChangeImagePost(post);
                              setQuickImageSelectedUrl(post.coverImage);
                            }}
                            className="px-2.5 py-1 text-xs rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                            title={lang === 'bn' ? 'এই পোস্টের ছবি পরিবর্তন করুন' : 'Change Post Image'}
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Image'}</span>
                          </button>

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

                  {/* Quick Change Image Dialog for Published Posts */}
                  {quickChangeImagePost && (
                    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
                      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">
                                {lang === 'bn' ? 'পোস্টের কাভার ছবি পরিবর্তন করুন' : 'Change Post Cover Image'}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {quickChangeImagePost.title}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuickChangeImagePost(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image Preview Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              {lang === 'bn' ? 'বর্তমান ছবি:' : 'Current Image:'}
                            </span>
                            <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                              <img
                                src={quickChangeImagePost.coverImage}
                                alt="Current"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 block mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'নতুন নির্বাচিত ছবি (প্রিভিউ):' : 'New Selected Image:'}</span>
                            </span>
                            <div className="h-28 rounded-lg overflow-hidden border-2 border-emerald-500 bg-white shadow-xs">
                              <img
                                src={quickImageSelectedUrl || quickChangeImagePost.coverImage}
                                alt="New Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Option 1: Upload from Device */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98">
                            <Upload className="w-4 h-4" />
                            <span>
                              {isUploading
                                ? (lang === 'bn' ? 'ছবি আপলোড ও প্রসেসিং হচ্ছে...' : 'Processing...')
                                : (lang === 'bn' ? '📁 কম্পিউটার বা মোবাইল থেকে নতুন ছবি দিন' : 'Upload from Device')}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQuickImageFileUpload}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-emerald-800 text-center font-medium">
                            {lang === 'bn'
                              ? 'JPG, PNG, WebP সমর্থিত। ছবি স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে যাবে।'
                              : 'Supports JPG, PNG, WebP. Automatically optimized.'}
                          </p>
                        </div>

                        {/* Option 2: Choose from Metro Presets */}
                        <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1.5">
                            {lang === 'bn' ? 'অথবা ১-ক্লিকে মেট্রোরেলের প্রস্তুত ছবি বেছে নিন:' : 'Or pick from metro presets (1-click):'}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {PRESET_IMAGE_OPTIONS.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setQuickImageSelectedUrl(img.url)}
                                className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                  quickImageSelectedUrl === img.url
                                    ? 'border-emerald-600 ring-2 ring-emerald-300'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-0.5 text-[8px] text-white font-medium truncate text-center">
                                  {img.name}
                                </div>
                                {quickImageSelectedUrl === img.url && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Option 3: Custom URL input */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            {lang === 'bn' ? 'অথবা ছবির ডিরেক্ট ওয়েব URL লিখুন:' : 'Or enter direct image URL:'}
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={quickImageSelectedUrl}
                            onChange={(e) => setQuickImageSelectedUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setQuickChangeImagePost(null)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveQuickImage}
                            disabled={isSavingQuickImage || !quickImageSelectedUrl.trim()}
                            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-98 disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>
                              {isSavingQuickImage
                                ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                                : (lang === 'bn' ? 'নতুন ছবি সংরক্ষণ করুন' : 'Save New Image')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Ads & Google AdSense Management */}
              {adminTab === 'ads' && (
                <div className="space-y-6">
                  {/* Ads Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-white">
                              {lang === 'bn' ? 'বিজ্ঞাপন ও গুগল অ্যাডসেন্স ব্যবস্থাপনা' : 'Ads & Google AdSense Manager'}
                            </h4>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                              {adConfig.googleAdSense.publisherId ? 'AdSense Configured' : 'Custom / Ready'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {lang === 'bn'
                              ? 'হোমপেজ ও প্রতিটি আর্টিকেল পেজে গুগল অ্যাডসেন্স বা যেকোনো ক্লায়েন্টের কাস্টম ব্যানার বিজ্ঞাপন যুক্ত করুন।'
                              : 'Manage Google AdSense units or display custom sponsored advertiser banners.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadAdsJson}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                          title="গিটহাবে data/ads.json ফাইল প্রতিস্থাপন করতে ডাউনলোড করুন"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lang === 'bn' ? '📥 ads.json ডাউনলোড' : 'Download ads.json'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveAds}
                          disabled={isSavingAds}
                          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingAds ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Status Notification */}
                  {adSaveMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-semibold animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{adSaveMsg}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-normal">সাইটে অবিলম্বে পরিবর্তন দৃশ্যমান</span>
                    </div>
                  )}

                  {/* Ads Sub-Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <button
                      type="button"
                      onClick={() => setAdSubTab('adsense')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adSubTab === 'adsense'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'bn' ? '১. গুগল অ্যাডসেন্স সেটিংস' : '1. Google AdSense'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdSubTab('leaderboard')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adSubTab === 'leaderboard'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'bn' ? '২. হোমপেজ লিডারবোর্ড ব্যানার' : '2. Leaderboard Banner'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdSubTab('inArticle')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adSubTab === 'inArticle'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? '৩. আর্টিকেল ভিতরের ব্যানার' : '3. In-Article Ad'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdSubTab('guide')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adSubTab === 'guide'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'bn' ? '৪. অ্যাডসেন্স ও কাস্টম এড নির্দেশিকা' : '4. How-To Guide'}</span>
                    </button>
                  </div>

                  {/* Sub-Tab 1: Google AdSense Global Settings */}
                  {adSubTab === 'adsense' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {lang === 'bn' ? 'গুগল অ্যাডসেন্স মূল অ্যাকাউন্ট তথ্য (AdSense Account Setup)' : 'Google AdSense Account Credentials'}
                            </h5>
                            <p className="text-xs text-slate-500">
                              গুগল অ্যাডসেন্স অ্যাকাউন্ট থেকে প্রাপ্ত আপনার পাবলিশার আইডি (Publisher ID) নিচে প্রবেশ করান।
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              {lang === 'bn' ? 'পাবলিশার আইডি (Publisher ID) *' : 'Publisher ID (ca-pub-...) *'}
                            </label>
                            <input
                              type="text"
                              value={adConfig.googleAdSense.publisherId}
                              onChange={(e) =>
                                setAdConfig({
                                  ...adConfig,
                                  googleAdSense: {
                                    ...adConfig.googleAdSense,
                                    publisherId: e.target.value.trim(),
                                  },
                                })
                              }
                              placeholder="ca-pub-1234567890123456"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              উদাহরণ: <code className="text-slate-600">ca-pub-9876543210987654</code> (গুগল অ্যাডসেন্স ড্যাশবোর্ড থেকে কপি করুন)
                            </p>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              {lang === 'bn' ? 'অটো বিজ্ঞাপন (Auto Ads)' : 'Auto Ads'}
                            </label>
                            <div className="flex items-center gap-3 pt-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={adConfig.googleAdSense.autoAdsEnabled}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      googleAdSense: {
                                        ...adConfig.googleAdSense,
                                        autoAdsEnabled: e.target.checked,
                                      },
                                    })
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                              <span className="text-xs text-slate-600 font-medium">
                                {adConfig.googleAdSense.autoAdsEnabled
                                  ? (lang === 'bn' ? 'সক্রিয় (Auto Ads On)' : 'Enabled')
                                  : (lang === 'bn' ? 'নিষ্ক্রিয় (Manual Slots Only)' : 'Disabled')}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              গুগল অটো এডস অন করলে গুগল নিজে থেকেই উপযুক্ত জায়গায় বিজ্ঞাপন দেখাবে।
                            </p>
                          </div>
                        </div>

                        {/* AdSense HTML Head Script Helper */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{lang === 'bn' ? 'অ্যাডসেন্স স্ক্রিপ্ট ট্যাগ (index.html)' : 'AdSense Script Tag'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const script = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.googleAdSense.publisherId || 'ca-pub-XXXXXXXXXXXXXXXX'}" crossorigin="anonymous"></script>`;
                                navigator.clipboard.writeText(script);
                                showNotification('success', lang === 'bn' ? 'স্ক্রিপ্ট কপি হয়েছে!' : 'Script copied!');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-2xs cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'কোড কপি করুন' : 'Copy Code'}</span>
                            </button>
                          </div>
                          <div className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto select-all">
                            {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.googleAdSense.publisherId || 'ca-pub-XXXXXXXXXXXXXXXX'}" crossorigin="anonymous"></script>`}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            💡 <strong>সুবিধা:</strong> আপনি উপরে Publisher ID লিখে "পরিবর্তন সংরক্ষণ করুন" চাপলে এই স্ক্রিপ্টটি সাইটে স্বয়ংক্রিয়ভাবে চালু হয়ে যাবে! আলাদাভাবে কোড এডিট করতে হবে না।
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 2: Leaderboard Slot */}
                  {adSubTab === 'leaderboard' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {lang === 'bn' ? 'হোমপেজ প্রধান ব্যানার (Leaderboard Slot - 728x90 / Responsive)' : 'Homepage Leaderboard Slot'}
                            </h5>
                            <p className="text-xs text-slate-500">
                              হোমপেজের হিরো সেকশনের ঠিক নিচে এই বিজ্ঞাপনটি প্রদর্শিত হয়।
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-bold text-slate-600">
                              {adConfig.leaderboard.enabled ? (lang === 'bn' ? 'চালু' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Off')}
                            </span>
                            <input
                              type="checkbox"
                              checked={adConfig.leaderboard.enabled}
                              onChange={(e) =>
                                setAdConfig({
                                  ...adConfig,
                                  leaderboard: { ...adConfig.leaderboard, enabled: e.target.checked },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                          </label>
                        </div>

                        {/* Format Switcher */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">
                            {lang === 'bn' ? 'বিজ্ঞাপনের ধরন নির্বাচন করুন:' : 'Choose Ad Type:'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  leaderboard: { ...adConfig.leaderboard, type: 'google-adsense' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.leaderboard.type === 'google-adsense'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                                <span>গুগল অ্যাডসেন্স (AdSense)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">গুগল থেকে স্বয়ংক্রিয় বিজ্ঞাপন</p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  leaderboard: { ...adConfig.leaderboard, type: 'custom' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.leaderboard.type === 'custom'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <Megaphone className="w-3.5 h-3.5 text-blue-700" />
                                <span>কাস্টম স্পনসর ব্যানার</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">ক্লায়েন্টের ব্যানার ছবি ও নিজস্ব লিংক</p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  leaderboard: { ...adConfig.leaderboard, type: 'default' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.leaderboard.type === 'default'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>ডিফল্ট মেট্রো ব্যানার</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">আমারমেট্রো প্রস্তুতকৃত প্রমোশন</p>
                            </button>
                          </div>
                        </div>

                        {/* When Google AdSense is Selected */}
                        {adConfig.leaderboard.type === 'google-adsense' && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                            <h6 className="text-xs font-bold text-slate-800">
                              {lang === 'bn' ? 'লিডারবোর্ড স্লট আইডি (Leaderboard Ad Slot ID):' : 'Ad Slot ID:'}
                            </h6>
                            <input
                              type="text"
                              value={adConfig.leaderboard.adSlot || ''}
                              onChange={(e) =>
                                setAdConfig({
                                  ...adConfig,
                                  leaderboard: { ...adConfig.leaderboard, adSlot: e.target.value.trim() },
                                })
                              }
                              placeholder="1234567890"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              গুগল অ্যাডসেন্স ড্যাশবোর্ডে <strong>Ads ➔ By ad unit ➔ Display ads</strong> তৈরি করে প্রাপ্ত ১০ ডিজিটের <strong>data-ad-slot</strong> নম্বরটি এখানে দিন।
                            </p>
                          </div>
                        )}

                        {/* When Custom Sponsor is Selected */}
                        {adConfig.leaderboard.type === 'custom' && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                            <h6 className="text-xs font-bold text-slate-800">
                              {lang === 'bn' ? 'কাস্টম বিজ্ঞাপন বিবরণ ও কনফিগারেশন:' : 'Custom Ad Details:'}
                            </h6>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'বিজ্ঞাপনের শিরোনাম (Headline) *' : 'Ad Title *'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.leaderboard.title || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      leaderboard: { ...adConfig.leaderboard, title: e.target.value },
                                    })
                                  }
                                  placeholder="বিকাশ বা নগদ ট্রানজিট অফার"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'ব্যাজ বা ক্যাটাগরি (Badge)' : 'Badge Label'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.leaderboard.badge || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      leaderboard: { ...adConfig.leaderboard, badge: e.target.value },
                                    })
                                  }
                                  placeholder="স্পনসরড ট্রানজিট সার্ভিস"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                {lang === 'bn' ? 'বিজ্ঞাপনের বর্ণনা (Description)' : 'Ad Description'}
                              </label>
                              <input
                                type="text"
                                value={adConfig.leaderboard.description || ''}
                                onChange={(e) =>
                                  setAdConfig({
                                    ...adConfig,
                                    leaderboard: { ...adConfig.leaderboard, description: e.target.value },
                                  })
                                }
                                placeholder="মেট্রোরেল যাত্রীদের জন্য দ্রুততম মোবাইল রিচার্জ ও ক্যাশব্যাক সুবিধা।"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'ক্লিক লিংক / টার্গেট URL (Website Link) *' : 'Target URL *'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.leaderboard.targetUrl || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      leaderboard: { ...adConfig.leaderboard, targetUrl: e.target.value },
                                    })
                                  }
                                  placeholder="https://sponsor-website.com"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'বাটন লেখা (CTA Button Text)' : 'Button Text'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.leaderboard.ctaText || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      leaderboard: { ...adConfig.leaderboard, ctaText: e.target.value },
                                    })
                                  }
                                  placeholder="বিস্তারিত জানুন"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            {/* Banner Image for Leaderboard */}
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <label className="text-xs font-bold text-slate-700 block">
                                {lang === 'bn' ? 'ব্যানার ছবি (Banner Image):' : 'Banner Image:'}
                              </label>

                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                {adConfig.leaderboard.imageUrl ? (
                                  <img
                                    src={adConfig.leaderboard.imageUrl}
                                    alt="Preview"
                                    className="w-32 h-16 object-cover rounded-xl border border-slate-300 shadow-2xs shrink-0"
                                  />
                                ) : (
                                  <div className="w-32 h-16 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0">
                                    নো ছবি
                                  </div>
                                )}

                                <div className="flex-1 w-full space-y-2">
                                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isUploadingAdImage ? 'আপলোড হচ্ছে...' : 'কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isUploadingAdImage}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadAdImage('leaderboard', file);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    value={adConfig.leaderboard.imageUrl || ''}
                                    onChange={(e) =>
                                      setAdConfig({
                                        ...adConfig,
                                        leaderboard: { ...adConfig.leaderboard, imageUrl: e.target.value },
                                      })
                                    }
                                    placeholder="অথবা সরাসরি ছবির ওয়েব লিঙ্ক দিন (https://...)"
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 3: In-Article Slot */}
                  {adSubTab === 'inArticle' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">
                              {lang === 'bn' ? 'আর্টিকেল ভিতরের ব্যানার (In-Article Ad Slot)' : 'In-Article Ad Slot'}
                            </h5>
                            <p className="text-xs text-slate-500">
                              পাঠকরা ব্লগ বা আর্টিকেল পড়ার মাঝখানে এই বিজ্ঞাপনটি দেখতে পাবেন।
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-bold text-slate-600">
                              {adConfig.inArticle.enabled ? (lang === 'bn' ? 'চালু' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Off')}
                            </span>
                            <input
                              type="checkbox"
                              checked={adConfig.inArticle.enabled}
                              onChange={(e) =>
                                setAdConfig({
                                  ...adConfig,
                                  inArticle: { ...adConfig.inArticle, enabled: e.target.checked },
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                          </label>
                        </div>

                        {/* Format Switcher */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">
                            {lang === 'bn' ? 'বিজ্ঞাপনের ধরন নির্বাচন করুন:' : 'Choose Ad Type:'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  inArticle: { ...adConfig.inArticle, type: 'google-adsense' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.inArticle.type === 'google-adsense'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                                <span>গুগল অ্যাডসেন্স (AdSense)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">আর্টিকেল অ্যাড ইউনিট</p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  inArticle: { ...adConfig.inArticle, type: 'custom' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.inArticle.type === 'custom'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <Megaphone className="w-3.5 h-3.5 text-blue-700" />
                                <span>কাস্টম স্পনসর ব্যানার</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">ক্লায়েন্টের ব্যানার ছবি ও লিংক</p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setAdConfig({
                                  ...adConfig,
                                  inArticle: { ...adConfig.inArticle, type: 'default' },
                                })
                              }
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                adConfig.inArticle.type === 'default'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>ডিফল্ট মেট্রো ব্যানার</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">স্মার্ট পাস ও রিচার্জ প্রমোশন</p>
                            </button>
                          </div>
                        </div>

                        {/* When Google AdSense is Selected */}
                        {adConfig.inArticle.type === 'google-adsense' && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                            <h6 className="text-xs font-bold text-slate-800">
                              {lang === 'bn' ? 'আর্টিকেল স্লট আইডি (In-Article Ad Slot ID):' : 'In-Article Ad Slot ID:'}
                            </h6>
                            <input
                              type="text"
                              value={adConfig.inArticle.adSlot || ''}
                              onChange={(e) =>
                                setAdConfig({
                                  ...adConfig,
                                  inArticle: { ...adConfig.inArticle, adSlot: e.target.value.trim() },
                                })
                              }
                              placeholder="0987654321"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              অ্যাডসেন্স থেকে <strong>In-article ad</strong> ইউনিট তৈরি করে তার Slot ID এখানে দিন।
                            </p>
                          </div>
                        )}

                        {/* When Custom Sponsor is Selected */}
                        {adConfig.inArticle.type === 'custom' && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                            <h6 className="text-xs font-bold text-slate-800">
                              {lang === 'bn' ? 'আর্টিকেল বিজ্ঞাপনের তথ্য:' : 'In-Article Ad Details:'}
                            </h6>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'বিজ্ঞাপনের শিরোনাম (Headline) *' : 'Ad Title *'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.inArticle.title || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      inArticle: { ...adConfig.inArticle, title: e.target.value },
                                    })
                                  }
                                  placeholder="স্মার্ট পাস রিচার্জ বা ট্রাভেল প্যাকেজ"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'ব্যাজ লেখা (Badge)' : 'Badge Label'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.inArticle.badge || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      inArticle: { ...adConfig.inArticle, badge: e.target.value },
                                    })
                                  }
                                  placeholder="স্পনসরড পার্টনার"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                {lang === 'bn' ? 'বিজ্ঞাপনের বর্ণনা (Description)' : 'Ad Description'}
                              </label>
                              <input
                                type="text"
                                value={adConfig.inArticle.description || ''}
                                onChange={(e) =>
                                  setAdConfig({
                                    ...adConfig,
                                    inArticle: { ...adConfig.inArticle, description: e.target.value },
                                  })
                                }
                                placeholder="দীর্ঘ লাইনে না দাঁড়িয়ে মুহূর্তেই ডিজিটাল পাস রিচার্জ করুন।"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'টার্গেট লিংক (URL) *' : 'Target URL *'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.inArticle.targetUrl || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      inArticle: { ...adConfig.inArticle, targetUrl: e.target.value },
                                    })
                                  }
                                  placeholder="https://sponsor.com/offer"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {lang === 'bn' ? 'বাটন লেখা (CTA)' : 'Button Text'}
                                </label>
                                <input
                                  type="text"
                                  value={adConfig.inArticle.ctaText || ''}
                                  onChange={(e) =>
                                    setAdConfig({
                                      ...adConfig,
                                      inArticle: { ...adConfig.inArticle, ctaText: e.target.value },
                                    })
                                  }
                                  placeholder="অফারটি দেখতে ক্লিক করুন"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            {/* Banner Image */}
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <label className="text-xs font-bold text-slate-700 block">
                                {lang === 'bn' ? 'ব্যানার ছবি (Banner Image):' : 'Banner Image:'}
                              </label>

                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                {adConfig.inArticle.imageUrl ? (
                                  <img
                                    src={adConfig.inArticle.imageUrl}
                                    alt="Preview"
                                    className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow-2xs shrink-0"
                                  />
                                ) : (
                                  <div className="w-32 h-20 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 text-xs shrink-0">
                                    নো ছবি
                                  </div>
                                )}

                                <div className="flex-1 w-full space-y-2">
                                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isUploadingAdImage ? 'আপলোড হচ্ছে...' : 'কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isUploadingAdImage}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadAdImage('inArticle', file);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    value={adConfig.inArticle.imageUrl || ''}
                                    onChange={(e) =>
                                      setAdConfig({
                                        ...adConfig,
                                        inArticle: { ...adConfig.inArticle, imageUrl: e.target.value },
                                      })
                                    }
                                    placeholder="অথবা সরাসরি ছবির ওয়েব লিঙ্ক দিন (https://...)"
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 4: How-To Guide & Tutorial */}
                  {adSubTab === 'guide' && (
                    <div className="space-y-6">
                      {/* Guide 1: Google AdSense Approval & Setup */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <h5 className="font-bold text-slate-900 text-sm">
                            {lang === 'bn' ? 'গুগল অ্যাডসেন্স (Google AdSense) যুক্ত করার সম্পূর্ণ নিয়ম' : 'Complete Google AdSense Setup Guide'}
                          </h5>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                          <p>
                            <strong>ধাপ ১: Google AdSense এ অ্যাকাউন্ট তৈরি ও সাইট সাবমিট</strong><br />
                            <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">adsense.google.com</a> এ প্রবেশ করে আপনার ডোমেইন <strong>amarmetro.com</strong> যোগ করুন (Sites ➔ Add site)।
                          </p>

                          <p>
                            <strong>ধাপ ২: Publisher ID সংগ্রহ করুন</strong><br />
                            AdSense এর Account ➔ Settings ➔ Account information এ গেলে আপনার <strong>Publisher ID</strong> পাবেন (যেমন: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">ca-pub-1234567890123456</code>)। এটি কপি করে আমাদের অ্যাডমিন প্যানেলের <strong>"গুগল অ্যাডসেন্স সেটিংস"</strong> বক্সে বসিয়ে সেভ করুন।
                          </p>

                          <p>
                            <strong>ধাপ ৩: অ্যাড স্লট আইডি তৈরি করুন</strong><br />
                            অ্যাডসেন্স ড্যাশবোর্ডে <strong>Ads ➔ By ad unit</strong> এ গিয়ে Display Ad তৈরি করুন। কোড থেকে <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">data-ad-slot="XXXXXXXXXX"</code> এর সংখ্যাটি কপি করে লিডারবোর্ড বা আর্টিকেল স্লটে বসিয়ে দিন।
                          </p>

                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                            ℹ️ <strong>মনে রাখবেন:</strong> গুগল অ্যাডসেন্স অনুমোদন (Approval) পেতে সাইটে ১০-১৫টি মৌলিক পোস্ট থাকা জরুরি। amarmetro ব্লগে নিয়মিত মেট্রো রুট, টিকিট, সময়সূচী ও পর্যটন সংক্রান্ত পোস্ট প্রকাশ করতে থাকুন।
                          </div>
                        </div>
                      </div>

                      {/* Guide 2: Custom Sponsor Ads without AdSense */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                          <Megaphone className="w-5 h-5 text-blue-600" />
                          <h5 className="font-bold text-slate-900 text-sm">
                            {lang === 'bn' ? 'কাস্টম বিজ্ঞাপন বা স্পনসর ব্যানার যুক্ত করার নিয়ম (অ্যাডসেন্স ছাড়াও আয়)' : 'Custom Sponsor Banners Guide'}
                          </h5>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                          <p>
                            আপনার যদি এখনো গুগল অ্যাডসেন্স অনুমোদন না থাকে, তবুও আপনি সাইট থেকে সরাসরি আয় করতে পারেন! স্থানীয় প্রতিষ্ঠান (যেমন: বিকাশ রিচার্জ এজেন্ট, ট্রাভেল এজেন্সি, মেট্রোরেল সংলগ্ন হোটেল, রেস্তোরাঁ, কোচিং সেন্টার ইত্যাদি) এর কাছ থেকে বিজ্ঞাপন নিয়ে প্রদর্শিত করতে পারেন:
                          </p>

                          <ol className="list-decimal ml-5 space-y-1.5 text-slate-600">
                            <li>উপরে <strong>"হোমপেজ লিডারবোর্ড ব্যানার"</strong> অথবা <strong>"আর্টিকেল ভিতরের ব্যানার"</strong> ট্যাবে যান।</li>
                            <li>বিজ্ঞাপনের ধরন হিসেবে <strong>"কাস্টম স্পনসর ব্যানার"</strong> নির্বাচন করুন।</li>
                            <li>স্পনসর বা ক্লায়েন্টের প্রতিষ্ঠানের নাম, বিজ্ঞাপনের কথা এবং তাদের ওয়েবসাইটের লিংক দিন।</li>
                            <li><strong>"কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন"</strong> বাটনে ক্লিক করে স্পনসরের ব্যানার বা লোগো নির্বাচন করুন।</li>
                            <li>উপরে ডানদিকের <strong>"পরিবর্তন সংরক্ষণ করুন"</strong> বাটনে চাপলেই সাইটে তাদের বিজ্ঞাপন চালু হয়ে যাবে!</li>
                          </ol>
                        </div>
                      </div>

                      {/* Guide 3: Code Reference */}
                      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xs space-y-3 border border-slate-800">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                          <Server className="w-5 h-5 text-emerald-400" />
                          <h5 className="font-bold text-white text-sm">
                            {lang === 'bn' ? 'কোডে সরাসরি পরিবর্তন করতে চাইলে কোথায় পাবেন?' : 'Source Code Files Reference'}
                          </h5>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                          <p>• <strong>ব্যানার কম্পোনেন্ট:</strong> <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">src/components/AdBanner.tsx</code></p>
                          <p>• <strong>ডাটাবেজ/কনফিগ ফাইল:</strong> <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">data/ads.json</code></p>
                          <p>• <strong>হোমপেজে বিজ্ঞাপন স্থান:</strong> <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">src/App.tsx</code> (Hero সেকশনের ঠিক নিচে)</p>
                          <p>• <strong>আর্টিকেলের ভেতরে বিজ্ঞাপন স্থান:</strong> <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono">src/components/ArticleModal.tsx</code></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Security & Password Management */}
              {adminTab === 'security' && (
                <div className="space-y-6">
                  {/* Security Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{lang === 'bn' ? 'অ্যাডমিন নিরাপত্তা ও পাসওয়ার্ড ব্যবস্থাপনা' : 'Security & Password Management'}</span>
                          <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                            SHA-256 Protected
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300">
                          {lang === 'bn'
                            ? 'অননুমোদিত প্রবেশ ও হ্যাকিং প্রতিরোধে পাসওয়ার্ড পরিবর্তন, ব্রুট-ফোর্স প্রটেকশন স্ট্যাটাস এবং গোপন প্রবেশদ্বার কনফিগারেশন।'
                            : 'Harden access, change admin password, and manage secret access endpoints.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card 1: Password Change Form */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <KeyRound className="w-5 h-5 text-emerald-600" />
                        <h5 className="font-bold text-slate-900 text-sm">
                          {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন' : 'Change Admin Password'}
                        </h5>
                      </div>

                      {passwordChangeMsg && (
                        <div
                          className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                            passwordChangeMsg.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {passwordChangeMsg.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p>{passwordChangeMsg.text}</p>
                            {passwordChangeMsg.type === 'success' && (
                              <p className="text-[11px] text-emerald-700 font-semibold">
                                ℹ️ নতুন পাসওয়ার্ডটি মনে রাখুন অথবা নিরাপদ স্থানে লিখে রাখুন।
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড (Current Password) *' : 'Current Password *'}
                          </label>
                          <input
                            type={showChangePasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder={lang === 'bn' ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Enter current password'}
                            required
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {lang === 'bn' ? 'নতুন পাসওয়ার্ড (New Password) *' : 'New Password *'}
                          </label>
                          <input
                            type={showChangePasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={lang === 'bn' ? 'কমপক্ষে ৬-৮ অক্ষরের শক্তিশালী পাসওয়ার্ড' : 'Enter new strong password'}
                            required
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                          {/* Strength Bar */}
                          {newPassword && (
                            <div className="mt-2 space-y-1">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                                  style={{ width: getPasswordStrength(newPassword).width }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">নিরাপত্তা মান:</span>
                                <span className={`font-semibold ${getPasswordStrength(newPassword).textCol}`}>
                                  {getPasswordStrength(newPassword).label}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {lang === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় নিশ্চিত করুন *' : 'Confirm New Password *'}
                          </label>
                          <input
                            type={showChangePasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={lang === 'bn' ? 'পুনরায় নতুন পাসওয়ার্ডটি লিখুন' : 'Re-type new password'}
                            required
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={showChangePasswords}
                              onChange={(e) => setShowChangePasswords(e.target.checked)}
                              className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{lang === 'bn' ? 'পাসওয়ার্ডগুলো দৃশ্যমান করুন' : 'Show passwords'}</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Save className="w-4 h-4" />
                          <span>
                            {isChangingPassword
                              ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                              : (lang === 'bn' ? 'নতুন পাসওয়ার্ড সংরক্ষণ করুন' : 'Save New Password')}
                          </span>
                        </button>
                      </form>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                        ⚠️ <strong>সতর্কতা:</strong> পাসওয়ার্ড সফলভাবে পরিবর্তনের সাথে সাথে পূর্বের ডেমো পাসওয়ার্ড চিরতরে বাতিল হয়ে যাবে। আপনি ছাড়া অন্য কোনো ব্যক্তি এটি অনুমান করতে পারবে না।
                      </div>
                    </div>

                    {/* Card 2: Secret Entry & Anti-Hacking Protection */}
                    <div className="space-y-6">
                      {/* Hidden Login Gates */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                          <EyeOff className="w-5 h-5 text-indigo-600" />
                          <h5 className="font-bold text-slate-900 text-sm">
                            {lang === 'bn' ? 'লগইন লিঙ্ক হাইডিং ও গোপন প্রবেশদ্বার' : 'Hidden Login Gates & Access'}
                          </h5>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          সাধারণ ভিজিটরদের কাছে সাইটের কোথাও কোনো <strong>"এডমিন লগইন"</strong> লিঙ্ক দেখানো হয় না। হ্যাকাররা জানতেই পারবে না লগইন পেজটি কোথায় অবস্থিত। আপনি সাইটে প্রবেশ করার ৩টি গোপন মাধ্যম রয়েছে:
                        </p>

                        <div className="space-y-2.5 text-xs">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">১</span>
                              <span>কীবোর্ড শর্টকাট (সবচেয়ে নিরাপদ ও অদৃশ্য)</span>
                            </div>
                            <p className="text-slate-600 text-[11px] pl-6.5">
                              সাইটের যেকোনো পাতায় থাকা অবস্থায় কীবোর্ডে <kbd className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-300 font-mono font-bold text-slate-800">Ctrl + Shift + A</kbd> (ম্যাকে: <kbd className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-300 font-mono font-bold text-slate-800">Cmd + Shift + A</kbd>) চাপুন। সাথে সাথে অ্যাডমিন উইন্ডো ওপেন হবে।
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">২</span>
                              <span>ব্রাউজার অ্যাড্রেস বার হ্যাশ</span>
                            </div>
                            <p className="text-slate-600 text-[11px] pl-6.5">
                              ব্রাউজারের অ্যাড্রেস বারে <code className="bg-emerald-50 text-emerald-800 font-mono px-1 py-0.5 rounded">https://amarmetro.com/#login</code> বা <code className="bg-emerald-50 text-emerald-800 font-mono px-1 py-0.5 rounded">#backend</code> লিখে এন্টার দিলেও অ্যাডমিন উইন্ডো ওপেন হবে।
                            </p>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">৩</span>
                              <span>মোবাইল সিক্রেট ট্যাপ (কীবোর্ড ছাড়া)</span>
                            </div>
                            <p className="text-slate-600 text-[11px] pl-6.5">
                              মোবাইল ফোন থেকে সাইট ভিজিট করলে একদম নিচে ফুটারের কপিরাইট লেখার (© {new Date().getFullYear()} amarmetro.com) ওপর পরপর ৪ বার দ্রুত ট্যাপ করুন। এটি গোপন ইস্টার-এগ হিসেবে কাজ করে!
                            </p>
                          </div>
                        </div>

                        {/* Custom Secret Slug Form */}
                        <form onSubmit={handleSaveSlugSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            {lang === 'bn' ? 'কাস্টম গোপন এক্সেস হ্যাশট্যাগ (Optional Custom Secret Key):' : 'Custom Secret Access Slug:'}
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">#</span>
                              <input
                                type="text"
                                value={customSlug}
                                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                placeholder="metro-admin"
                                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                            >
                              {lang === 'bn' ? 'সেভ করুন' : 'Save'}
                            </button>
                          </div>
                          {slugSavedMsg && (
                            <p className="text-[11px] text-emerald-700 font-semibold">{slugSavedMsg}</p>
                          )}
                          <p className="text-[10px] text-slate-400">
                            সেভ করার পর আপনি ব্রাউজারে <code className="text-slate-700 font-mono">amarmetro.com/#{customSlug}</code> লিখলেও অ্যাডমিন প্যানেল খুলবে।
                          </p>
                        </form>
                      </div>

                      {/* Anti-Hacking Feature Checklist */}
                      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3 border border-slate-800">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>হ্যাকিং প্রতিরোধ নিরাপত্তা ফ্রেমওয়ার্ক</span>
                        </h6>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>ব্রুট-ফোর্স লকআউট:</strong> পরপর ৫ বার ভুল পাসওয়ার্ড দিলে অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে ১৫ মিনিটের জন্য লক হয়ে যায়। কোনো রোবট বা বট পাসওয়ার্ড অনুমান করতে পারবে না।</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>ক্রিপ্টোগ্রাফিক সল্ট ও হ্যাশ:</strong> পাসওয়ার্ড সরাসরি প্লেইন টেক্সট হিসেবে থাকে না, ব্রাউজারের Web Crypto SHA-256 দিয়ে এনক্রিপ্ট হয়ে সুরক্ষিত থাকে।</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>৪-ঘণ্টা সেশন টাইমআউট:</strong> লগইন অবস্থায় ডিভাইস রেখে উঠে গেলেও ৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে সেশন লক হয়ে যাবে।</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>জিরো ফুটার ফুটপ্রিন্ট:</strong> সাধারণ ভিজিটরদের সামনে সাইটে কোনো এডমিন লগইন লিঙ্ক দেখানো হয় না।</span>
                          </li>
                        </ul>
                      </div>
                    </div>
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
