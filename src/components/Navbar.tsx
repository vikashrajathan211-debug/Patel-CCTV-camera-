import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  ShoppingCart, 
  Calculator, 
  Sliders, 
  Clock, 
  Sparkles,
  UserCheck,
  Store,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { Language, CartItem, StoreInfo, CustomerUser, HelpCategory } from '../types';
import { subscribeSpeechState, isSpeakingAudio, stopWelcomeAudio } from '../utils/speech';
import { getPendingSurveyCount } from '../utils/surveyStorage';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartItems: CartItem[];
  storeInfo: StoreInfo;
  currentUser: CustomerUser | null;
  isGuestMode?: boolean;
  onOpenCustomerAuth: () => void;
  onLogoutCustomer: () => void;
  onSwitchAccountType?: (type: 'buyer' | 'seller') => void;
  onPlayGreeting?: () => void;
  onOpenCart: () => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenSellerProfile: () => void;
  onOpenAdminApprovals?: () => void;
  onOpenTrackSurvey?: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
  onReplaySplash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  cartItems,
  storeInfo,
  currentUser,
  isGuestMode = false,
  onOpenCustomerAuth,
  onLogoutCustomer,
  onSwitchAccountType,
  onPlayGreeting,
  onOpenCart,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenSellerProfile,
  onOpenAdminApprovals,
  onOpenTrackSurvey,
  onOpenHelpSupport,
  onOpenSecurityWarning,
  onReplaySplash,
}) => {
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHi = language === 'hi';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<'hi' | 'en' | null>(null);
  const [pendingSurveyCount, setPendingSurveyCount] = useState(0);

  useEffect(() => {
    setPendingSurveyCount(getPendingSurveyCount());
    const handleSurveyUpdate = () => {
      setPendingSurveyCount(getPendingSurveyCount());
    };
    window.addEventListener('cctv_survey_updated', handleSurveyUpdate);
    return () => window.removeEventListener('cctv_survey_updated', handleSurveyUpdate);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSpeechState((isPlaying, lang) => {
      setIsPlayingVoice(isPlaying);
      setSpeakingLanguage(lang);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-slate-800">
      {/* Top micro bar for verified customer location & store timings */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-xs py-1.5 px-3 sm:px-8 border-b border-blue-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          
          {/* Customer Location Pill / Guest Mode Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {currentUser && currentUser.isLoggedIn ? (
              <button
                onClick={onOpenCustomerAuth}
                title={isHi ? 'शहर या पिन कोड बदलें' : 'Change City or PIN code'}
                className="inline-flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-blue-400/30 transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {currentUser.city}, {currentUser.pincode}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1 rounded font-normal">
                  {isHi ? 'बदलें' : 'Change'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-amber-400/40 transition cursor-pointer"
              >
                <Eye className="w-3 h-3 text-amber-400" />
                <span>{isHi ? '👤 गेस्ट मोड (लॉगिन करें)' : '👤 Guest (Click to Login)'}</span>
              </button>
            )}

            {/* Audio Voice Welcome Replay Button with Live Speaking Pulse Animation */}
            {onPlayGreeting && (
              <button
                onClick={() => {
                  if (isPlayingVoice) {
                    stopWelcomeAudio();
                  } else {
                    onPlayGreeting();
                  }
                }}
                title={
                  isPlayingVoice 
                    ? (isHi ? 'ऑडियो बंद करें' : 'Stop voice audio') 
                    : (isHi ? 'मधुर आवाज में सुनें: हिंदी फिर इंग्लिश' : 'Listen sweet female voice greeting: Hindi then English')
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border transition cursor-pointer ${
                  isPlayingVoice
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/15'
                }`}
              >
                {isPlayingVoice ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                    <span className="font-bold">
                      {speakingLanguage === 'hi' ? 'बोल रही है: हिंदी...' : 'Speaking: English...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">
                      {isHi ? 'मधुर वॉइस वेलकम' : 'Sweet Voice Greeting'}
                    </span>
                    <span className="sm:hidden">वॉइस</span>
                  </>
                )}
              </button>
            )}

            <span className="hidden md:flex items-center gap-1 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {isHi ? 'अधिकृत CCTV डीलर' : 'Authorized CCTV Dealer'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Customer User Profile Dropdown */}
            {currentUser && currentUser.isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <User className="w-3 h-3 text-blue-400" />
                  <span className="max-w-[90px] truncate">{currentUser.name || currentUser.phone}</span>
                  {currentUser.accountType === 'seller' ? (
                    <span className="bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] px-1 py-0.2 rounded font-black">
                      🏪 सेलर
                    </span>
                  ) : (
                    <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[9px] px-1 py-0.2 rounded font-black">
                      🛒 खरीदार
                    </span>
                  )}
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-3 min-w-[240px] z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-black text-xs text-slate-900 truncate">{currentUser.name}</div>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                          currentUser.accountType === 'seller'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {currentUser.accountType === 'seller' ? '🏪 सेलर अकाउंट' : '🛒 खरीदार अकाउंट'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {currentUser.phone}</div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        📍 {currentUser.city} - {currentUser.pincode}
                      </div>
                      {currentUser.businessName && (
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                          🏢 {currentUser.businessName}
                        </div>
                      )}
                    </div>

                    {/* Account Type Features Notice */}
                    <div className={`p-2 rounded-xl text-[11px] leading-tight ${
                      currentUser.accountType === 'seller'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}>
                      {currentUser.accountType === 'seller' ? (
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1 text-amber-900">
                            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>विक्रेता व खरीदार अधिकार:</span>
                          </div>
                          <p className="text-[10px] text-amber-800">
                            {isHi ? '✓ प्रोडक्ट जोड़ें/बेचें + ✓ सभी सामान खरीदें' : '✓ Full Sell + Buy Permissions'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1 text-blue-900">
                            <ShoppingCart className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>खरीदार खाता:</span>
                          </div>
                          <p className="text-[10px] text-blue-800">
                            {isHi ? '✓ सभी सामान खरीद सकते हैं (सामान बेचने की अनुमति नहीं)' : '✓ Can buy any product (Selling locked)'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Switch Account Type Action Button */}
                    {onSwitchAccountType && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          const targetType = currentUser.accountType === 'seller' ? 'buyer' : 'seller';
                          onSwitchAccountType(targetType);
                        }}
                        className={`w-full text-left text-xs font-bold py-2 px-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          currentUser.accountType === 'seller'
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {currentUser.accountType === 'seller' ? (
                            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>
                            {currentUser.accountType === 'seller'
                              ? (isHi ? '🛒 खरीदार मोड में बदलें' : 'Switch to Buyer Account')
                              : (isHi ? '🏪 सेलर अकाउंट में अपग्रेड करें' : 'Upgrade to Seller Account')}
                          </span>
                        </div>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </button>
                    )}

                    <div className="pt-1 border-t border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCustomerAuth();
                        }}
                        className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isHi ? 'खाता / पता / पिन कोड बदलें' : 'Edit Profile & PIN'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogoutCustomer();
                        }}
                        className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isHi ? 'लॉगआउट करें' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Survey Approval Link in top micro bar */}
            {onOpenAdminApprovals && (
              <button
                onClick={onOpenAdminApprovals}
                id="top-admin-survey-approvals-btn"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 border border-emerald-400/40 transition cursor-pointer"
                title={isHi ? 'सर्वे रिक्वेस्ट अप्रूव करें व ग्राहक को नोटिफिकेशन भेजें' : 'Approve Survey Requests & Notify Customer'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'सर्वे अप्रूवल' : 'Approvals'}</span>
                {pendingSurveyCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendingSurveyCount}
                  </span>
                )}
              </button>
            )}

            {/* Customer Track Survey Link in top micro bar */}
            {onOpenTrackSurvey && (
              <button
                onClick={onOpenTrackSurvey}
                id="top-track-survey-btn"
                className="hidden sm:inline-flex bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 hover:text-white px-2.5 py-0.5 rounded-full font-semibold text-[11px] items-center gap-1 border border-indigo-400/30 transition cursor-pointer"
              >
                <Clock className="w-3 h-3 text-indigo-300" />
                <span>{isHi ? 'ट्रैक सर्वे' : 'Track Survey'}</span>
              </button>
            )}

            {/* Security Warning & Caution Notice in top micro bar */}
            {onOpenSecurityWarning && (
              <button
                onClick={onOpenSecurityWarning}
                id="top-security-warning-btn"
                className="bg-red-500/25 hover:bg-red-500/40 text-red-200 hover:text-white px-2.5 py-0.5 rounded-full font-black text-[11px] flex items-center gap-1 border border-red-400/50 transition cursor-pointer shadow-sm animate-pulse"
                title={isHi ? 'सावधानी नोट व सुरक्षा निर्देश' : 'Security Warning & Caution Notice'}
              >
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>{isHi ? '⚠️ सावधानी नोट' : '⚠️ Warning Notice'}</span>
              </button>
            )}

            {/* Help, Grievance & Fraud Alert in top micro bar */}
            {onOpenHelpSupport && (
              <button
                onClick={() => onOpenHelpSupport('fraud_alert')}
                id="top-help-support-btn"
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border border-rose-400/40 transition cursor-pointer animate-pulse-subtle"
                title={isHi ? 'हेल्प, वारंटी व फ्रॉड अलर्ट पोर्टल' : 'Help & Fraud Alert Portal'}
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>{isHi ? 'हेल्प व फ्रॉड' : 'Help & Fraud'}</span>
              </button>
            )}

            {/* Seller Profile Link in top micro bar */}
            <button
              onClick={onOpenSellerProfile}
              id="top-seller-profile-btn"
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border transition cursor-pointer ${
                currentUser?.accountType === 'seller'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                  : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-amber-200 border-amber-400/40'
              }`}
              title={
                currentUser?.accountType === 'buyer'
                  ? (isHi ? 'दुकानदार डैशबोर्ड (सिर्फ सेलर के लिए)' : 'Seller Dashboard (Seller Account Only)')
                  : (isHi ? 'दुकानदार डैशबोर्ड - प्रोडक्ट जोड़ें व एडिट करें' : 'Seller Dashboard - Add & Edit Products')
              }
            >
              <Store className="w-3 h-3" />
              <span>{isHi ? 'दुकानदार डैशबोर्ड' : 'Seller Panel'}</span>
              {currentUser?.accountType === 'buyer' && (
                <span className="text-[9px] bg-slate-800/80 text-amber-300 px-1 rounded font-normal">
                  🔒
                </span>
              )}
            </button>

            <span className="text-slate-600">|</span>

            <div className="flex items-center bg-slate-800/80 rounded-full p-0.5 border border-slate-700">
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  isHi ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  !isHi ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div 
          onClick={onReplaySplash}
          role="button"
          tabIndex={0}
          title={isHi ? 'पटेल सीसीटीवी स्प्लैश एनिमेशन देखें' : 'View Patel CCTV Splash Animation'}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none group-hover:text-blue-200 transition-colors">
                <span>{isHi ? storeInfo.nameHi : storeInfo.name}</span>
              </h1>
              <span className="hidden md:inline-block bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-blue-500/30">
                Wholesale
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium line-clamp-1">
              {isHi ? storeInfo.taglineHi : storeInfo.tagline}
            </p>
          </div>
        </div>

        {/* Action Buttons & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Package Quotation Generator Button */}
          <button
            onClick={onOpenEstimator}
            id="nav-estimator-btn"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all border border-blue-400/30 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>{isHi ? 'कोटेशन' : 'Estimator'}</span>
          </button>

          {/* Storage Recording Calculator Button */}
          <button
            onClick={onOpenStorageCalc}
            id="nav-storage-btn"
            className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>{isHi ? 'HDD डेज' : 'HDD Calc'}</span>
          </button>

          {/* Direct Phone Call */}
          <a
            href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-blue-400 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>{storeInfo.phone}</span>
          </a>

          {/* Dedicated Top Corner Seller Profile Button */}
          <button
            onClick={onOpenSellerProfile}
            id="nav-seller-profile-btn"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black px-2.5 sm:px-3.5 py-2 rounded-xl shadow-md shadow-amber-500/20 border border-amber-300/40 transition cursor-pointer"
            title={isHi ? 'दुकानदार प्रोफाइल (कैमरा फोटो, नाम, मॉडल, मूल्य व मोबाइल बदलें)' : 'Seller Admin Profile (Update photos, price, phone)'}
          >
            <Store className="w-4 h-4 text-slate-950" />
            <span className="hidden xs:inline sm:inline">{isHi ? 'दुकानदार' : 'Seller'}</span>
          </button>

          {/* Cart / Quotation Drawer Button */}
          <button
            onClick={onOpenCart}
            id="nav-cart-btn"
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-700/30 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{isHi ? 'कार्ट' : 'Cart'}</span>
            {totalCartCount > 0 && (
              <span className="bg-amber-400 text-slate-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

