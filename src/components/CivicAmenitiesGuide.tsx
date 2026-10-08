import React, { useState } from 'react';
import { DHAKA_CIVIC_AMENITIES, CivicAmenity } from '../data/metropolitanData.ts';
import { Building2, MapPin, Clock, Search, ShieldCheck, HeartPulse, Landmark, Trees, TrainFront } from 'lucide-react';

interface CivicAmenitiesGuideProps {
  lang: 'bn' | 'en';
}

export const CivicAmenitiesGuide: React.FC<CivicAmenitiesGuideProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'সব',
    'হাসপাতাল ও স্বাস্থ্যসেবা',
    'পাসপোর্ট ও সরকারি দপ্তর',
    'পার্ক ও বিনোদন',
    'টার্মিনাল ও ইন্টারচেঞ্জ',
  ];

  const filteredAmenities = DHAKA_CIVIC_AMENITIES.filter((item) => {
    const matchesCategory = selectedCategory === 'সব' || item.categoryBn === selectedCategory;
    const matchesSearch =
      item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.addressBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nearestMetroStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.servicesBn.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>ঢাকা মেট্রোপলিটন নাগরিক তথ্যকেন্দ্র</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn'
                ? 'নাগরিক সুবিধা ও সেবা কেন্দ্র নির্দেশিকা'
                : 'Dhaka Metropolitan Civic Amenities Directory'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'bn'
                ? 'মেট্রোরেল করিডোরের সন্নিকটে অবস্থিত হাসপাতাল, পাসপোর্ট অফিস, সচিবালয়, পার্ক এবং প্রধান বাস-রেলওয়ে ইন্টারচেঞ্জের প্রয়োজনীয় তথ্য।'
                : 'Essential public services, hospitals, passport offices, and recreation parks near MRT Line-6 stations.'}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'প্রতিষ্ঠান বা সেবা খুঁজুন...' : 'Search institution or service...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAmenities.map((amenity) => (
          <div
            key={amenity.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Category Pill */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {amenity.categoryBn}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {amenity.nearestMetroStation}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === 'bn' ? amenity.nameBn : amenity.nameEn}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {amenity.addressBn}
              </p>

              {/* Available Services */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  মূল সুবিধাসমূহ ও সেবা:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {amenity.servicesBn.map((svc, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md"
                    >
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visiting hours footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{amenity.visitingHoursBn}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
