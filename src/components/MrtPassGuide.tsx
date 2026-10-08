import React from 'react';
import { CreditCard, Check, ShieldCheck, Download, AlertCircle, HelpCircle } from 'lucide-react';

interface MrtPassGuideProps {
  lang: 'bn' | 'en';
}

export const MrtPassGuide: React.FC<MrtPassGuideProps> = ({ lang }) => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
            <CreditCard className="w-4 h-4" />
            <span>{lang === 'bn' ? 'স্মার্ট ট্রানজিট কার্ড' : 'Smart Transit Card'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {lang === 'bn'
              ? 'এমআরটি পাস ও র‍্যাপিড পাস: আপনার মেট্রো ভ্রমণের সেরা সঙ্গী'
              : 'MRT Pass & Rapid Pass: Your Ultimate Commuting Companion'}
          </h2>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            {lang === 'bn'
              ? 'প্রতি ট্রিপে ১০% নিশ্চিত ছাড় পান, টিকিটের দীর্ঘ লাইনে দাঁড়ানোর ঝামেলা এড়ান এবং স্পর্শহীন অত্যাধুনিক এনএফসি কার্ড দিয়ে নিশ্চিন্তে ভ্রমণ করুন।'
              : 'Save 10% on every ride, bypass token queues, and tap through automated fare gates effortlessly.'}
          </p>
        </div>
      </div>

      {/* Comparison: MRT Pass vs Single Journey */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MRT Pass Card */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 shadow-xs relative">
          <div className="absolute -top-3 right-6 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full">
            {lang === 'bn' ? '১০% সাশ্রয়ী' : 'Recommended'}
          </div>

          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'bn' ? 'এমআরটি পাস (MRT Pass)' : 'MRT Pass'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? 'নিয়মিত ও কর্মজীবী যাত্রীদের জন্য আদর্শ' : 'Best for regular daily commuters'}
          </p>

          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{lang === 'bn' ? '১০% ছাড়:' : '10% Discount:'}</strong> {lang === 'bn' ? 'সরকারি ভাড়ায় প্রতি ট্রিপে তাৎক্ষণিক ১০% ডিসকাউন্ট।' : 'Flat 10% fare reduction per trip.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{lang === 'bn' ? '১০ বছরের মেয়াদ:' : '10 Years Validity:'}</strong> {lang === 'bn' ? 'একবার কিনলে টানা ১০ বছর ব্যবহার করা যায়।' : 'Long term validity without renewal hassle.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{lang === 'bn' ? 'সহজ রিচার্জ:' : 'Easy Top-up:'}</strong> {lang === 'bn' ? 'টিভিএম মেশিন ও কাউন্টারে ১০০-১০,০০০ টাকা পর্যন্ত রিচার্জ।' : 'Recharge from ৳100 to ৳10,000 anytime.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{lang === 'bn' ? 'হারিয়ে গেলে সুরক্ষা:' : 'Loss Protection:'}</strong> {lang === 'bn' ? 'কার্ড হারিয়ে গেলেও জমা ব্যালেন্স নতুন কার্ডে ফেরত পাওয়া যায়।' : 'Recover stored value upon reporting lost card.'}</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{lang === 'bn' ? 'প্রাথমিক ফি: ৫০০ টাকা (২০০ টাকা জামানত + ৩০০ টাকা ব্যালেন্স)' : 'Initial Cost: ৳500 (৳200 deposit + ৳300 balance)'}</span>
          </div>
        </div>

        {/* Single Journey Token Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900">
            {lang === 'bn' ? 'সিঙ্গেল জার্নি টিকিট (Single Ticket)' : 'Single Journey Token'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? 'অনিয়মিত ও পর্যটক যাত্রীদের জন্য' : 'For occasional riders and tourists'}
          </p>

          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shrink-0 mt-0.5">•</span>
              <span>{lang === 'bn' ? 'প্রতিবার যাতায়াতের আগে ভেন্ডিং মেশিন বা কাউন্টার থেকে কিনতে হয়।' : 'Must purchase token before every single trip.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shrink-0 mt-0.5">•</span>
              <span>{lang === 'bn' ? 'কোনো ডিসকাউন্ট নেই (পূর্ণ সরকারি ভাড়া প্রযোজ্য)।' : 'Standard fare applies with zero discounts.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shrink-0 mt-0.5">•</span>
              <span>{lang === 'bn' ? 'শুধুমাত্র ক্রয়ের নির্দিষ্ট দিনে ব্যবহারের জন্য প্রযোজ্য।' : 'Valid only on the purchase date.'}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shrink-0 mt-0.5">•</span>
              <span>{lang === 'bn' ? 'গন্তব্যের এক্সিট গেটে কার্ডটি স্লটে ড্রপ করে বের হতে হয়।' : 'Deposited in fare gate slot upon exit.'}</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            {lang === 'bn' ? 'ন্যূনতম ভাড়া ২০ টাকা থেকে সর্বোচ্চ ১০০ টাকা' : 'Minimum fare ৳20 to maximum ৳100'}
          </div>
        </div>
      </div>

      {/* Registration & Recharge Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          {lang === 'bn' ? 'কীভাবে এমআরটি পাস সংগ্রহ করবেন?' : 'How to get your MRT Pass'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              ১
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {lang === 'bn' ? '১. রেজিস্ট্রেশন ফরম পূরণ' : '1. Fill Application'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn'
                ? 'যেকোনো মেট্রো স্টেশনের কাস্টমার কেয়ার বা কাউন্টার থেকে ফরম নিন অথবা অনলাইন থেকে ডাউনলোড করে জাতীয় পরিচয়পত্র/পাসপোর্ট তথ্য লিখুন।'
                : 'Collect the registration form from any station counter or online.'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              ২
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {lang === 'bn' ? '২. ৫০০ টাকা প্রদান' : '2. Pay Initial Fee'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn'
                ? 'কাউন্টারে ৫০০ টাকা জমা দিন। এর মধ্যে ২০০ টাকা জামানত (ফেরতযোগ্য) এবং ৩০০ টাকা আপনার তাৎক্ষণিক ব্যবহারের জন্য ব্যালেন্স থাকবে।'
                : 'Pay ৳500 (৳200 refundable deposit + ৳300 instant travel credit).'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              ৩
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {lang === 'bn' ? '৩. স্পর্শ করে ভ্রমণ' : '3. Tap & Ride'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn'
                ? 'তৎক্ষণাৎ কার্ড সক্রিয় হয়ে যাবে। স্টেশনের টিকিট গেটে স্পর্শ করে প্রবেশ ও প্রস্থান করুন।'
                : 'Card is active immediately. Simply tap on gate sensors to enter and exit.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
