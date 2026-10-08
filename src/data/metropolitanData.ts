export interface BusRoute {
  id: string;
  nameBn: string;
  nameEn: string;
  metroConnectingStation: string;
  from: string;
  to: string;
  viaBn: string[];
  serviceType: 'সিটিং সার্ভিস' | 'রেগুলার' | 'এসি বাস' | 'সার্কুলার';
  fareRange: string;
  frequency: string;
}

export interface CivicAmenity {
  id: string;
  categoryBn: 'হাসপাতাল ও স্বাস্থ্যসেবা' | 'পাসপোর্ট ও সরকারি দপ্তর' | 'পার্ক ও বিনোদন' | 'টার্মিনাল ও ইন্টারচেঞ্জ';
  nameBn: string;
  nameEn: string;
  nearestMetroStation: string;
  addressBn: string;
  servicesBn: string[];
  visitingHoursBn: string;
}

export const DHAKA_BUS_ROUTES: BusRoute[] = [
  {
    id: 'bus-1',
    nameBn: 'বিকল্প অটো সার্ভিস (Bikolpo)',
    nameEn: 'Bikolpo Auto Service',
    metroConnectingStation: 'মিরপুর ১০ / কাজীপাড়া',
    from: 'মিরপুর ১২',
    to: 'মতিঝিল',
    viaBn: ['মিরপুর ১০', 'কাজীপাড়া', 'শেওড়াপাড়া', 'ফার্মগেট', 'শাহবাগ', 'প্রেস ক্লাব', 'পল্টন'],
    serviceType: 'সিটিং সার্ভিস',
    fareRange: '৳২০ - ৳৫০',
    frequency: 'প্রতি ৫-৭ মিনিট',
  },
  {
    id: 'bus-2',
    nameBn: 'প্রজাপতি পরিবহন (Projapoti)',
    nameEn: 'Projapoti Paribahan',
    metroConnectingStation: 'উত্তরা উত্তর / পল্লবী',
    from: 'দিয়াবাড়ি (উত্তরা)',
    to: 'চিড়িয়াখানা / বসিলা',
    viaBn: ['উত্তরা হাউজবিল্ডিং', 'কালশী ফ্লাইওভার', 'মিরপুর ১০', 'টেকনিক্যাল', 'গাবতলী'],
    serviceType: 'রেগুলার',
    fareRange: '৳২৫ - ৳৬০',
    frequency: 'প্রতি ৮-১০ মিনিট',
  },
  {
    id: 'bus-3',
    nameBn: 'বিহঙ্গ পরিবহন (Bihanga)',
    nameEn: 'Bihanga Paribahan',
    metroConnectingStation: 'আগারগাঁও / বিজয় সরণি',
    from: 'মিরপুর ১৪',
    to: 'আজিমপুর',
    viaBn: ['আগারগাঁও', 'বিজয় সরণি', 'ফার্মগেট', 'সাইন্সল্যাব', 'নিউমার্কেট'],
    serviceType: 'সিটিং সার্ভিস',
    fareRange: '৳২০ - ৳৪৫',
    frequency: 'প্রতি ৫-৮ মিনিট',
  },
  {
    id: 'bus-4',
    nameBn: 'শেকড় পরিবহন (Shekor)',
    nameEn: 'Shekor Paribahan',
    metroConnectingStation: 'ফার্মগেট / কারওয়ান বাজার',
    from: 'মোহাম্মদপুর',
    to: 'বাড্ডা / নতুন বাজার',
    viaBn: ['আসাদগেট', 'ফার্মগেট', 'তেজগাঁও', 'মহাখালী', 'গুলশান ১', 'বাড্ডা লিংক রোড'],
    serviceType: 'রেগুলার',
    fareRange: '৳২০ - ৳৪০',
    frequency: 'প্রতি ৬-৮ মিনিট',
  },
  {
    id: 'bus-5',
    nameBn: 'তরঙ্গ প্লাস (Taranga Plus)',
    nameEn: 'Taranga Plus',
    metroConnectingStation: 'শাহবাগ / সচিবালয়',
    from: 'মোহাম্মদপুর',
    to: 'সায়েদাবাদ / যাত্রাবাড়ী',
    viaBn: ['শংকর', 'ধানমন্ডি ২৭', 'সাইন্সল্যাব', 'শাহবাগ', 'প্রেস ক্লাব', 'মতিঝিল', 'টিটিপাড়া'],
    serviceType: 'সিটিং সার্ভিস',
    fareRange: '৳২৫ - ৳৫০',
    frequency: 'প্রতি ৫ মিনিট',
  },
  {
    id: 'bus-6',
    nameBn: 'লাব্বাইক পরিবহন (Labbaik)',
    nameEn: 'Labbaik Paribahan',
    metroConnectingStation: 'মিরপুর ১০ / ফার্মগেট',
    from: 'সাভার / নবীনগর',
    to: 'সায়েদাবাদ',
    viaBn: ['গাবতলী', 'টেকনিক্যাল', 'শ্যামলী', 'ফার্মগেট', 'শাহবাগ', 'যাত্রাবাড়ী'],
    serviceType: 'রেগুলার',
    fareRange: '৳৩০ - ৳৮০',
    frequency: 'প্রতি ১০ মিনিট',
  },
  {
    id: 'bus-7',
    nameBn: 'বিআরটিসি এসি বাস (BRTC AC Circular)',
    nameEn: 'BRTC AC Circular',
    metroConnectingStation: 'মতিঝিল / ঢাকা বিশ্ববিদ্যালয়',
    from: 'মতিঝিল',
    to: 'উত্তরা / এয়ারপোর্ট',
    viaBn: ['প্রেস ক্লাব', 'শাহবাগ', 'ফার্মগেট', 'মহাখালী', 'বনানী', 'বিমানবন্দর'],
    serviceType: 'এসি বাস',
    fareRange: '৳৪০ - ৳১০০',
    frequency: 'প্রতি ১৫ মিনিট',
  },
  {
    id: 'bus-8',
    nameBn: 'আইয়ুব খাঁ পরিবহন (Ayub Kha)',
    nameEn: 'Ayub Kha Paribahan',
    metroConnectingStation: 'মতিঝিল',
    from: 'কমলাপুর',
    to: 'সদরঘাট / বাবুবাজার',
    viaBn: ['মতিঝিল', 'ইত্তেফাক মোড়', 'দয়াগঞ্জ', 'রায়সাহেব বাজার', 'সদরঘাট লঞ্চ টার্মিনাল'],
    serviceType: 'রেগুলার',
    fareRange: '৳১৫ - ৳৩০',
    frequency: 'প্রতি ৫ মিনিট',
  },
];

export const DHAKA_CIVIC_AMENITIES: CivicAmenity[] = [
  {
    id: 'civic-1',
    categoryBn: 'হাসপাতাল ও স্বাস্থ্যসেবা',
    nameBn: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU / PG হাসপাতাল)',
    nameEn: 'Bangabandhu Sheikh Mujib Medical University',
    nearestMetroStation: 'শাহবাগ (Shahbagh)',
    addressBn: 'শাহবাগ মোড়, ঢাকা ১০০০',
    servicesBn: ['সুপার-স্পেশালাইজড হাসপাতাল', '২৪ ঘণ্টা জরুরি বিভাগ', 'বহির্বিভাগ', 'আধুনিক ল্যাব টেস্ট'],
    visitingHoursBn: 'জরুরি সেবা ২৪/৭, বহির্বিভাগ সকাল ৮:০০ - দুপুর ২:০০',
  },
  {
    id: 'civic-2',
    categoryBn: 'হাসপাতাল ও স্বাস্থ্যসেবা',
    nameBn: 'বারডেম জেনারেল হাসপাতাল (BIRDEM)',
    nameEn: 'BIRDEM General Hospital',
    nearestMetroStation: 'শাহবাগ (Shahbagh)',
    addressBn: '১২২ কাজী নজরুল ইসলাম এভিনিউ, শাহবাগ',
    servicesBn: ['ডায়াবেটিস ও এন্ডোক্রাইনোলজি সেন্টার', 'আইসিইউ ও সিসিইউ', 'জরুরি ডায়ালাইসিস'],
    visitingHoursBn: '২৪ ঘণ্টা জরুরি সেবা চালু',
  },
  {
    id: 'civic-3',
    categoryBn: 'হাসপাতাল ও স্বাস্থ্যসেবা',
    nameBn: 'জাতীয় নিউরোসায়েন্স ইনস্টিটিউট ও হাসপাতাল',
    nameEn: 'National Institute of Neurosciences & Hospital',
    nearestMetroStation: 'আগারগাঁও (Agargaon)',
    addressBn: 'শের-ই-বাংলা নগর, আগারগাঁও',
    servicesBn: ['নিউরোসার্জারি', 'স্ট্রোক ইউনিট', 'আধুনিক এমআরআই ও সিটি স্ক্যান'],
    visitingHoursBn: 'জরুরি বিভাগ সার্বক্ষণিক',
  },
  {
    id: 'civic-4',
    categoryBn: 'পাসপোর্ট ও সরকারি দপ্তর',
    nameBn: 'বিভাগীয় পাসপোর্ট ও ভিসা অফিস, আগারগাঁও',
    nameEn: 'Regional Passport Office, Agargaon',
    nearestMetroStation: 'আগারগাঁও (Agargaon)',
    addressBn: 'শের-ই-বাংলা নগর, পাসপোর্ট ভবন, আগারগাঁও',
    servicesBn: ['ই-পাসপোর্ট আবেদন ও বায়োমেট্রিক প্রদান', 'পাসপোর্ট নবায়ন', 'জরুরি পাসপোর্ট ডেলিভারি'],
    visitingHoursBn: 'রবি-বৃহস্পতি: সকাল ৯:০০ - বিকাল ৩:৩০',
  },
  {
    id: 'civic-5',
    categoryBn: 'পাসপোর্ট ও সরকারি দপ্তর',
    nameBn: 'বাংলাদেশ সচিবালয় (Bangladesh Secretariat)',
    nameEn: 'Bangladesh Secretariat',
    nearestMetroStation: 'বাংলাদেশ সচিবালয় (Secretariat)',
    addressBn: 'তোপখানা রোড / আব্দুল গণি রোড, ঢাকা',
    servicesBn: ['বিভিন্ন মন্ত্রণালয় ও সরকারি বিভাগের প্রধান কার্যালয়', 'পাস শাখা'],
    visitingHoursBn: 'সরকারি কর্মদিবসে সকাল ৯:০০ - বিকাল ৫:০০ (প্রবেশ পাস সাপেক্ষে)',
  },
  {
    id: 'civic-6',
    categoryBn: 'পাসপোর্ট ও সরকারি দপ্তর',
    nameBn: 'বাংলাদেশ ব্যাংক (কেন্দ্রীয় ব্যাংক হেডকোয়ার্টার)',
    nameEn: 'Bangladesh Bank Headquarters',
    nearestMetroStation: 'মতিঝিল (Motijheel)',
    addressBn: 'মতিঝিল বাণিজ্যিক এলাকা, ঢাকা ১০০০',
    servicesBn: ['মুদ্রানীতি ও ব্যাংকিং সেবা', 'টাকা জাদুঘর কাউন্টার', 'বিনিয়োগ ও প্রাইজবন্ড সেবা'],
    visitingHoursBn: 'রবি-বৃহস্পতি: সকাল ১০:০০ - বিকাল ৪:০০',
  },
  {
    id: 'civic-7',
    categoryBn: 'পার্ক ও বিনোদন',
    nameBn: 'রমনা পার্ক ও সুবর্ণ লেক',
    nameEn: 'Ramna Park',
    nearestMetroStation: 'শাহবাগ (Shahbagh)',
    addressBn: 'মৌলানা ভাসানী রোড, রমনা, ঢাকা',
    servicesBn: ['শতবর্ষী বৃক্ষশোভিত জগিং ও ওয়াকিং ট্র্যাক', 'লেকসাইড বেঞ্চ', 'মুক্ত বাতাস ও শরীরচর্চা কেন্দ্র'],
    visitingHoursBn: 'প্রতিদিন সকাল ৫:৩০ - রাত ৮:৩০',
  },
  {
    id: 'civic-8',
    categoryBn: 'পার্ক ও বিনোদন',
    nameBn: 'বঙ্গবন্ধু সামরিক জাদুঘর ও নভোথিয়েটার',
    nameEn: 'Military Museum & Novo Theatre',
    nearestMetroStation: 'বিজয় সরণি (Bijoy Sarani)',
    addressBn: 'বিজয় সরণি সংযোগ, তেজগাঁও',
    servicesBn: ['সেনা, নৌ ও বিমান বাহিনীর ঐতিহাসিক প্রদর্শনী', 'প্ল্যানেটোরিয়াম স্পেস শো', 'কিডস জোন'],
    visitingHoursBn: 'সোম-শনি: সকাল ১০:০০ - সন্ধ্যা ৬:০০ (বুধবার বন্ধ)',
  },
  {
    id: 'civic-9',
    categoryBn: 'টার্মিনাল ও ইন্টারচেঞ্জ',
    nameBn: 'কমলাপুর কেন্দ্রীয় রেলওয়ে স্টেশন',
    nameEn: 'Kamalapur Central Railway Station',
    nearestMetroStation: 'মতিঝিল / আসন্ন কমলাপুর (KAM)',
    addressBn: 'কমলাপুর, ঢাকা',
    servicesBn: ['সারাদেশের সাথে দূরপাল্লার আন্তঃনগর ট্রেন', 'টিকিট কাউন্টার ও ই-টিকেটিং', 'লাগেজ ক্লকরুম'],
    visitingHoursBn: '২৪ ঘণ্টা ট্রেন চলাচল ও সেবা',
  },
  {
    id: 'civic-10',
    categoryBn: 'টার্মিনাল ও ইন্টারচেঞ্জ',
    nameBn: 'সায়দাবাদ কেন্দ্রীয় বাস টার্মিনাল',
    nameEn: 'Sayedabad Bus Terminal',
    nearestMetroStation: 'মতিঝিল (Motijheel থেকে ৫ মিনিট বাস/রিকশা)',
    addressBn: 'যাত্রাবাড়ী সংযোগ, সায়দাবাদ',
    servicesBn: ['চট্টগ্রাম, সিলেট, কুমিল্লা ও বরিশাল বিভাগের বাস যোগাযোগ'],
    visitingHoursBn: '২৪/৭ চালু',
  },
];
