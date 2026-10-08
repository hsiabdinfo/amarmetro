import React, { useState } from 'react';
import { ArrowLeftRight, Clock, MapPin, Sparkles, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import { STATIONS, calculateMetroFare, Station } from '../data/metroData.ts';

interface FareCalculatorProps {
  lang: 'bn' | 'en';
  onSelectStation?: (stationId: string) => void;
}

export const FareCalculator: React.FC<FareCalculatorProps> = ({ lang, onSelectStation }) => {
  const [fromStationId, setFromStationId] = useState<string>('uttara-north');
  const [toStationId, setToStationId] = useState<string>('motijheel');

  const operationalStations = STATIONS.filter((s) => s.isOperational);

  const handleSwap = () => {
    setFromStationId(toStationId);
    setToStationId(fromStationId);
  };

  const fareResult = calculateMetroFare(fromStationId, toStationId);
  const fromStation = STATIONS.find((s) => s.id === fromStationId);
  const toStation = STATIONS.find((s) => s.id === toStationId);

  // List intermediate stations along the journey
  const getJourneyStations = (): Station[] => {
    if (!fromStation || !toStation) return [];
    const startIndex = Math.min(fromStation.index, toStation.index);
    const endIndex = Math.max(fromStation.index, toStation.index);
    const stationsInBetween = STATIONS.slice(startIndex, endIndex + 1);
    return fromStation.index > toStation.index ? [...stationsInBetween].reverse() : stationsInBetween;
  };

  const journeyStations = getJourneyStations();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-sm"></span>
            {lang === 'bn' ? 'মেট্রো ভাড়া ও সময় ক্যালকুলেটর' : 'Metro Fare & Travel Calculator'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'সঠিক স্টেশন নির্বাচন করে সরকারি নির্ধারিত ভাড়া ও সাশ্রয়ী এমআরটি পাস ডিসকাউন্ট জানুন'
              : 'Select origin and destination to view official fares and travel estimates'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{lang === 'bn' ? 'এমআরটি পাসে প্রতি ট্রিপে ১০% নিশ্চিত ছাড়' : 'Flat 10% Off with MRT Pass'}</span>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
        {/* From Station */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {lang === 'bn' ? 'যাত্রা শুরুর স্টেশন (From)' : 'Origin Station'}
          </label>
          <div className="relative">
            <select
              value={fromStationId}
              onChange={(e) => setFromStationId(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {operationalStations.map((station) => (
                <option key={station.id} value={station.id} disabled={station.id === toStationId}>
                  {lang === 'bn' ? station.nameBn : station.nameEn} ({station.code})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pt-2 md:pt-6">
          <button
            onClick={handleSwap}
            type="button"
            className="p-3 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-transform active:scale-95 shadow-2xs"
            title={lang === 'bn' ? 'স্টেশন অদলবদল করুন' : 'Swap stations'}
            aria-label="Swap origin and destination stations"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* To Station */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {lang === 'bn' ? 'গন্তব্য স্টেশন (To)' : 'Destination Station'}
          </label>
          <div className="relative">
            <select
              value={toStationId}
              onChange={(e) => setToStationId(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {operationalStations.map((station) => (
                <option key={station.id} value={station.id} disabled={station.id === fromStationId}>
                  {lang === 'bn' ? station.nameBn : station.nameEn} ({station.code})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Result Cards */}
      {fareResult.regularFare > 0 ? (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Regular Token Fare */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                {lang === 'bn' ? 'সিঙ্গেল জার্নি টিকিট (কাউন্টার / TVM)' : 'Single Journey Ticket'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">৳{fareResult.regularFare}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'টাকা' : 'BDT'}</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                {lang === 'bn' ? 'স্টেশনে তাৎক্ষণিক সংগ্রহযোগ্য' : 'Standard token ticket'}
              </span>
            </div>

            {/* MRT Pass 10% Discount Fare */}
            <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200/90 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-sm">
                {lang === 'bn' ? '১০% সাশ্রয়' : '10% OFF'}
              </div>
              <span className="text-xs font-semibold text-emerald-900 block mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                {lang === 'bn' ? 'এমআরটি / র‍্যাপিড পাস ভাড়া' : 'MRT / Rapid Pass Fare'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-900">৳{fareResult.mrtPassFare}</span>
                <span className="text-xs text-emerald-700">{lang === 'bn' ? 'টাকা' : 'BDT'}</span>
              </div>
              <span className="text-xs text-emerald-800 font-medium mt-2 block">
                {lang === 'bn'
                  ? `প্রতি ট্রিপে ৳${fareResult.savings} টাকা সাশ্রয়`
                  : `Save ৳${fareResult.savings} per journey`}
              </span>
            </div>

            {/* Travel Duration */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                {lang === 'bn' ? 'আনুমানিক ভ্রমণ সময়' : 'Estimated Travel Time'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">~{fareResult.durationMinutes}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'মিনিট' : 'mins'}</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                {lang === 'bn' ? 'স্টপেজ সহ সঠিক সময়' : 'Including station stops'}
              </span>
            </div>

            {/* Route Stats */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                {lang === 'bn' ? 'দূরত্ব ও স্টপেজ' : 'Distance & Stops'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{fareResult.distanceKm}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'কিমি' : 'km'}</span>
              </div>
              <span className="text-xs text-slate-500 mt-2 block">
                {lang === 'bn'
                  ? `মোট ${fareResult.stationsCount} টি মধ্যবর্তী স্টেশন`
                  : `${fareResult.stationsCount} stations in between`}
              </span>
            </div>
          </div>

          {/* Interactive Intermediate Stations Progress Bar */}
          <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'যাত্রাপথের স্টেশনসমূহ:' : 'Stations along this route:'}
              </span>
              <span className="text-slate-500">
                {fromStation?.nameBn} ➔ {toStation?.nameBn}
              </span>
            </div>

            <div className="flex items-center overflow-x-auto pb-2 gap-2 text-xs no-scrollbar">
              {journeyStations.map((st, i) => {
                const isFirst = i === 0;
                const isLast = i === journeyStations.length - 1;
                return (
                  <div key={st.id} className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectStation && onSelectStation(st.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isFirst
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : isLast
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {lang === 'bn' ? st.nameBn : st.nameEn}
                    </button>
                    {!isLast && <span className="text-slate-300 font-bold">➔</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
          <span>
            {lang === 'bn'
              ? 'অনুগ্রহ করে ভিন্ন দুটি স্টেশন নির্বাচন করুন।'
              : 'Please select two different stations to calculate fare.'}
          </span>
        </div>
      )}
    </div>
  );
};
