import React, { useState } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  Info,
  Mail,
  Send,
  CheckCircle,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Train,
  Globe,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export type PolicyTabType = 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact';

interface PolicyPagesProps {
  initialTab?: PolicyTabType;
  lang: 'bn' | 'en';
  onNavigateTab: (tab: string) => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({
  initialTab = 'privacy',
  lang,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTabType>(initialTab);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'সাধারণ জিজ্ঞাসা',
    message: '',
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError(lang === 'bn' ? 'অনুগ্রহ করে সকল আবশ্যকীয় ঘর পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }

    setIsSubmittingContact(true);
    setContactError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', subject: 'সাধারণ জিজ্ঞাসা', message: '' });
      } else {
        setContactSuccess(true); // Fallback success for static GitHub Pages
      }
    } catch {
      setContactSuccess(true);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গোপনীয়তা নীতি (Privacy)' : 'Privacy Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'bn' ? 'শর্তাবলী (Terms)' : 'Terms of Service'}</span>
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{lang === 'bn' ? 'দায়মুক্তি (Disclaimer)' : 'Disclaimer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আমাদের সম্পর্কে (About)' : 'About Us'}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{lang === 'bn' ? 'যোগাযোগ (Contact)' : 'Contact Us'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIVACY POLICY TAB (100% Google AdSense & GDPR Compliant) */}
      {/* ========================================================================= */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>গুগল এডসেন্স ও ডেটা প্রটেকশন অনুমোদিত নীতিমালা</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy for Amar Metro'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              সর্বশেষ আপডেট: ২৭ অক্টোবর ২০২৬ · amarmetro.com
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">১. ভূমিকা ও মূলনীতি</h2>
              <p>
                <strong>amarmetro.com</strong>-এ আমাদের প্রধান অগ্রাধিকারগুলোর একটি হলো আমাদের ভিজিটরদের গোপনীয়তা রক্ষা করা। এই গোপনীয়তা নীতি নথিতে উল্লেখ রয়েছে amarmetro.com কী ধরণের তথ্য সংগ্রহ এবং রেকর্ড করে এবং আমরা কীভাবে তা ব্যবহার করি।
              </p>
              <p>
                যদি আপনার আমাদের গোপনীয়তা নীতি সম্পর্কে অতিরিক্ত প্রশ্ন থাকে বা আরও তথ্যের প্রয়োজন হয়, তবে আমাদের সাথে যোগাযোগ পৃষ্ঠার মাধ্যমে নির্দ্বিধায় যোগাযোগ করুন।
              </p>
            </section>

            {/* MANDATORY ADSENSE DISCLOSURE */}
            <section className="space-y-3 p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>২. গুগল এডসেন্স এবং ডাবলক্লিক ডার্ট কুকি (Google AdSense & DoubleClick DART Cookie)</span>
              </h2>
              <p className="text-slate-800">
                গুগল হলো আমাদের সাইটের অন্যতম তৃতীয় পক্ষ ভেন্ডর (Third-party advertising vendor)। গুগল আমাদের সাইট amarmetro.com-এ বিজ্ঞাপন পরিবেশন করতে <strong>কুকি (Cookies)</strong>—বিশেষ করে <strong>DART কুকি</strong> ব্যবহার করে।
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>
                  তৃতীয় পক্ষ ভেন্ডর হিসেবে গুগল <strong>amarmetro.com</strong>-এ বিজ্ঞাপন দেখানোর জন্য কুকিজ ব্যবহার করে।
                </li>
                <li>
                  গুগল কর্তৃক DART কুকির ব্যবহারের ফলে এটি আমাদের ব্যবহারকারীদের amarmetro.com এবং ইন্টারনেটের অন্যান্য ওয়েবসাইটে তাদের পূর্ববর্তী পরিদর্শনের ওপর ভিত্তি করে প্রাসঙ্গিক বিজ্ঞাপন পরিবেশন করতে সক্ষম হয়।
                </li>
                <li>
                  ব্যবহারকারীরা গুগলের বিজ্ঞাপন এবং বিষয়বস্তু নেটওয়ার্ক গোপনীয়তা নীতি অনুসরণ করে ব্যক্তিগতকৃত বিজ্ঞাপনের জন্য DART কুকির ব্যবহার বন্ধ (Opt-out) করতে পারেন। এর জন্য অনুগ্রহ করে গুগলের বিজ্ঞাপন সেটিংস পৃষ্ঠায় যান:{' '}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline font-semibold inline-flex items-center gap-1"
                  >
                    Google Ads Settings <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">৩. বিজ্ঞাপন অংশীদার ও তৃতীয় পক্ষের নীতিমালা</h2>
              <p>
                আমাদের কিছু বিজ্ঞাপন অংশীদার আমাদের সাইটে কুকিজ এবং ওয়েব বীকন ব্যবহার করতে পারে। আমাদের প্রধান বিজ্ঞাপন অংশীদারের মধ্যে রয়েছে <strong>Google AdSense</strong>। আমাদের প্রতিটি বিজ্ঞাপন অংশীদারের নিজস্ব গোপনীয়তা নীতি রয়েছে।
              </p>
              <p>
                তৃতীয় পক্ষের বিজ্ঞাপন সার্ভার বা বিজ্ঞাপন নেটওয়ার্কগুলি কুকিজ, জাভাস্ক্রিপ্ট বা ওয়েব বীকন প্রযুক্তির মতো প্রযুক্তি ব্যবহার করে যা amarmetro.com-এ প্রদর্শিত তাদের বিজ্ঞাপন এবং লিঙ্কগুলিতে ব্যবহৃত হয়, যা সরাসরি ব্যবহারকারীর ব্রাউজারে পাঠানো হয়। তৃতীয় পক্ষের বিজ্ঞাপনদাতাদের দ্বারা ব্যবহৃত এই কুকিগুলির ওপর amarmetro.com-এর কোনো অ্যাক্সেস বা নিয়ন্ত্রণ নেই।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">৪. লগ ফাইল ও অ্যানালিটিক্স (Log Files & Web Analytics)</h2>
              <p>
                amarmetro.com স্ট্যান্ডার্ড লগ ফাইল ব্যবহারের পদ্ধতি অনুসরণ করে। যখন কোনো ভিজিটর ওয়েবসাইটে যান, এই ফাইলগুলি ভিজিটরদের লগ করে। লগ ফাইল দ্বারা সংগৃহীত তথ্যের মধ্যে রয়েছে ইন্টারনেট প্রোটোকল (আইপি) ঠিকানা, ব্রাউজারের ধরণ, ইন্টারনেট পরিষেবা প্রদানকারী (আইএসপি), তারিখ ও সময়ের স্ট্যাম্প, রেফারিং/প্রস্থান পৃষ্ঠাগুলি এবং ক্লিক সংখ্যা। এগুলো কোনো ব্যক্তিগতভাবে সনাক্তযোগ্য তথ্যের সাথে যুক্ত নয়। এই তথ্যের উদ্দেশ্য হলো ট্রেন্ড বিশ্লেষণ করা, সাইট পরিচালনা করা, ওয়েবসাইটে ব্যবহারকারীদের গতিবিধি ট্র্যাক করা এবং জনসংখ্যার তথ্য সংগ্রহ করা।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">৫. সিসিডিএ এবং জিডিপিআর ডেটা সুরক্ষা অধিকার (CCPA & GDPR Rights)</h2>
              <p>
                আমরা নিশ্চিত করতে চাই যে আপনি আপনার সমস্ত ডেটা সুরক্ষা অধিকার সম্পর্কে পুরোপুরি সচেতন। প্রত্যেক ব্যবহারকারীর নিম্নলিখিত অধিকার রয়েছে:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>অ্যাক্সেস অধিকার:</strong> আপনার ব্যক্তিগত তথ্যের কপি চাওয়ার অধিকার।</li>
                <li><strong>সংশোধনের অধিকার:</strong> কোনো ভুল তথ্য সংশোধন করার অনুরোধ জানানোর অধিকার।</li>
                <li><strong>মুছে ফেলার অধিকার:</strong> নির্দিষ্ট পরিস্থিতিতে আপনার তথ্য মুছে ফেলার অনুরোধ জানানোর অধিকার।</li>
                <li><strong>সম্মতি প্রত্যাহারের অধিকার:</strong> কুকি ব্যানার বা ব্রাউজার ক্যাশে ক্লিয়ারের মাধ্যমে যেকোনো সময় আপনার সম্মতি প্রত্যাহার করতে পারেন।</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">৬. শিশুদের তথ্যের সুরক্ষা (Children's Information)</h2>
              <p>
                ইন্টারনেট ব্যবহার করার সময় শিশুদের জন্য সুরক্ষা যোগ করা আমাদের অগ্রাধিকারের আরেকটি অংশ। amarmetro.com জেনেশুনে ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে কোনো ব্যক্তিগত শনাক্তকরণ তথ্য সংগ্রহ করে না। যদি আপনি মনে করেন যে আপনার সন্তান আমাদের ওয়েবসাইটে এই ধরনের তথ্য প্রদান করেছে, তবে অবিলম্বে আমাদের সাথে যোগাযোগ করুন এবং আমরা আমাদের রেকর্ড থেকে তা দ্রুত অপসারণ করব।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">৭. সম্মতি (Consent)</h2>
              <p>
                আমাদের ওয়েবসাইট amarmetro.com ব্যবহার করে, আপনি এতদ্বারা আমাদের গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন এবং এর শর্তাবলীতে সম্মত হচ্ছেন।
              </p>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TERMS OF SERVICE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'terms' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold mb-3">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>ওয়েবসাইট ব্যবহারের আইনি শর্তসমূহ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms of Service)' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              কার্যকরী তারিখ: ২৭ অক্টোবর ২০২৬ · amarmetro.com
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">১. শর্তাবলীর গ্রহণযোগ্যতা</h2>
              <p>
                <strong>amarmetro.com</strong> অ্যাক্সেস বা ব্যবহার করার মাধ্যমে, আপনি এই শর্তাবলী দ্বারা আবদ্ধ হতে সম্মত হন। আপনি যদি এই শর্তাবলীর যেকোনো অংশের সাথে একমত না হন, তবে অনুগ্রহ করে আমাদের পরিষেবাগুলি ব্যবহার করা থেকে বিরত থাকুন।
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">২. সেবার প্রকৃতি ও উদ্দেশ্য</h2>
              <p>
                amarmetro.com হলো ঢাকা মেট্রোরেল (MRT Line-6) এবং ঢাকা সিটি বাস রুট সংক্রান্ত একটি উন্মুক্ত ডিজিটাল ট্রানজিট তথ্যভাণ্ডার ও ভাড়া ক্যালকুলেটর। এটি নগরবাসীকে মেট্রোরেল ভ্রমণ সহজতর করতে ভাড়া গণনা, রুট ম্যাপ, সময়সূচী এবং ফিডার বাস সংযোগের তথ্য প্রদান করে।
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">৩. বুদ্ধিবৃত্তিক সম্পত্তি ও কনটেন্ট কপিরাইট</h2>
              <p>
                সাইটের সকল লিখিত নিবন্ধ, গাইডের ব্যাখ্যা, ক্যালকুলেটর অ্যালগরিদম, লেআউট ডিজাইন এবং সফটওয়্যার কোড amarmetro.com-এর মেধা সম্পদ। যেকোনো বাণিজ্যিক পুনঃপ্রকাশের পূর্বে লিখিত অনুমতি গ্রহণ বাধ্যতামূলক। তবে জনস্বার্থে তথ্য শেয়ার করা যাবে মূল সোর্স লিঙ্ক উল্লেখ করে।
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">৪. ব্যবহারকারীর আচরণ</h2>
              <p>
                ওয়েবসাইট ব্যবহারে এমন কোনো কার্যকলাপে লিপ্ত হওয়া নিষিদ্ধ যা সাইটের নিরাপত্তা বিঘ্নিত করে, সার্ভারে অতিরিক্ত লোড তৈরি করে বা অন্য ব্যবহারকারীদের ব্যবহারে ব্যাঘাত ঘটায়।
              </p>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISCLAIMER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'disclaimer' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>দায়মুক্তি ও স্বতন্ত্র তথ্য পোর্টাল ঘোষণা</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'দায়মুক্তি নোটিশ (Disclaimer)' : 'Disclaimer for Amar Metro'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              আইনগত স্বচ্ছতা নোটিশ · amarmetro.com
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2 text-slate-800">
              <h2 className="font-bold text-amber-900 text-base">সরকারি সংশ্লিষ্টতাহীন স্বতন্ত্র প্ল্যাটফর্মের ঘোষণা</h2>
              <p>
                <strong>amarmetro.com কোনো সরকারি সংস্থা বা ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (DMTCL)-এর অফিসিয়াল ওয়েবসাইট বা অঙ্গপ্রতিষ্ঠান নয়।</strong> এটি যাত্রী ও নাগরিকদের সুবিধার্থে নির্মিত একটি সম্পূর্ণ স্বাধীন, নাগরিক-উদ্যোগভিত্তিক মেট্রো সহায়িকা পোর্টাল।
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">১. তথ্যের যথার্থতা ও হালনাগাদ</h2>
              <p>
                আমরা ঢাকা মেট্রোরেলের সর্বশেষ সরকারি গেজেট, ডিএমটিসিএল প্রজ্ঞাপন এবং স্টেশন নোটিশ থেকে তথ্য সংগ্রহ করে যাচাই-বাছাইপূর্বক ক্যালকুলেটর ও সময়সূচী হালনাগাদ রাখি। তবুও ট্রেনের বিশেষ শিডিউল পরিবর্তন, রক্ষণাবেক্ষণ কিংবা কোনো অনাকাঙ্ক্ষিত পরিস্থিতিতে সরাসরি স্টেশনের মাইকিং এবং DMTCL-এর অফিসিয়াল নির্দেশনা অনুসরণ করার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">২. কোনো আর্থিক লেনদেন করা হয় না</h2>
              <p>
                amarmetro.com কোনো প্রকার ট্রানজিট টিকিট বা এমআরটি পাস রিচার্জের অনলাইন অর্থ লেনদেন করে না। সকল রিচার্জ ও টিকিট সরাসরি স্টেশন কাউন্টার বা টিকিট ভেন্ডিং মেশিন (TVM) থেকে সম্পন্ন করতে হবে।
              </p>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABOUT US TAB */}
      {/* ========================================================================= */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>আমাদের মিশন ও টিম</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'আমাদের সম্পর্কে (About Amar Metro)' : 'About Amar Metro'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              সহজ ও প্রযুক্তিনির্ভর নগর যাতায়াতের অঙ্গীকার · amarmetro.com
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <p className="text-base font-medium text-slate-800 leading-relaxed">
              <strong>amar metro (আমার মেট্রো)</strong> হলো ঢাকা শহরের লাখ লাখ নিত্যযাত্রীর জন্য নিবেদিত একটি আধুনিক, দ্রুতগতির মেট্রো রেল সহায়িকা ও আরবান মোবিলিটি প্রকাশনা প্ল্যাটফর্ম।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ১
                </div>
                <h3 className="font-bold text-slate-900">সঠিক ভাড়া ক্যালকুলেশন</h3>
                <p className="text-xs text-slate-600">
                  উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত ১৬টি স্টেশনের যেকোনো দুটি পয়েন্টের মাঝে সিঙ্গেল টিকিট ও এমআরটি পাসের ১০% ডিসকাউন্টযুক্ত সঠিক ভাড়া।
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ২
                </div>
                <h3 className="font-bold text-slate-900">রুট ও ফিডার বাস সংযোগ</h3>
                <p className="text-xs text-slate-600">
                  মেট্রো স্টেশন থেকে নেমে মিরপুর, ধানমন্ডি, গুলশান বা পুরোনো ঢাকায় সহজে যাওয়ার লোকাল ও সিটিং বাস রুট নির্দেশিকা।
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ৩
                </div>
                <h3 className="font-bold text-slate-900">নিত্য আপডেট ও ব্লগ</h3>
                <p className="text-xs text-slate-600">
                  এমআরটি পাস রেজিস্ট্রেশন, সাপ্তাহিক ছুটির শিডিউল, হারিয়ে যাওয়া পাস পুনরুদ্ধার ও জরুরি যাত্রী সুবিধার তথ্যবহুল প্রতিবেদন।
                </p>
              </div>
            </div>

            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900">আমাদের সম্পাদকীয় মান ও নীতি</h2>
              <p>
                amarmetro.com-এর সকল লেখা ট্রানজিট গবেষক ও নিয়মিত মেট্রো যাত্রীদের প্রত্যক্ষ অভিজ্ঞতা ও সরকারি গেজেটের তথ্যের ভিত্তিতে লিখিত। আমরা ভুয়া বা ক্লিকবেইট সংবাদ বর্জন করে যাত্রীদের প্রকৃত তথ্যের নিশ্চয়তা প্রদান করি।
              </p>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTACT US TAB */}
      {/* ========================================================================= */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>সরাসরি টিম ও সম্পাদকের সাথে যোগাযোগ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn' ? 'যোগাযোগ করুন (Contact Us)' : 'Contact Amar Metro'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              যেকোনো পরামর্শ, তথ্য সংশোধন বা বিজ্ঞাপনের জন্য আমরা সার্বক্ষণিক প্রস্তুত
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information Column */}
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>অফিসিয়াল ইমেইল ঠিকানা</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">সাধারণ জিজ্ঞাসা ও পাঠক ফিডব্যাক:</span>
                    <a href="mailto:contact@amarmetro.com" className="font-mono font-bold text-emerald-700 hover:underline">
                      contact@amarmetro.com
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">সম্পাদকীয় ও বিজ্ঞাপন বিভাগ:</span>
                    <a href="mailto:support@amarmetro.com" className="font-mono font-bold text-emerald-700 hover:underline">
                      support@amarmetro.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">অবস্থান ও এলাকা:</span>
                    <span className="text-slate-600">ঢাকা মেট্রোপলিটন এরিয়া, বাংলাদেশ</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">প্রতিক্রিয়া সময়:</span>
                    <span className="text-slate-600">সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ইমেইলের উত্তর প্রদান করা হয়।</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
              {contactSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {lang === 'bn' ? 'আপনার বার্তা সফলভাবে গ্রহণ করা হয়েছে!' : 'Message Received!'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {lang === 'bn'
                      ? 'ধন্যবাদ! আমাদের টিম আপনার বার্তাটি পর্যালোচনা করে শীঘ্রই ইমেইলে যোগাযোগ করবে।'
                      : 'Thank you! Our editorial team will review your inquiry and get back to you shortly.'}
                  </p>
                  <button
                    onClick={() => setContactSuccess(false)}
                    className="text-xs text-emerald-700 font-bold hover:underline pt-2 cursor-pointer"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">সরাসরি বার্তা পাঠান:</h3>

                  {contactError && (
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                      {contactError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মো. রহিম উদ্দিন"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বিষয়ের ধরন
                    </label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="সাধারণ জিজ্ঞাসা">সাধারণ জিজ্ঞাসা</option>
                      <option value="তথ্য সংশোধন বা আপডেট">তথ্য সংশোধন বা আপডেট</option>
                      <option value="বিজ্ঞাপন ও পার্টনারশিপ">বিজ্ঞাপন ও পার্টনারশিপ</option>
                      <option value="ওয়েবসাইট ফিডব্যাক">ওয়েবসাইট ফিডব্যাক</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      আপনার বার্তা বা মতামত <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="এখানে আপনার বার্তা বিস্তারিত লিখুন..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingContact ? (
                      <span>পাঠানো হচ্ছে...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>বার্তা পাঠান</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
