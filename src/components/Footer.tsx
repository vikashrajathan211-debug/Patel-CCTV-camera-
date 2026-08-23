import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  FileText, 
  CheckCircle2,
  Send,
  Heart
} from 'lucide-react';
import { Language, ProductCategory, StoreInfo, HelpCategory } from '../types';
import { STORE_INFO } from '../data/products';
import { ShieldAlert, RotateCcw, Wrench } from 'lucide-react';

interface FooterProps {
  language: Language;
  storeInfo?: StoreInfo;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  storeInfo = STORE_INFO,
  onSelectCategory,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenHelpSupport,
  onOpenSecurityWarning,
}) => {
  const isHi = language === 'hi';

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top 4 Brand & Trust Badges Strip */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
              {isHi ? 'अधिकृत पार्टनर एवं डिस्ट्रीब्यूटर' : 'Authorized Sales & Service Partners'}
            </span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2">
              {storeInfo.brandsSupported.map((brand, idx) => (
                <span key={idx} className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black text-slate-200 border border-slate-700">
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{isHi ? 'पक्की वारंटी एवं बिल गारंटी' : 'Original Equipment Manufacturer Guarantee'}</span>
          </div>
        </div>

        {/* Main 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Store Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black shadow-lg shadow-blue-600/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {isHi ? storeInfo.nameHi : storeInfo.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isHi ? 'सुरक्षा का विश्वसनीय नाम' : 'Total CCTV & Security Store'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isHi
                ? 'हम CP Plus, Hikvision और Dahua के ओरिजिनल CCTV कैमरे, DVR/NVR, सर्विलांस हार्ड डिस्क और सम्पूर्ण सुरक्षा किट होलसेल दामों पर उपलब्ध कराते हैं।'
                : 'Direct distributor of top-tier CCTV security cameras, AcuSense DVRs, WD Purple surveillance storage, and complete installation bundles.'}
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>GST: <strong>{storeInfo.gstNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Tools & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isHi ? 'उपयोगी टूल्स व सेवाएं' : 'Surveillance Tools & Services'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={onOpenEstimator}
                  className="hover:text-blue-400 transition flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="text-amber-400">★</span>
                  <span>{isHi ? 'सीसीटीवी कोटेशन कैलकुलेटर' : 'CCTV System Package Estimator'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStorageCalc}
                  className="hover:text-blue-400 transition flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="text-emerald-400">★</span>
                  <span>{isHi ? 'हार्ड डिस्क डेज कैलकुलेटर' : 'Surveillance HDD Days Calculator'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSiteVisit}
                  className="hover:text-blue-400 transition flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="text-blue-400">★</span>
                  <span>{isHi ? 'फ्री ऑनसाइट सर्वे बुक करें' : 'Book Free Site Survey'}</span>
                </button>
              </li>
              {onOpenSecurityWarning && (
                <li>
                  <button
                    onClick={onOpenSecurityWarning}
                    className="text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1.5 cursor-pointer text-left animate-pulse"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>{isHi ? '⚠️ सावधानी नोट व फ्रॉड अलर्ट' : '⚠️ Security Caution Notice'}</span>
                  </button>
                </li>
              )}
              {onOpenHelpSupport && (
                <>
                  <li>
                    <button
                      onClick={() => onOpenHelpSupport('fraud_alert')}
                      className="text-rose-400 hover:text-rose-300 font-bold transition flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isHi ? '🚨 फ्रॉड व फर्जी कॉल रिपोर्ट' : '🚨 Report Fake Call / Fraud'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenHelpSupport('warranty_problem')}
                      className="hover:text-amber-400 text-amber-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? '🛡️ वारंटी चेक व क्लेम सहायता' : '🛡️ Warranty Check & Claims'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenHelpSupport('replacement_issue')}
                      className="hover:text-blue-300 text-blue-200 transition flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isHi ? '🔄 7-दिन रिप्लेसमेंट टिकट' : '🔄 7-Day Replacement Ticket'}</span>
                    </button>
                  </li>
                </>
              )}
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? 'CCTV लाइव व्यू फोन ऐप सेटअप' : 'CCTV Remote Phone App Configuration'}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isHi ? 'उत्पाद श्रेणियां' : 'Product Categories'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onSelectCategory('cctv')} className="hover:text-blue-400 transition cursor-pointer">
                  {isHi ? 'CCTV कैमरा (HD / ColorVu / Audio)' : 'CCTV Cameras (HD / ColorVu / Audio)'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('dvr')} className="hover:text-blue-400 transition cursor-pointer">
                  {isHi ? 'DVR / NVR रिकॉर्डर (4, 8, 16 Channel)' : 'DVR / NVR Systems (4, 8, 16 Ch)'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('hdd')} className="hover:text-blue-400 transition cursor-pointer">
                  {isHi ? 'सर्विलांस हार्ड डिस्क (1TB, 2TB, 4TB)' : 'Surveillance HDDs (1TB, 2TB, 4TB)'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('combo')} className="hover:text-blue-400 transition cursor-pointer">
                  {isHi ? 'फुल सीसीटीवी कॉम्बो किट (Ready Kits)' : 'Full CCTV Kits & Combos'}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('wifi_smart')} className="hover:text-blue-400 transition cursor-pointer">
                  {isHi ? 'स्मार्ट 360° वाईफाई व 4G सिम कैमरा' : 'Smart 360° WiFi & 4G SIM Cameras'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Shop Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isHi ? 'संपर्क एवं दुकान का पता' : 'Store Location & Contact'}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{isHi ? storeInfo.addressHi : storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`} className="hover:text-white font-bold">
                  {storeInfo.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isHi ? storeInfo.workingHoursHi : storeInfo.workingHours}</span>
              </div>
            </div>

            {/* Quick WhatsApp Direct Connect */}
            <a
              href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeInfo.name}, I would like to inquire about camera prices.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isHi ? 'व्हाट्सएप पर बात करें' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {STORE_INFO.name}. {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </span>
          <span className="flex items-center gap-1">
            {isHi ? 'विश्वसनीय सुरक्षा समाधान' : 'Secure with confidence and clarity'}
          </span>
        </div>
      </div>
    </footer>
  );
};
