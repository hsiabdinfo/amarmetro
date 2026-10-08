import React, { useState } from 'react';
import { DHAKA_BUS_ROUTES, BusRoute } from '../data/metropolitanData.ts';
import { Bus, MapPin, Search, ArrowRight, Clock, Banknote, ShieldAlert } from 'lucide-react';

interface BusRoutesGuideProps {
  lang: 'bn' | 'en';
}

export const BusRoutesGuide: React.FC<BusRoutesGuideProps> = ({ lang }) => {
  const [selectedMetroStation, setSelectedMetroStation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const metroStationsList = [
    { id: 'all', nameBn: 'সকল কানেক্টিং স্টেশন', nameEn: 'All Metro Hubs' },
    { id: 'উত্তরা', nameBn: 'উত্তরা হাব', nameEn: 'Uttara Hub' },
    { id: 'মিরপুর', nameBn: 'মিরপুর ১০ / পল্লবী', nameEn: 'Mirpur Hub' },
    { id: 'আগারগাঁও', nameBn: 'আগারগাঁও', nameEn: 'Agargaon Hub' },
    { id: 'ফার্মগেট', nameBn: 'ফার্মগেট / কারওয়ান বাজার', nameEn: 'Farmgate Hub' },
    { id: 'শাহবাগ', nameBn: 'শাহবাগ / সচিবালয়', nameEn: 'Shahbagh Hub' },
    { id: 'মতিঝিল', nameBn: 'মতিঝিল / কমলাপুর', nameEn: 'Motijheel Hub' },
  ];

  const filteredRoutes = DHAKA_BUS_ROUTES.filter((route) => {
    const matchesStation =
      selectedMetroStation === 'all' || route.metroConnectingStation.includes(selectedMetroStation);
    const matchesSearch =
      route.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.viaBn.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStation && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Bus className="w-4 h-4 text-emerald-600" />
              <span>ঢাকা মেট্রোপলিটন ট্রানজিট নেটওয়ার্ক</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lang === 'bn'
                ? 'মেট্রোরেল সংলগ্ন ঢাকা বাস রুট ও ফিডার সার্ভিস'
                : 'Dhaka City Bus Routes & Metro Feeder Transit'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'bn'
                ? 'মেট্রোরেল স্টেশনে নেমে ঢাকার যেকোনো প্রান্তে সহজে যাতায়াতের জন্য নির্ভরযোগ্য বাস রুট, স্টপেজ ও আনুমানিক ভাড়ার বিস্তারিত তথ্য।'
                : 'Connecting city bus routes, stops, and fare information from MRT Line-6 stations to wider Dhaka.'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'বাসের নাম বা গন্তব্য খুঁজুন...' : 'Search bus or destination...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Metro Station Connector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {metroStationsList.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedMetroStation(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedMetroStation === st.id
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? st.nameBn : st.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((bus) => (
          <div
            key={bus.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                  {bus.serviceType}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {bus.frequency}
                </span>
              </div>

              {/* Bus Title */}
              <h3 className="text-lg font-bold text-slate-900">
                {lang === 'bn' ? bus.nameBn : bus.nameEn}
              </h3>

              {/* Metro Connection Kicker */}
              <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>মেট্রো সংযোগ: <strong>{bus.metroConnectingStation}</strong></span>
              </div>

              {/* Origin to Destination */}
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="font-bold">{bus.from}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-900">{bus.to}</span>
              </div>

              {/* Via Stops */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  গুরুত্বপূর্ণ স্টপেজসমূহ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bus.viaBn.map((stop, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      {stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fare strip */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                ভাড়া সীমা:
              </span>
              <span className="font-bold text-slate-900">{bus.fareRange}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">কোনো বাস রুট পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 mt-1">অন্য কোনো স্টেশন বা নাম দিয়ে আবার খুঁজুন।</p>
        </div>
      )}
    </div>
  );
};
