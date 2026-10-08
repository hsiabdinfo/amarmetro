import React, { useState } from 'react';
import { STATIONS, Station } from '../data/metroData.ts';
import { Clock, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Accessibility, Search } from 'lucide-react';

interface RouteMapProps {
  lang: 'bn' | 'en';
  selectedStationId?: string;
  onSetAsFrom?: (id: string) => void;
  onSetAsTo?: (id: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  lang,
  selectedStationId,
  onSetAsFrom,
  onSetAsTo,
}) => {
  const [activeStationId, setActiveStationId] = useState<string>(selectedStationId || 'motijheel');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  const filteredStations = STATIONS.filter(
    (s) =>
      s.nameBn.includes(filterQuery) ||
      s.nameEn.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.landmarksBn.some((l) => l.includes(filterQuery))
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-emerald-600 rounded-sm"></span>
              {lang === 'bn' ? 'এমআরটি লাইন-৬ স্টেশন ডিরেক্টরি ও রুট ম্যাপ' : 'MRT Line-6 Route & Station Directory'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'bn'
                ? 'উত্তরা উত্তর থেকে মতিঝিল ও কমলাপুর পর্যন্ত প্রতিটি স্টেশনের সুবিধা, প্রথম ও শেষ ট্রেনের সময় এবং ল্যান্ডমার্ক'
                : 'Explore facilities, timings, and landmarks for all stations along the corridor'}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'স্টেশন বা ল্যান্ডমার্ক খুঁজুন...' : 'Search station or landmark...'}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Track List + Selected Station Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Metro Track Diagram */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-h-[720px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{lang === 'bn' ? 'মেট্রো লাইন-৬ স্টেশন তালিকা' : 'Stations List'}</span>
            <span>{lang === 'bn' ? 'দূরত্ব' : 'Distance'}</span>
          </div>

          <div className="relative pl-6 space-y-3">
            {/* The Green Track Line */}
            <div className="absolute left-2.5 top-2 bottom-3 w-1 bg-emerald-600 rounded-full"></div>

            {filteredStations.map((station) => {
              const isActive = station.id === activeStationId;
              return (
                <div key={station.id} className="relative">
                  {/* Station Node dot */}
                  <div
                    className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isActive
                        ? 'bg-white border-emerald-700 ring-4 ring-emerald-200 scale-125'
                        : station.isOperational
                        ? 'bg-emerald-600 border-white'
                        : 'bg-amber-400 border-white'
                    }`}
                  ></div>

                  {/* Station Card Button */}
                  <button
                    onClick={() => setActiveStationId(station.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {lang === 'bn' ? station.nameBn : station.nameEn}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          [{station.code}]
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lang === 'bn' ? station.nameEn : station.nameBn}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-600">
                        {station.distanceKm} km
                      </span>
                      <div>
                        {station.isOperational ? (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-medium">
                            {lang === 'bn' ? 'আসন্ন' : 'Upcoming'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Station Detailed Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs sticky top-24">
          {/* Station Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-800 text-white">
                  {activeStation.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? `স্টেশন নং ${activeStation.index + 1}` : `Station #${activeStation.index + 1}`}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeStation.distanceKm} km {lang === 'bn' ? 'ডিপো থেকে' : 'from depot'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {lang === 'bn' ? activeStation.nameBn : activeStation.nameEn}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {lang === 'bn' ? activeStation.nameEn : activeStation.nameBn}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onSetAsFrom && (
                <button
                  onClick={() => onSetAsFrom(activeStation.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                >
                  {lang === 'bn' ? 'শুরুর স্টেশন করুন' : 'Set as From'}
                </button>
              )}
              {onSetAsTo && (
                <button
                  onClick={() => onSetAsTo(activeStation.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  {lang === 'bn' ? 'গন্তব্য স্টেশন করুন' : 'Set as To'}
                </button>
              )}
            </div>
          </div>

          {/* Timetable / First & Last Train */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'bn' ? 'মতিঝিলমুখী ট্রেন সময়সূচী' : 'Towards Motijheel'}
              </span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'bn' ? 'প্রথম ট্রেন:' : 'First Train:'}</span>
                <span className="font-bold text-slate-900">{activeStation.firstTrainMotijheel} AM</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-500">{lang === 'bn' ? 'শেষ ট্রেন:' : 'Last Train:'}</span>
                <span className="font-bold text-slate-900">{activeStation.lastTrainMotijheel} PM</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'bn' ? 'উত্তরা উত্তরমুখী ট্রেন সময়সূচী' : 'Towards Uttara North'}
              </span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{lang === 'bn' ? 'প্রথম ট্রেন:' : 'First Train:'}</span>
                <span className="font-bold text-slate-900">{activeStation.firstTrainUttara} AM</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-500">{lang === 'bn' ? 'শেষ ট্রেন:' : 'Last Train:'}</span>
                <span className="font-bold text-slate-900">{activeStation.lastTrainUttara} PM</span>
              </div>
            </div>
          </div>

          {/* Station Facilities */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'স্টেশন সুবিধাসমূহ' : 'Station Facilities & Amenities'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeStation.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {fac}
                </span>
              ))}
            </div>
          </div>

          {/* Key Landmarks Nearby */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'আশেপাশের গুরুত্বপূর্ণ প্রতিষ্ঠান ও দর্শনীয় স্থান' : 'Nearby Landmarks & Key Locations'}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              {(lang === 'bn' ? activeStation.landmarksBn : activeStation.landmarksEn).map((lm, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{lm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
