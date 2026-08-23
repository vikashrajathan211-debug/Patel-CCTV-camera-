import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  Headphones, 
  Sliders, 
  Calculator, 
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Language, CustomerUser, HelpCategory } from '../types';
import { STORE_INFO } from '../data/products';
import { ShieldAlert } from 'lucide-react';

interface TrustHeaderProps {
  language: Language;
  currentUser?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenTrackSurvey?: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
}

export const TrustHeader: React.FC<TrustHeaderProps> = ({
  language,
  currentUser,
  onOpenCustomerAuth,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenTrackSurvey,
  onOpenHelpSupport,
  onOpenSecurityWarning,
}) => {
  const isHi = language === 'hi';

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Hero Announcement Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-4 sm:py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="text-center lg:text-left max-w-2xl w-full">
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-3">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{isHi ? '100% ओरिजिनल • 2 साल वारंटी' : '100% Original • GST Bill & Warranty'}</span>
              </div>

              {currentUser && currentUser.isLoggedIn && (
                <button
                  type="button"
                  onClick={onOpenCustomerAuth}
                  className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-emerald-300 transition cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>📍 {currentUser.city} ({currentUser.pincode})</span>
                  <span className="text-[10px] text-emerald-200 underline ml-0.5">{isHi ? 'बदलें' : 'Change'}</span>
                </button>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {isHi 
                ? 'अपने घर, दुकान और ऑफिस को बनाएं पूरी तरह सुरक्षित' 
                : 'Complete CCTV Surveillance & Security Solutions'}
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHi
                ? 'गुजरात (मोरबी, राजकोट, सूरत), राजस्थान (जयपुर, जोधपुर, कोटा) व मुंबई सहित सभी शहरों में ऑनसाइट इंस्टॉलेशन सपोर्ट।'
                : 'Direct wholesale rates across Gujarat, Rajasthan, Mumbai & Pan-India with onsite installation.'}
            </p>
          </div>

          {/* Quick tool launch cards */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenEstimator}
              id="hero-estimator-btn"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold p-2.5 sm:px-4 sm:py-3 rounded-xl shadow-md transition-all cursor-pointer border border-blue-400/30"
            >
              <Sliders className="w-4 h-4 text-amber-300 shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[10px] sm:text-[11px] text-blue-200 font-normal uppercase leading-tight truncate">
                  {isHi ? 'तुरंत कोटेशन' : 'Instant Quote'}
                </div>
                <div className="leading-tight text-xs sm:text-sm font-bold truncate">
                  {isHi ? 'पैकेज कैलकुलेटर' : 'Package Builder'}
                </div>
              </div>
            </button>

            <button
              onClick={onOpenStorageCalc}
              id="hero-storage-btn"
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold p-2.5 sm:px-4 sm:py-3 rounded-xl shadow transition-all cursor-pointer border border-slate-700"
            >
              <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-300 font-normal uppercase leading-tight truncate">
                  {isHi ? 'स्टोरेज जांचें' : 'Recording Days'}
                </div>
                <div className="leading-tight text-xs sm:text-sm font-bold truncate">
                  {isHi ? 'HDD कैलकुलेटर' : 'Storage Calc'}
                </div>
              </div>
            </button>

            <button
              onClick={onOpenSiteVisit}
              id="hero-site-visit-btn"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold p-2.5 sm:px-4 sm:py-3 rounded-xl shadow-md transition-all cursor-pointer border border-emerald-400/30"
            >
              <CalendarCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">{isHi ? 'फ्री साइट विज़िट बुक करें' : 'Book Free Survey'}</span>
            </button>

            <div className="col-span-2 flex items-center gap-2 w-full sm:w-auto">
              {onOpenTrackSurvey && (
                <button
                  onClick={onOpenTrackSurvey}
                  id="hero-track-survey-btn"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 text-[11px] sm:text-xs font-semibold py-2 px-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
                  title={isHi ? 'सर्वे स्टेटस व अप्रूवल देखें' : 'Check Survey Status & Approval'}
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{isHi ? 'ट्रैक सर्वे' : 'Track Survey'}</span>
                </button>
              )}

              {onOpenSecurityWarning && (
                <button
                  onClick={onOpenSecurityWarning}
                  id="hero-security-warning-btn"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 text-[11px] sm:text-xs font-black py-2 px-2.5 rounded-xl border border-red-400/50 transition cursor-pointer shadow-xs animate-pulse"
                  title={isHi ? 'सावधानी नोट व सुरक्षा चेतावनी' : 'Security Caution & Warning Notice'}
                >
                  <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="truncate">{isHi ? '⚠️ सावधानी' : '⚠️ Warning'}</span>
                </button>
              )}

              {onOpenHelpSupport && (
                <button
                  onClick={() => onOpenHelpSupport('fraud_alert')}
                  id="hero-help-support-btn"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[11px] sm:text-xs font-bold py-2 px-2.5 rounded-xl border border-rose-400/40 transition cursor-pointer"
                  title={isHi ? 'फ्रॉड, वारंटी व रिप्लेसमेंट सहायता' : 'Fraud, Warranty & Replacement Help'}
                >
                  <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{isHi ? 'हेल्प / फ्रॉड' : 'Help / Fraud'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Trust Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {STORE_INFO.trustBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                {idx === 0 && <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {idx === 1 && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {idx === 2 && <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {idx === 3 && <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 truncate">
                  {isHi ? badge.titleHi : badge.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                  {isHi ? badge.descHi : badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

