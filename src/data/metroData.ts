export interface Station {
  id: string;
  nameBn: string;
  nameEn: string;
  code: string;
  index: number;
  distanceKm: number; // distance from Uttara North
  isOperational: boolean;
  landmarksBn: string[];
  landmarksEn: string[];
  facilities: string[];
  firstTrainMotijheel: string;
  lastTrainMotijheel: string;
  firstTrainUttara: string;
  lastTrainUttara: string;
}

export const STATIONS: Station[] = [
  {
    id: 'uttara-north',
    nameBn: 'উত্তরা উত্তর',
    nameEn: 'Uttara North',
    code: 'UN',
    index: 0,
    distanceKm: 0.0,
    isOperational: true,
    landmarksBn: ['দিয়াবাড়ি', 'মেট্রো রেল ডিপো', 'উত্তরা সেক্টর ১৫ ও ১৬', 'রাজউক উত্তরা মডেল কলেজ'],
    landmarksEn: ['Diabari', 'Metro Rail Depot', 'Uttara Sector 15 & 16', 'RAJUK Uttara Model College'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'নামাজের স্থান', 'বাইসাইকেল পার্কিং', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:১০',
    lastTrainMotijheel: '২০:৪০',
    firstTrainUttara: '০৭:১০',
    lastTrainUttara: '২১:৪০',
  },
  {
    id: 'uttara-center',
    nameBn: 'উত্তরা সেন্টার',
    nameEn: 'Uttara Center',
    code: 'UC',
    index: 1,
    distanceKm: 1.2,
    isOperational: true,
    landmarksBn: ['উত্তরা সেক্টর ১১ ও ১২', 'দিয়াবাড়ি লেক রোড', 'উত্তরা আধুনিক মেডিকেল কলেজ'],
    landmarksEn: ['Uttara Sector 11 & 12', 'Diabari Lake Road', 'Uttara Adhunik Medical College'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:১২',
    lastTrainMotijheel: '২০:৪২',
    firstTrainUttara: '০৭:০৮',
    lastTrainUttara: '২১:৩৮',
  },
  {
    id: 'uttara-south',
    nameBn: 'উত্তরা দক্ষিণ',
    nameEn: 'Uttara South',
    code: 'US',
    index: 2,
    distanceKm: 2.3,
    isOperational: true,
    landmarksBn: ['উত্তরা সেক্টর ১৭ ও ১৮', 'পঞ্চবটী সংযোগ', 'সোনারগাঁও জনপদ মোড়'],
    landmarksEn: ['Uttara Sector 17 & 18', 'Sonargaon Janapath Crossing'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:১৪',
    lastTrainMotijheel: '২০:৪৪',
    firstTrainUttara: '০৭:০৬',
    lastTrainUttara: '২১:৩৬',
  },
  {
    id: 'pallabi',
    nameBn: 'পল্লবী',
    nameEn: 'Pallabi',
    code: 'PAL',
    index: 3,
    distanceKm: 4.8,
    isOperational: true,
    landmarksBn: ['মিরপুর ডিওএইচএস সংযোগ', 'পল্লবী থানা', 'কালশী ফ্লাইওভার রোড', 'মিরপুর ১২ বাস টার্মিনাল'],
    landmarksEn: ['Mirpur DOHS Connection', 'Pallabi PS', 'Kalshi Flyover link', 'Mirpur 12 Terminal'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট', 'এটিএম বুথ'],
    firstTrainMotijheel: '০৭:১৮',
    lastTrainMotijheel: '২০:৪৮',
    firstTrainUttara: '০৭:০২',
    lastTrainUttara: '২১:৩২',
  },
  {
    id: 'mirpur-11',
    nameBn: 'মিরপুর ১১',
    nameEn: 'Mirpur 11',
    code: 'M11',
    index: 4,
    distanceKm: 5.9,
    isOperational: true,
    landmarksBn: ['মিরপুর বেনারসি পল্লী', 'বাংলা কলেজ রোড সংযোগ', 'মিরপুর ১১ বাজার'],
    landmarksEn: ['Mirpur Benarasi Palli', 'Mirpur 11 Kitchen Market'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:২০',
    lastTrainMotijheel: '২০:৫০',
    firstTrainUttara: '০৭:০০',
    lastTrainUttara: '২১:৩০',
  },
  {
    id: 'mirpur-10',
    nameBn: 'মিরপুর ১০',
    nameEn: 'Mirpur 10',
    code: 'M10',
    index: 5,
    distanceKm: 7.1,
    isOperational: true,
    landmarksBn: ['মিরপুর ১০ গোলচত্বর', 'শের-ই-বাংলা জাতীয় ক্রিকেট স্টেডিয়াম', 'ফায়ার সার্ভিস স্টেশন', 'সুইমিং কমপ্লেক্স'],
    landmarksEn: ['Mirpur 10 Roundabout', 'Sher-e-Bangla National Cricket Stadium', 'Fire Station', 'National Swimming Complex'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'নামাজের স্থান', 'অ্যাক্সেসিবল টয়লেট', 'কাস্টমার কেয়ার'],
    firstTrainMotijheel: '০৭:২২',
    lastTrainMotijheel: '২০:৫২',
    firstTrainUttara: '০৬:৫৮',
    lastTrainUttara: '২১:২৮',
  },
  {
    id: 'kazipara',
    nameBn: 'কাজীপাড়া',
    nameEn: 'Kazipara',
    code: 'KAZ',
    index: 6,
    distanceKm: 8.3,
    isOperational: true,
    landmarksBn: ['পশ্চিম কাজীপাড়া', 'কাজীপাড়া কেন্দ্রীয় জামে মসজিদ', 'রোকেয়া সরণি শপিং হাব'],
    landmarksEn: ['West Kazipara', 'Kazipara Central Mosque', 'Rokeya Sarani Hub'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:২৪',
    lastTrainMotijheel: '২০:৫৪',
    firstTrainUttara: '০৬:৫৬',
    lastTrainUttara: '২১:২৬',
  },
  {
    id: 'shewrapara',
    nameBn: 'শেওড়াপাড়া',
    nameEn: 'Shewrapara',
    code: 'SHE',
    index: 7,
    distanceKm: 9.3,
    isOperational: true,
    landmarksBn: ['শেওড়াপাড়া বাজার', 'মনিপুর উচ্চ বিদ্যালয় শাখা', 'রোকেয়া সরণি কাঁচাবাজার'],
    landmarksEn: ['Shewrapara Bazar', 'Monipur High School branch'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:২৬',
    lastTrainMotijheel: '২০:৫৬',
    firstTrainUttara: '০৬:৫৪',
    lastTrainUttara: '২১:২৪',
  },
  {
    id: 'agargaon',
    nameBn: 'আগারগাঁও',
    nameEn: 'Agargaon',
    code: 'AGA',
    index: 8,
    distanceKm: 11.0,
    isOperational: true,
    landmarksBn: ['পাসপোর্ট অফিস', 'নির্বাচন কমিশন ভবন', 'বিজ্ঞান জাদুঘর', 'আইসিটি টাওয়ার', 'নিউরোসায়েন্স হাসপাতাল'],
    landmarksEn: ['Passport Office', 'Election Commission', 'Science Museum', 'ICT Tower', 'National Inst. of Neurosciences'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'নামাজের স্থান', 'অ্যাক্সেসিবল টয়লেট', 'কাস্টমার কেয়ার'],
    firstTrainMotijheel: '০৭:২৯',
    lastTrainMotijheel: '২০:৫৯',
    firstTrainUttara: '০৬:৫১',
    lastTrainUttara: '২১:২১',
  },
  {
    id: 'bijoy-sarani',
    nameBn: 'বিজয় সরণি',
    nameEn: 'Bijoy Sarani',
    code: 'BIJ',
    index: 9,
    distanceKm: 12.4,
    isOperational: true,
    landmarksBn: ['বঙ্গবন্ধু সামরিক জাদুঘর', 'নভোথিয়েটার', 'সংসদ ভবন সংযোগ', 'তেজগাঁও পুরাতন বিমানবন্দর'],
    landmarksEn: ['Bangabandhu Military Museum', 'Novo Theatre', 'Parliament Link', 'Tejgaon Old Airport'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'অ্যাক্সেসিবল টয়লেট', 'ফার্স্ট এইড'],
    firstTrainMotijheel: '০৭:৩২',
    lastTrainMotijheel: '২১:০২',
    firstTrainUttara: '০৬:৪৮',
    lastTrainUttara: '২১:১৮',
  },
  {
    id: 'farmgate',
    nameBn: 'ফার্মগেট',
    nameEn: 'Farmgate',
    code: 'FAR',
    index: 10,
    distanceKm: 13.5,
    isOperational: true,
    landmarksBn: ['ফার্মগেট পার্ক ও ফুটওভার ব্রিজ', 'সরকারি বিজ্ঞান কলেজ', 'হলি ক্রস কলেজ', 'খামারবাড়ি ও কেআইবি'],
    landmarksEn: ['Farmgate Park', 'Govt Science College', 'Holy Cross College', 'Khamarbari & KIB'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট', 'কাস্টমার কেয়ার'],
    firstTrainMotijheel: '০৭:৩৫',
    lastTrainMotijheel: '২১:০৫',
    firstTrainUttara: '০৬:৪৫',
    lastTrainUttara: '২১:১৫',
  },
  {
    id: 'karwan-bazar',
    nameBn: 'কারওয়ান বাজার',
    nameEn: 'Karwan Bazar',
    code: 'KAR',
    index: 11,
    distanceKm: 14.6,
    isOperational: true,
    landmarksBn: ['পেট্রোবাংলা', 'টিসিবি ভবন', 'সোনারগাঁও হোটেল', 'বসুন্ধরা সিটি মল সংযোগ', 'কারওয়ান বাজার পাইকারি বাজার'],
    landmarksEn: ['Petrobangla', 'TCB Bhaban', 'Pan Pacific Sonargaon', 'Bashundhara City link'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:৩৮',
    lastTrainMotijheel: '২১:০৮',
    firstTrainUttara: '০৬:৪২',
    lastTrainUttara: '২১:১২',
  },
  {
    id: 'shahbagh',
    nameBn: 'শাহবাগ',
    nameEn: 'Shahbagh',
    code: 'SHA',
    index: 12,
    distanceKm: 15.8,
    isOperational: true,
    landmarksBn: ['বিএসএমএমইউ (পিজি হাসপাতাল)', 'বারডেম হাসপাতাল', 'জাতীয় জাদুঘর', 'চারুকলা', 'রমনা পার্ক'],
    landmarksEn: ['BSMMU (PG Hospital)', 'BIRDEM', 'National Museum', 'Faculty of Fine Arts', 'Ramna Park'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট', 'কাস্টমার কেয়ার'],
    firstTrainMotijheel: '০৭:৪১',
    lastTrainMotijheel: '২১:১১',
    firstTrainUttara: '০৬:৩৯',
    lastTrainUttara: '২১:০৯',
  },
  {
    id: 'dhaka-university',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয়',
    nameEn: 'Dhaka University',
    code: 'DU',
    index: 13,
    distanceKm: 17.0,
    isOperational: true,
    landmarksBn: ['টিএসসি', 'রাজু ভাস্কর্য', 'সোহরাওয়ার্দী উদ্যান ও শিখা চিরন্তন', 'বাংলা একাডেমি', 'কার্জন হল'],
    landmarksEn: ['TSC', 'Raju Sculpture', 'Suhrawardy Udyan', 'Bangla Academy', 'Curzon Hall'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'নামাজের স্থান', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:৪৪',
    lastTrainMotijheel: '২১:১৪',
    firstTrainUttara: '০৬:৩৬',
    lastTrainUttara: '২১:০৬',
  },
  {
    id: 'bangladesh-secretariat',
    nameBn: 'বাংলাদেশ সচিবালয়',
    nameEn: 'Bangladesh Secretariat',
    code: 'SEC',
    index: 14,
    distanceKm: 18.2,
    isOperational: true,
    landmarksBn: ['বাংলাদেশ সচিবালয়', 'প্রেস ক্লাব', 'পল্টন মোড়', 'বায়তুল মোকাররম জাতীয় মসজিদ', 'হাইকোর্ট'],
    landmarksEn: ['Bangladesh Secretariat', 'Press Club', 'Paltan Cross', 'Baitul Mukarram', 'High Court'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'অ্যাক্সেসিবল টয়লেট'],
    firstTrainMotijheel: '০৭:৪৭',
    lastTrainMotijheel: '২১:১৭',
    firstTrainUttara: '০৬:৩৩',
    lastTrainUttara: '২১:০৩',
  },
  {
    id: 'motijheel',
    nameBn: 'মতিঝিল',
    nameEn: 'Motijheel',
    code: 'MOT',
    index: 15,
    distanceKm: 20.1,
    isOperational: true,
    landmarksBn: ['বাংলাদেশ ব্যাংক', 'শাপলা চত্বর', 'সাধারণ বীমা ভবন', 'দিলকুশা বাণিজ্যিক এলাকা', 'বঙ্গভবন সংযোগ'],
    landmarksEn: ['Bangladesh Bank', 'Shapla Chattar', 'SBC Bhaban', 'Dilkusha Commercial Area', 'Banga Bhaban'],
    facilities: ['টিকেট ভেন্ডিং মেশিন', 'লিফট ও এসকেলেটর', 'ফার্স্ট এইড', 'নামাজের স্থান', 'অ্যাক্সেসিবল টয়লেট', 'কাস্টমার কেয়ার'],
    firstTrainMotijheel: '০৭:৫০',
    lastTrainMotijheel: '২১:২০',
    firstTrainUttara: '০৬:৩০',
    lastTrainUttara: '২১:০০',
  },
  {
    id: 'kamalapur',
    nameBn: 'কমলাপুর',
    nameEn: 'Kamalapur',
    code: 'KAM',
    index: 16,
    distanceKm: 21.26,
    isOperational: false,
    landmarksBn: ['কমলাপুর প্রধান রেলওয়ে স্টেশন', 'বাংলাদেশ রেলওয়ে হেডকোয়ার্টার', 'আইসিডি কমলাপুর'],
    landmarksEn: ['Kamalapur Central Railway Station', 'Bangladesh Railway HQ', 'Kamalapur ICD'],
    facilities: ['আসন্ন আধুনিক মাল্টিমোডাল হাব', 'ইন্টারচেঞ্জ লাইন-১ ও লাইন-২'],
    firstTrainMotijheel: 'শিগগিরই চালু',
    lastTrainMotijheel: 'শিগগিরই চালু',
    firstTrainUttara: 'শিগগিরই চালু',
    lastTrainUttara: 'শিগগিরই চালু',
  },
];

// Official Fare Calculation Table
// Minimum fare ৳20. Uttara North to Motijheel is ৳100.
// Exact station difference fare mapping according to DMTCL official chart:
export function calculateMetroFare(fromStationId: string, toStationId: string) {
  const fromStation = STATIONS.find((s) => s.id === fromStationId);
  const toStation = STATIONS.find((s) => s.id === toStationId);

  if (!fromStation || !toStation || fromStation.id === toStation.id) {
    return {
      regularFare: 0,
      mrtPassFare: 0,
      savings: 0,
      distanceKm: 0,
      stationsCount: 0,
      durationMinutes: 0,
    };
  }

  const stationDiff = Math.abs(fromStation.index - toStation.index);
  const distance = Math.abs(fromStation.distanceKm - toStation.distanceKm);

  // Official DMTCL fare logic:
  // Base fare: ৳20 (covers up to ~2 stations or 2-3km)
  // Progression up to ৳100 for the full 15 station span
  let regularFare = 20;

  if (stationDiff <= 2) {
    regularFare = 20;
  } else if (stationDiff <= 4) {
    regularFare = 30;
  } else if (stationDiff <= 6) {
    regularFare = 40;
  } else if (stationDiff <= 8) {
    regularFare = 50;
  } else if (stationDiff <= 10) {
    regularFare = 60;
  } else if (stationDiff <= 12) {
    regularFare = 70;
  } else if (stationDiff <= 13) {
    regularFare = 80;
  } else if (stationDiff <= 14) {
    regularFare = 90;
  } else {
    regularFare = 100;
  }

  // 10% instant discount for MRT Pass & Rapid Pass
  const mrtPassFare = Math.round(regularFare * 0.9);
  const savings = regularFare - mrtPassFare;

  // Duration ~ 2 minutes per station segment (includes travel + 45s dwell)
  const durationMinutes = Math.max(4, Math.round(stationDiff * 2.1));

  return {
    regularFare,
    mrtPassFare,
    savings,
    distanceKm: Number(distance.toFixed(1)),
    stationsCount: stationDiff,
    durationMinutes,
  };
}

export const METRO_CATEGORIES = [
  'সব বিভাগ',
  'খবর ও আপডেট',
  'ভ্রমণ গাইড',
  'পাস ও টিকিটিং',
  'নিয়ম ও নিরাপত্তা',
  'মেগা প্রজেক্ট',
];

export const PRESET_IMAGE_OPTIONS = [
  {
    name: 'মেট্রো ট্রেন ও উড়াল ভায়াডাক্ট',
    url: 'https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'আধুনিক প্ল্যাটফর্ম ও ট্রেন আগমন',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'উড়াল রেল লাইন ও ট্রানজিট ব্রিজ',
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'স্মার্ট এমআরটি পাস ও কার্ড পেমেন্ট',
    url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'স্টেশন প্ল্যাটফর্ম ও সেফটি ডোর',
    url: 'https://images.unsplash.com/photo-1520105072000-f44fc0832105?auto=format&fit=crop&w=1200&q=80',
  },
];
