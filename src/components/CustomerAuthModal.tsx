import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Phone,
  MapPin,
  Send,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  KeyRound,
  RotateCw,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  Navigation,
  Compass,
  Radio,
  MessageSquare,
  Eye,
  Volume2,
  ShoppingCart,
  Store,
  Briefcase,
  Check,
  Tag
} from 'lucide-react';
import { CustomerUser, Language, StoreInfo, CityInfo, AccountType } from '../types';
import { CITIES_DATA, searchCities } from '../data/cities';
import { speakWelcomeAudio } from '../utils/speech';
import { CCTVLoader } from './CCTVLoader';

interface CustomerAuthModalProps {
  isOpen: boolean;
  isMandatoryGate?: boolean; // If true, cannot close without login
  language: Language;
  storeInfo: StoreInfo;
  currentUser: CustomerUser | null;
  onLoginSuccess: (user: CustomerUser) => void;
  onContinueAsGuest?: () => void;
  onClose?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  isMandatoryGate = true,
  language,
  storeInfo,
  currentUser,
  onLoginSuccess,
  onContinueAsGuest,
  onClose,
}) => {
  const isHi = language === 'hi';

  // Form states
  const [accountType, setAccountType] = useState<AccountType>(currentUser?.accountType || 'buyer');
  const [businessName, setBusinessName] = useState<string>(currentUser?.businessName || '');
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [selectedCity, setSelectedCity] = useState<string>(currentUser?.city || 'Morbi');
  const [selectedState, setSelectedState] = useState<string>(currentUser?.state || 'Gujarat');
  const [pincode, setPincode] = useState<string>(currentUser?.pincode || '363641');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [landmark, setLandmark] = useState<string>(currentUser?.landmark || '');

  // Location Auto-Detect State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Reset form with currentUser values whenever modal opens or currentUser updates
  useEffect(() => {
    if (currentUser) {
      setAccountType(currentUser.accountType || 'buyer');
      setBusinessName(currentUser.businessName || '');
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setSelectedCity(currentUser.city || 'Morbi');
      setSelectedState(currentUser.state || 'Gujarat');
      setPincode(currentUser.pincode || '363641');
      setAddress(currentUser.address || '');
      setLandmark(currentUser.landmark || '');
    }
  }, [currentUser, isOpen]);

  // Automatic Location Detection Function (GPS + Reverse Geocoding + PIN Lookup)
  const detectDeviceLocation = async (isManual = true) => {
    if (!navigator.geolocation) {
      setLocationStatus(isHi ? 'आपके डिवाइस में GPS उपलब्ध नहीं है।' : 'GPS Geolocation not supported on device.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(isHi ? 'डिवाइस लोकेशन व पिन कोड सर्च किया जा रहा है...' : 'Detecting device GPS location & PIN code...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          let detectedCity = '';
          let detectedState = '';
          let detectedPin = '';

          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              detectedCity = data.city || data.locality || data.principalSubdivision || '';
              detectedState = data.principalSubdivision || '';
              detectedPin = data.postcode || '';
            }
          } catch (e) {
            console.warn('BigDataCloud fallback', e);
          }

          if (!detectedPin) {
            try {
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
                { headers: { 'User-Agent': 'PatelCCTVStore/2.0' } }
              );
              if (osmRes.ok) {
                const osmData = await osmRes.json();
                const addr = osmData.address || {};
                detectedPin = addr.postcode || detectedPin;
                detectedCity = addr.city || addr.town || addr.village || addr.county || detectedCity;
                detectedState = addr.state || detectedState;
              }
            } catch (e) {
              console.warn('OSM fallback', e);
            }
          }

          if (detectedCity || detectedPin) {
            const matched = CITIES_DATA.find(
              c => (detectedCity && c.name.toLowerCase().includes(detectedCity.toLowerCase())) ||
                   (detectedPin && c.defaultPincode === detectedPin)
            );

            if (matched) {
              setSelectedCity(matched.name);
              setSelectedState(matched.state);
              setPincode(detectedPin || matched.defaultPincode);
            } else if (detectedCity) {
              setSelectedCity(detectedCity);
              if (detectedState) setSelectedState(detectedState);
              if (detectedPin) setPincode(detectedPin);
            } else if (detectedPin) {
              setPincode(detectedPin);
            }

            setLocationStatus(
              isHi 
                ? `✓ GPS से सेट: ${detectedCity || selectedCity}, PIN: ${detectedPin || pincode}`
                : `✓ GPS Detected: ${detectedCity || selectedCity}, PIN: ${detectedPin || pincode}`
            );
          } else {
            setLocationStatus(isHi ? 'लोकेशन मिल गई। कृपया पिन कोड चेक करें।' : 'Location matched. Please confirm PIN.');
          }
        } catch (err) {
          console.error(err);
          setLocationStatus(isHi ? 'GPS लोकेशन मिल गई। कृपया सिटी व पिन कोड चेक करें।' : 'GPS captured.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (isManual) {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationStatus(isHi ? '⚠️ GPS परमिशन अस्वीकार हुई। मैन्युअली सिटी व पिन चुनें।' : '⚠️ Location permission denied. Please select manually.');
          } else {
            setLocationStatus(isHi ? '⚠️ GPS सिग्नल नहीं मिला। कृपया सिटी सर्च करें।' : '⚠️ Unable to fetch GPS signal.');
          }
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // City Search UI
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // OTP Verification States
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [showOtpBanner, setShowOtpBanner] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isWebOtpListening, setIsWebOtpListening] = useState<boolean>(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Filtered Cities list
  const filteredCities = useMemo(() => {
    return searchCities(citySearchQuery);
  }, [citySearchQuery]);

  // Resend Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Android WebOTP API listener (Auto-reads SMS from default Messages app when on mobile device)
  useEffect(() => {
    if (step !== 'otp') return;

    let abortController: AbortController | null = null;

    if ('OTPCredential' in window && typeof (window as any).OTPCredential === 'function') {
      try {
        abortController = new AbortController();
        setIsWebOtpListening(true);

        (navigator.credentials as any)
          .get({
            otp: { transport: ['sms'] },
            signal: abortController.signal,
          })
          .then((otpCredential: any) => {
            if (otpCredential && otpCredential.code) {
              const code = otpCredential.code.replace(/\D/g, '').slice(0, 6);
              if (code.length === 6) {
                setEnteredOtp(code.split(''));
                setOtpError('');
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
              }
            }
          })
          .catch((err: any) => {
            console.log('WebOTP listener info:', err);
          })
          .finally(() => {
            setIsWebOtpListening(false);
          });
      } catch (err) {
        console.log('WebOTP error:', err);
      }
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [step]);

  // Handle City Select
  const handleSelectCity = (city: CityInfo) => {
    setSelectedCity(city.name);
    setSelectedState(city.state);
    setCitySearchQuery('');
    setIsCityDropdownOpen(false);
    if (!pincode || pincode.length !== 6 || pincode === '363641') {
      setPincode(city.defaultPincode);
    }
  };

  // Generate 6-digit OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError(isHi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!pincode || pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
      setFormError(isHi ? 'कृपया 6 अंकों का सही पिन कोड दर्ज करें (पिन कोड अनिवार्य है)।' : 'Please enter a valid 6-digit PIN code (PIN code is required).');
      return;
    }

    if (!name.trim()) {
      setFormError(isHi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }

    if (!selectedCity.trim()) {
      setFormError(isHi ? 'कृपया अपनी सिटी / शहर चुनें।' : 'Please select your city.');
      return;
    }

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setStep('otp');
    setShowOtpBanner(true);

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    // Auto focus first OTP input
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
  };

  // Open native mobile SMS app directly
  const handleOpenSmsApp = () => {
    const message = `Your Patel CCTV Login OTP is: ${generatedOtp}\n\n@patel-cctv.app #${generatedOtp}`;
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newEnteredOtp = [...enteredOtp];
    newEnteredOtp[index] = value.slice(-1);
    setEnteredOtp(newEnteredOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle OTP Keydown (backspace handling)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !enteredOtp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 6);
      const newOtp = [...enteredOtp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setEnteredOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setShowOtpBanner(true);
  };

  // Verify OTP & Complete Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullEnteredOtp = enteredOtp.join('');

    if (fullEnteredOtp.length !== 6) {
      setOtpError(isHi ? 'कृपया पूरा 6 अंकों का ओटीपी दर्ज करें।' : 'Please enter complete 6-digit OTP.');
      return;
    }

    if (fullEnteredOtp !== generatedOtp) {
      setOtpError(isHi ? 'गलत ओटीपी! कृपया सही ओटीपी दर्ज करें या दोबारा भेजें।' : 'Invalid OTP! Please enter correct OTP or click resend.');
      return;
    }

    // Success!
    const userData: CustomerUser = {
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      city: selectedCity,
      state: selectedState,
      pincode: pincode.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      isLoggedIn: true,
      loggedInAt: new Date().toISOString(),
      accountType: accountType,
      businessName: accountType === 'seller' ? businessName.trim() : undefined,
    };

    onLoginSuccess(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-200 bg-blue-500/30 px-2 py-0.5 rounded-full border border-blue-400/20">
                    {isHi ? 'सुरक्षित ग्राहक लॉगिन' : 'Verified Customer Login'}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isHi ? 'ओटीपी सुरक्षा' : 'OTP Protected'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      speakWelcomeAudio();
                    }}
                    title={isHi ? 'मधुर आवाज में वेलकम सुनें' : 'Listen welcome voice'}
                    className="inline-flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30 transition cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isHi ? 'वॉइस सुनें' : 'Voice Preview'}</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                  {isHi ? storeInfo.nameHi : storeInfo.name}
                </h2>
                <p className="text-xs text-blue-100/90 mt-0.5">
                  {isHi 
                    ? 'कृपया मोबाइल नंबर, सिटी और पिन कोड दर्ज करके ओटीपी से लॉगिन करें' 
                    : 'Enter Mobile Number, City & PIN code to verify via instant OTP'}
                </p>
              </div>
            </div>

            {!isMandatoryGate && onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Real-time Simulated SMS OTP Notification Banner */}
        {showOtpBanner && step === 'otp' && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500/50 rounded-2xl shadow-md text-slate-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                      <span>📩 {isHi ? 'एसएमएस इनबॉक्स ओटीपी' : 'SMS App OTP'}</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      {isHi ? 'एसएमएस भेजा गया' : 'SMS Delivered'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {isHi ? 'आपके फोन के SMS ऐप में भेजा गया 6-अंकीय कोड:' : '6-digit verification code sent to your phone SMS:'}{' '}
                    <strong className="text-base font-black text-emerald-800 tracking-wider font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-sm">
                      {generatedOtp}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={handleOpenSmsApp}
                  title="Open default SMS app"
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? 'SMS ऐप खोलें' : 'Open SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEnteredOtp(generatedOtp.split(''));
                    setOtpError('');
                  }}
                  className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isHi ? 'ऑटो-फिल' : 'Auto Fill'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-7">
          {step === 'details' ? (
            /* STEP 1: Enter Customer Mobile, Name, City, PIN & Address */
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* GPS Auto-Detect Location Banner */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {isLocating ? (
                      <div className="animate-cctv-pan origin-center">
                        <Compass className="w-4 h-4 text-amber-300" />
                      </div>
                    ) : (
                      <Compass className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <span>{isHi ? '📍 ऑटो GPS लोकेशन व पिन कोड' : '📍 Auto GPS PIN & City Detect'}</span>
                      {isLocating && (
                        <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-semibold animate-pulse">
                          {isHi ? 'कैमरा सर्विलांस सर्च जारी...' : 'CCTV Radar Searching...'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-800/90 leading-tight mt-0.5">
                      {locationStatus || (isHi ? 'डिवाइस लोकेशन से सिटी और पिन कोड ऑटोमैटिक सेट करें' : 'Detect your current city and postal PIN code automatically via GPS')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => detectDeviceLocation(true)}
                  disabled={isLocating}
                  className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLocating ? (
                    <CCTVLoader language={language} variant="mini" title={isHi ? 'खोज रहे हैं...' : 'Detecting...'} />
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isHi ? 'GPS से खोजें' : 'Auto Detect GPS'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHi ? 'आपका पूरा नाम *' : 'Your Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHi ? 'उदा. राहुल शर्मा / पटेल' : 'e.g. Rahul Patel'}
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHi ? 'मोबाइल नंबर (SMS ऐप में ओटीपी आएगा) *' : 'Mobile Number (OTP via SMS App) *'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {isHi ? '10 अंक' : '10 digits'}
                  </span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full text-sm font-bold tracking-wider px-3.5 py-2.5 rounded-r-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              {/* City Selection & Search (Morbi, Rajkot, Ahmedabad, Jaipur, Jodhpur, Mumbai, etc.) */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isHi ? 'सिटी / शहर चुनें (गुजरात, राजस्थान, मुंबई आदि) *' : 'Select City (Gujarat, Rajasthan, Mumbai etc.) *'}</span>
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">
                    {selectedCity} ({selectedState})
                  </span>
                </label>

                {/* City Search Bar & Selected Display */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={citySearchQuery || (isCityDropdownOpen ? '' : `${selectedCity}, ${selectedState}`)}
                      onFocus={() => {
                        setIsCityDropdownOpen(true);
                        setCitySearchQuery('');
                      }}
                      onChange={(e) => {
                        setCitySearchQuery(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder={isHi ? 'सिटी सर्च करें (उदा. Morbi, Rajkot, Ahmedabad, Jaipur...)' : 'Search City (e.g. Morbi, Rajkot, Ahmedabad, Jaipur...)'}
                      className="w-full text-xs font-semibold pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                    {isCityDropdownOpen && (
                      <button
                        type="button"
                        onClick={() => setIsCityDropdownOpen(false)}
                        className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown City Search Results */}
                  {isCityDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 divide-y divide-slate-100">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {isHi ? 'उपलब्ध शहर व जिले' : 'Matching Cities & Districts'} ({filteredCities.length})
                      </div>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleSelectCity(c)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                              selectedCity === c.name
                                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                                : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <div>
                                <span className="font-semibold">{c.name} ({c.nameHi})</span>
                                <span className="text-[10px] text-slate-500 ml-1.5">[{c.state}]</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              PIN: {c.defaultPincode}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          {isHi ? 'कोई शहर नहीं मिला। कृपया स्पेलिंग जांचें।' : 'No matching city found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Popular Quick-Select City Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                    {isHi ? 'त्वरित चयन:' : 'Quick Select:'}
                  </span>
                  {[
                    { name: 'Morbi', state: 'Gujarat', pin: '363641' },
                    { name: 'Rajkot', state: 'Gujarat', pin: '360001' },
                    { name: 'Ahmedabad', state: 'Gujarat', pin: '380001' },
                    { name: 'Surat', state: 'Gujarat', pin: '395001' },
                    { name: 'Jaipur', state: 'Rajasthan', pin: '302001' },
                    { name: 'Jodhpur', state: 'Rajasthan', pin: '342001' },
                    { name: 'Mumbai', state: 'Maharashtra', pin: '400001' }
                  ].map((qc) => (
                    <button
                      key={qc.name}
                      type="button"
                      onClick={() => {
                        setSelectedCity(qc.name);
                        setSelectedState(qc.state);
                        setPincode(qc.pin);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition ${
                        selectedCity === qc.name
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {qc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory PIN Code & Locality Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 6-Digit PIN Code (MANDATORY) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isHi ? 'पिन कोड (अनिवार्य) *' : 'PIN Code (Mandatory) *'}</span>
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                      {isHi ? '6 अंक जरूरी' : '6 Digits Req.'}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="363641"
                    className="w-full text-sm font-mono font-bold tracking-widest px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isHi ? 'पिन कोड के बिना ऐप एक्सेस नहीं होगा।' : 'PIN code is required to access the app.'}
                  </p>
                </div>

                {/* Landmark / Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isHi ? 'इलाका / लैंडमार्क (वैकल्पिक)' : 'Area / Landmark (Optional)'}</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={isHi ? 'उदा. नियर बस स्टैंड / जीआईडीसी' : 'e.g. Near Bus Stand / GIDC'}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isHi ? 'दुकान / मकान का पता (Address) *' : 'Delivery / Installation Address *'}</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isHi ? 'दुकान/घर का नंबर, स्ट्रीट, मार्केट का नाम...' : 'Shop/House No., Street name, Market area...'}
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              {/* Account Type Selector: Buyer Account vs Seller Account */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{isHi ? 'खाता प्रकार चुनें (Select Account Type) *' : 'Choose Account Type *'}</span>
                  </label>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    accountType === 'buyer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {accountType === 'buyer' 
                      ? (isHi ? '🛒 खरीदार (Only Buy)' : '🛒 Buyer Account') 
                      : (isHi ? '🏪 सेलर (Sell + Buy)' : '🏪 Seller Account')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Buyer Account (खरीदने वाला अकाउंट) */}
                  <button
                    type="button"
                    onClick={() => setAccountType('buyer')}
                    id="select-buyer-account-btn"
                    className={`relative text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      accountType === 'buyer'
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          accountType === 'buyer' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                            <span>{isHi ? '🛒 खरीदार अकाउंट' : '🛒 Buyer Account'}</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 block">
                            {isHi ? '(खरीदने वाला अकाउंट)' : '(Buying Account)'}
                          </span>
                        </div>
                      </div>
                      {accountType === 'buyer' && (
                        <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{isHi ? 'कोई भी सामान खरीद सकते हैं' : 'Can purchase any product'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{isHi ? 'सामान बेच / लिस्ट नहीं कर सकते' : 'No selling / listing access'}</span>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Seller Account (बेचने वाला अकाउंट) */}
                  <button
                    type="button"
                    onClick={() => setAccountType('seller')}
                    id="select-seller-account-btn"
                    className={`relative text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      accountType === 'seller'
                        ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          accountType === 'seller' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                            <span>{isHi ? '🏪 सेलर अकाउंट' : '🏪 Seller Account'}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 block">
                            {isHi ? '(बेचने वाला अकाउंट)' : '(Selling + Buying)'}
                          </span>
                        </div>
                      </div>
                      {accountType === 'seller' && (
                        <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{isHi ? 'सामान बेच सकते हैं (Add/Edit Products)' : 'Can sell & manage catalog'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{isHi ? 'सामान खरीद भी सकते हैं (Full Buy Access)' : 'Can also purchase items'}</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* If Seller Account is selected, show optional Shop/Business Name input */}
                {accountType === 'seller' && (
                  <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl animate-in fade-in zoom-in-95 space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                      <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isHi ? 'दुकान / फर्म का नाम (वैकल्पिक):' : 'Shop / Business Name (Optional):'}</span>
                    </div>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={isHi ? 'उदा. पटेल इलेक्ट्रॉनिक्स / CCTV एजेंसी' : 'e.g. Patel CCTV Agency'}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition bg-white"
                    />
                    <p className="text-[10px] text-amber-900 font-medium">
                      {isHi 
                        ? '🌟 सेलर अकाउंट में आप अपनी दुकान के प्रोडक्ट लिस्ट कर सकते हैं और साथ ही थोक दामों पर खरीदारी भी कर सकते हैं।' 
                        : '🌟 Seller account grants access to manage store inventory and purchase items at wholesale rates.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit / Proceed to OTP Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isHi 
                    ? `${accountType === 'seller' ? 'सेलर' : 'खरीदार'} अकाउंट के लिए SMS ओटीपी प्राप्त करें` 
                    : `Get SMS OTP for ${accountType === 'seller' ? 'Seller' : 'Buyer'} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? '🔒 1-टाइम लॉगिन सुरक्षा (One-Time Device Sign In)' : '🔒 1-Time Permanent Sign In'}</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  {isHi
                    ? 'एक बार साइन इन करने के बाद ऐप कट करके कभी भी खोलने पर दोबारा लॉगिन नहीं मांगेगा। सिर्फ ऐप डिलीट या डेटा क्लियर करने पर ही दोबारा लॉगिन की जरूरत होगी।'
                    : 'Once signed in, you stay logged in permanently. Closing and reopening the app will directly open the store without asking for login again.'}
                </p>
              </div>

              {/* Guest Mode Option Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) {
                      onContinueAsGuest();
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  id="guest-mode-browse-btn"
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-slate-700" />
                  <span>{isHi ? '👤 गेस्ट मोड (सिर्फ सामान देखें - No Buying)' : '👤 Continue as Guest (Browse Only)'}</span>
                </button>
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 mt-1.5 font-medium text-center">
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>
                    {isHi
                      ? 'गेस्ट मोड में कीमतें छिपी रहेंगी। सामान खरीदने व रेट देखने के लिए लॉगिन अनिवार्य है।'
                      : 'Prices hidden in guest mode. Login required to view rates & purchase items.'}
                  </span>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter 6-digit OTP & Confirm */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center mx-auto mb-2 text-blue-600 shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {isHi ? 'ओटीपी सत्यापन (OTP Verification)' : 'Enter 6-Digit OTP'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {isHi 
                    ? `हमने आपके मोबाइल नंबर +91 ${phone} पर SMS ऐप में 6 अंकों का सत्यापन कोड भेजा है:`
                    : `We have sent a 6-digit verification code to your SMS App on +91 ${phone}:`}
                </p>
                
                {isWebOtpListening && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold animate-pulse">
                    <Radio className="w-3 h-3 text-emerald-600 animate-spin" />
                    <span>{isHi ? 'SMS ऐप से ऑटो-रीड सक्रिय है...' : 'Listening to incoming SMS on device...'}</span>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700 font-semibold">
                    <span>📍 {selectedCity}, PIN: {pincode}</span>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-blue-600 hover:underline font-bold text-[11px]"
                    >
                      {isHi ? 'बदलें' : 'Edit'}
                    </button>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    accountType === 'seller' 
                      ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' 
                      : 'bg-blue-100 text-blue-950 border border-blue-200 shadow-xs'
                  }`}>
                    {accountType === 'seller' ? (
                      <>
                        <Store className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{isHi ? '🏪 सेलर अकाउंट (Sell + Buy)' : '🏪 Seller Account'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{isHi ? '🛒 खरीदार अकाउंट (Buy Only)' : '🛒 Buyer Account'}</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenSmsApp}
                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{isHi ? 'SMS ऐप' : 'SMS App'}</span>
                  </button>
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6 Digit OTP Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                  {isHi ? 'यहाँ 6 अंकों का ओटीपी दर्ज करें' : 'Enter 6-Digit OTP Code'}
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {enteredOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition shadow-sm ${
                        digit
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                          : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="flex items-center justify-between text-xs px-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← {isHi ? 'नंबर / सिटी बदलें' : 'Change Details'}
                </button>

                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    {isHi ? `ओटीपी दोबारा भेजें (${resendTimer}s)` : `Resend OTP in ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isHi ? 'ओटीपी दोबारा भेजें' : 'Resend OTP'}</span>
                  </button>
                )}
              </div>

              {/* Verify and Open App Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">
                  {isHi ? 'ओटीपी सत्यापित करें और ऐप खोलें' : 'Verify OTP & Open App'}
                </span>
              </button>

              {/* Guest mode fallback in OTP step */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) {
                      onContinueAsGuest();
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold underline"
                >
                  {isHi ? 'या गेस्ट मोड में सामान देखें (बिना लॉगिन)' : 'Or continue as guest (view items only)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
