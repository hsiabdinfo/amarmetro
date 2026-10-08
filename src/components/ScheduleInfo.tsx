import React from 'react';
import { Clock, Calendar, AlertCircle, Sparkles, Train } from 'lucide-react';

interface ScheduleInfoProps {
  lang: 'bn' | 'en';
}

export const ScheduleInfo: React.FC<ScheduleInfoProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <span className="w-2.5 h-6 bg-emerald-600 rounded-sm"></span>
          {lang === 'bn' ? 'ঢাকা মেট্রো রেলের অফিশিয়াল সময়সূচী ও ট্রেন ফ্রিকোয়েন্সি' : 'Dhaka Metro Official Timetable & Headway'}
        </h2>
        <p className="text-sm text-slate-500">
          {lang === 'bn'
            ? 'এমআরটি লাইন-৬ এর পিক ও অফ-পিক সময়সূচী এবং শুক্রবারের বিশেষ ট্রানজিট সময়'
            : 'Operational hours and headway schedules for weekdays and weekends'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Days (Saturday to Thursday) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'শনিবার থেকে বৃহস্পতিবার (নিয়মিত দিন)' : 'Saturday to Thursday'}</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
              {lang === 'bn' ? 'পূর্ণাঙ্গ সেবা' : 'Full Service'}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'মর্নিং পিক আওয়ার' : 'Morning Peak'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'সকাল ০৭:১০ - বেলা ১১:৩০' : '07:10 AM - 11:30 AM'}</span>
              </div>
              <span className="font-extrabold text-emerald-700 text-sm">{lang === 'bn' ? 'প্রতি ৬ মিনিট' : 'Every 6 mins'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'অফ-পিক সময়' : 'Off-Peak Hours'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'বেলা ১১:৩১ - বিকাল ০৪:০০' : '11:31 AM - 04:00 PM'}</span>
              </div>
              <span className="font-extrabold text-slate-700 text-sm">{lang === 'bn' ? 'প্রতি ১০ মিনিট' : 'Every 10 mins'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'ইভনিং পিক আওয়ার' : 'Evening Peak'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'বিকাল ০৪:০১ - রাত ০৮:০০' : '04:01 PM - 08:00 PM'}</span>
              </div>
              <span className="font-extrabold text-emerald-700 text-sm">{lang === 'bn' ? 'প্রতি ৮ মিনিট' : 'Every 8 mins'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'নাইট অফ-পিক' : 'Night Off-Peak'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'রাত ০৮:০১ - রাত ০৯:৪০' : '08:01 PM - 09:40 PM'}</span>
              </div>
              <span className="font-extrabold text-slate-700 text-sm">{lang === 'bn' ? 'প্রতি ১০ মিনিট' : 'Every 10 mins'}</span>
            </div>
          </div>
        </div>

        {/* Friday Special Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'শুক্রবার (বিশেষ সাপ্তাহিক সময়সূচী)' : 'Friday Schedule'}</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg">
              {lang === 'bn' ? 'বিকেল থেকে রাত' : 'Afternoon to Night'}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'প্রথম ট্রেনের সময়' : 'First Train'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'উত্তরা উত্তর ও মতিঝিল উভয় প্রান্ত' : 'Both Terminals'}</span>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">০৩:৩০ PM</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'ফ্রিকোয়েন্সি' : 'Train Headway'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'বিকেল ৩:৩০ থেকে রাত ৯:৪০' : '03:30 PM - 09:40 PM'}</span>
              </div>
              <span className="font-extrabold text-emerald-700 text-sm">{lang === 'bn' ? 'প্রতি ১০-১২ মিনিট' : 'Every 10-12 mins'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{lang === 'bn' ? 'শেষ ট্রেনের সময়' : 'Last Train'}</span>
                <span className="text-xs text-slate-500">{lang === 'bn' ? 'উত্তরা উত্তর থেকে মতিঝিল' : 'Uttara North to Motijheel'}</span>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">০৯:৪০ PM</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'জুমার নামাজের কারণে শুক্রবার সকাল বেলা ট্রেন চলাচল বন্ধ থাকে।'
                : 'Friday morning trains do not operate due to Jumuah prayer window.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
