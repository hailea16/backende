import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaUser, FaLock, FaChartLine, FaBook, FaDownload, FaVideo,
  FaCertificate, FaUsers, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const translations = {
  english: {
    emptyResponse: 'Empty response from server',
    invalidJson: 'Server returned invalid JSON',
    enterUsername: 'Please enter your username or email',
    quickApproveDevOnly: 'Quick approve only available in development mode',
    userNotFound: 'User not found',
    accountApprovedNowLogin: 'Account approved! You can now login.',
    accountApproved: 'Account Approved',
    pendingApproval: 'Pending Approval',
    fillRequired: 'Please fill in all required fields',
    minPassword: 'Password must be at least 6 characters',
    loginFailed: 'Login failed',
    loginSuccessRedirect: 'Login successful! Redirecting...',
    tooManyAttempts: 'Too many failed attempts. Account locked for 24 hours.',
    signingIn: 'Signing in...',
    login: 'Login',
    checkApproval: 'Check Approval Status',
    checking: 'Checking...',
    quickApprove: 'Quick Approve (Dev)',
    noAccount: "Don't have an account?",
    registerNow: 'Register Now',
    secureLogin: 'Secure Login',
    accessDashboard: 'Access your personalized learning dashboard',
    secureAuthentication: 'Secure Authentication',
    usernamePasswordProtected: 'Username/password protected access',
    adminApprovalRequired: 'Admin approval required for new accounts',
    accountLockAfterFive: 'Account lock after 5 failed attempts',
    memberBenefits: 'Member Login Benefits',
    newToNds: 'New to NDS Trading?',
    createJourney: 'Create your account and start your journey to financial success',
    createFreeAccount: 'Create Free Account',
    noCard: 'No credit card required',
    memberLogin: 'Member Login',
    useUsernamePassword: 'Use your username/email and password',
    pendingUsers: 'Pending Users',
    registeredUsers: 'Registered Users',
    usernameOrEmail: 'Username or Email',
    enterUsernameOrEmail: 'Enter username or email',
    password: 'Password',
    enterPassword: 'Enter password',
    minimumSix: 'Minimum 6 characters',
    failedAttempts: 'Failed attempts',
    warning: 'Warning',
    attemptsRemaining: 'attempts remaining',
    courses: 'Courses',
    contact: 'Contact',
    register: 'Register',
    admin: 'Admin',
    developmentMode: 'Development Mode',
    autoApproveAvailable: 'Auto-Approve Available',
    trackProgress: 'Track Your Progress',
    accessAllCourses: 'Access All Courses',
    downloadResources: 'Download Resources',
    joinLiveSessions: 'Join Live Sessions',
    getCertificates: 'Get Certificates',
    communityAccess: 'Community Access'
  },
  amharic: {
    emptyResponse: 'ከሰርቨር ባዶ ምላሽ ተመልሷል',
    invalidJson: 'ሰርቨሩ የማይሰራ JSON መልሷል',
    enterUsername: 'እባክዎ የተጠቃሚ ስም ወይም ኢሜይል ያስገቡ',
    quickApproveDevOnly: 'ፈጣን ማጽደቅ በdevelopment ሁነታ ብቻ ይሰራል',
    userNotFound: 'ተጠቃሚ አልተገኘም',
    accountApprovedNowLogin: 'መለያው ጸድቋል! አሁን መግባት ይችላሉ።',
    accountApproved: 'መለያው ጸድቋል',
    pendingApproval: 'ማጽደቅ በመጠባበቅ ላይ',
    fillRequired: 'እባክዎ የሚፈለጉትን ሁሉ መስኮች ይሙሉ',
    minPassword: 'የይለፍ ቃል ቢያንስ 6 ፊደል መሆን አለበት',
    loginFailed: 'መግባት አልተሳካም',
    loginSuccessRedirect: 'መግባት ተሳክቷል! በመቀየር ላይ...',
    tooManyAttempts: 'ብዙ ያልተሳኩ ሙከራዎች። መለያው ለ24 ሰዓት ተዘግቷል።',
    signingIn: 'በመግባት ላይ...',
    login: 'ግባ',
    checkApproval: 'የማጽደቅ ሁኔታ ያረጋግጡ',
    checking: 'በማረጋገጥ ላይ...',
    quickApprove: 'ፈጣን ማጽደቅ (Dev)',
    noAccount: 'መለያ የለዎትም?',
    registerNow: 'አሁን ይመዝገቡ',
    secureLogin: 'ደህንነቱ የተጠበቀ መግቢያ',
    accessDashboard: 'የእርስዎን የትምህርት ዳሽቦርድ ይድረሱ',
    secureAuthentication: 'ደህንነቱ የተጠበቀ ማረጋገጫ',
    usernamePasswordProtected: 'በተጠቃሚ ስም/የይለፍ ቃል የተጠበቀ መዳረሻ',
    adminApprovalRequired: 'ለአዲስ መለያዎች የአስተዳዳሪ ማጽደቅ ያስፈልጋል',
    accountLockAfterFive: 'ከ5 ያልተሳኩ ሙከራ በኋላ መለያ ይቆለፋል',
    memberBenefits: 'የአባል መግቢያ ጥቅሞች',
    newToNds: 'ለNDS Trading አዲስ ነዎት?',
    createJourney: 'መለያ ፍጠሩ እና ወደ ፋይናንስ ስኬት ጉዞ ይጀምሩ',
    createFreeAccount: 'ነፃ መለያ ፍጠር',
    noCard: 'ክሬዲት ካርድ አያስፈልግም',
    memberLogin: 'የአባል መግቢያ',
    useUsernamePassword: 'የተጠቃሚ ስም/ኢሜይል እና የይለፍ ቃል ይጠቀሙ',
    pendingUsers: 'በመጠባበቅ ላይ ያሉ ተጠቃሚዎች',
    registeredUsers: 'የተመዘገቡ ተጠቃሚዎች',
    usernameOrEmail: 'የተጠቃሚ ስም ወይም ኢሜይል',
    enterUsernameOrEmail: 'የተጠቃሚ ስም ወይም ኢሜይል ያስገቡ',
    password: 'የይለፍ ቃል',
    enterPassword: 'የይለፍ ቃል ያስገቡ',
    minimumSix: 'ቢያንስ 6 ፊደል',
    failedAttempts: 'ያልተሳኩ ሙከራዎች',
    warning: 'ማስጠንቀቂያ',
    attemptsRemaining: 'የቀሩ ሙከራዎች',
    courses: 'ኮርሶች',
    contact: 'አግኙን',
    register: 'ተመዝገብ',
    admin: 'አስተዳዳሪ',
    developmentMode: 'የልማት ሁነታ',
    autoApproveAvailable: 'አውቶ-ማጽደቅ ዝግጁ',
    trackProgress: 'እድገትዎን ይከታተሉ',
    accessAllCourses: 'ሁሉንም ኮርሶች ይድረሱ',
    downloadResources: 'ሀብቶችን ያውርዱ',
    joinLiveSessions: 'የቀጥታ ክፍለ ጊዜዎችን ይቀላቀሉ',
    getCertificates: 'ሰርቲፊኬቶችን ያግኙ',
    communityAccess: 'የማህበረሰብ መዳረሻ'
  },
  somali: {
    emptyResponse: 'Jawaab madhan ayaa ka timid server-ka',
    invalidJson: 'Server-ku wuxuu soo celiyay JSON khaldan',
    enterUsername: 'Fadlan geli magaca isticmaalaha ama email-ka',
    quickApproveDevOnly: 'Quick approve wuxuu shaqeeyaa kaliya development mode',
    userNotFound: 'Isticmaale lama helin',
    accountApprovedNowLogin: 'Akoonka waa la ansixiyay! Hadda waad gali kartaa.',
    accountApproved: 'Akoonka waa la Ansixiyay',
    pendingApproval: 'Ansixin Sugaysa',
    fillRequired: 'Fadlan buuxi dhammaan meelaha loo baahan yahay',
    minPassword: 'Furaha sirta waa inuu ahaadaa ugu yaraan 6 xaraf',
    loginFailed: 'Gelitaan wuu fashilmay',
    loginSuccessRedirect: 'Gelitaan waa guuleystay! Dib ayaa laguugu wareejinayaa...',
    tooManyAttempts: 'Isku dayo badan ayaa fashilmay. Akoonka waa la xiray 24 saac.',
    signingIn: 'Waa la galayaa...',
    login: 'Gal',
    checkApproval: 'Hubi Xaaladda Ansixinta',
    checking: 'Waa la hubinayaa...',
    quickApprove: 'Ansixin Degdeg ah (Dev)',
    noAccount: 'Akoon ma lihid?',
    registerNow: 'Hadda Isdiiwaangeli',
    secureLogin: 'Gelitaan Ammaan ah',
    accessDashboard: 'Gal dashboard-kaaga waxbarasho ee gaarka ah',
    secureAuthentication: 'Xaqiijin Ammaan ah',
    usernamePasswordProtected: 'Gelitaan lagu ilaaliyay username/password',
    adminApprovalRequired: 'Ansixinta admin ayaa looga baahan yahay akoonnada cusub',
    accountLockAfterFive: 'Akoonka waa la xiraa kadib 5 isku day oo fashilma',
    memberBenefits: 'Faa’iidooyinka Gelitaanka Xubinta',
    newToNds: 'Ma ku cusub tahay NDS Trading?',
    createJourney: 'Samee akoonkaaga oo bilow safarkaaga guusha maaliyadeed',
    createFreeAccount: 'Samee Akoon Bilaash ah',
    noCard: 'Looma baahna kaarka deynta',
    memberLogin: 'Gelitaanka Xubinta',
    useUsernamePassword: 'Isticmaal username/email iyo password',
    pendingUsers: 'Isticmaaleyaal Sugaya',
    registeredUsers: 'Isticmaaleyaal Diiwaangashan',
    usernameOrEmail: 'Username ama Email',
    enterUsernameOrEmail: 'Geli username ama email',
    password: 'Furaha sirta',
    enterPassword: 'Geli furaha sirta',
    minimumSix: 'Ugu yaraan 6 xaraf',
    failedAttempts: 'Isku dayo fashilmay',
    warning: 'Digniin',
    attemptsRemaining: 'isku day ayaa haray',
    courses: 'Koorsooyin',
    contact: 'Nala Soo Xiriir',
    register: 'Isdiiwaangeli',
    admin: 'Maamule',
    developmentMode: 'Habka Development',
    autoApproveAvailable: 'Auto-Approve waa diyaar',
    trackProgress: 'La Soco Horumarkaaga',
    accessAllCourses: 'Hel Dhammaan Koorsooyinka',
    downloadResources: 'Soo Degso Agabyada',
    joinLiveSessions: 'Ku Biir Kulamada Tooska ah',
    getCertificates: 'Hel Shahaadooyin',
    communityAccess: 'Helitaanka Bulshada'
  }
};

const LoginPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.english;
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(from, { replace: true });
    }
  }, []);

  const safeFetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text) {
      throw new Error(t.emptyResponse);
    }
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) };
    } catch (e) {
      console.error('Invalid JSON:', text);
      throw new Error(t.invalidJson);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError(t.fillRequired);
      return;
    }
    if (formData.password.length < 6) {
      setError(t.minPassword);
      return;
    }

    setLoading(true);
    try {
      const { ok, status, data } = await safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!ok) {
        if (status === 423) setError(data.message);
        else if (status === 403) {
          setError(data.message);
        } else throw new Error(data.message || t.loginFailed);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(t.loginSuccessRedirect);
      setTimeout(() => {
        if (data.user.isAdmin) navigate('/admin/dashboard');
        else navigate('/courses');
      }, 1500);
    } catch (err) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setError(t.tooManyAttempts);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <FaChartLine />, text: t.trackProgress },
    { icon: <FaBook />, text: t.accessAllCourses },
    { icon: <FaDownload />, text: t.downloadResources },
    { icon: <FaVideo />, text: t.joinLiveSessions },
    { icon: <FaCertificate />, text: t.getCertificates },
    { icon: <FaUsers />, text: t.communityAccess }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col lg:flex-row">
      {/* Left side - benefits & info */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8 lg:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xl">NDS</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">NDS Trading</h1>
              <p className="text-blue-200 text-sm">Opportunity Hub Partnership</p>
            </div>
          </div>
          {isDevelopment && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-6">
              <FaExclamationTriangle className="mr-1" /> {t.developmentMode} • {t.autoApproveAvailable}
            </span>
          )}
          <h2 className="text-4xl font-bold mb-6">{t.secureLogin}</h2>
          <p className="text-xl text-blue-200 mb-10">{t.accessDashboard}</p>
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4">{t.secureAuthentication}</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-3" />{t.usernamePasswordProtected}
              </div>
              <div className="flex items-center">
                <FaClock className="text-yellow-400 mr-3" />{t.adminApprovalRequired}
              </div>
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 mr-3" />{t.accountLockAfterFive}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">{t.memberBenefits}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center bg-white bg-opacity-10 p-4 rounded-lg">
                  <div className="text-blue-300 mr-3">{b.icon}</div>
                  <span className="font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-xl border border-white border-opacity-20">
            <h3 className="text-2xl font-bold mb-3">{t.newToNds}</h3>
            <p className="text-blue-200 mb-4">{t.createJourney}</p>
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              {t.createFreeAccount} <span className="ml-2">→</span>
            </Link>
            <p className="text-sm text-blue-300 mt-3">{t.noCard}</p>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.memberLogin}</h2>
              <p className="text-gray-600">{t.useUsernamePassword}</p>
              <div className="mt-2 text-sm text-yellow-600 flex items-center justify-center">
               
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium flex items-center">
                  <FaExclamationTriangle className="mr-2" />{error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm font-medium flex items-center">
                  <FaCheckCircle className="mr-2" />{success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">{t.usernameOrEmail}</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t.enterUsernameOrEmail}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">{t.password}</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t.enterPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t.minimumSix}</p>
                {loginAttempts > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded">
                    <p className="text-sm text-red-600">
                      {t.failedAttempts}: {loginAttempts}
                      {loginAttempts >= 3 && (
                        <span className="block mt-1">
                          {t.warning}: {5 - loginAttempts} {t.attemptsRemaining}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
                >
                  {loading ? t.signingIn : t.login}
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  {t.noAccount}{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                    {t.registerNow}
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600 space-y-2">
              <p className="flex items-center">
               
              </p>
              <p className="flex items-center">
              
              </p>
              <p>
                <span className="font-medium"></span> 
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-6">
            <Link to="/courses" className="text-gray-600 hover:text-blue-600 text-sm">{t.courses}</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm">{t.contact}</Link>
            <Link to="/register" className="text-gray-600 hover:text-blue-600 text-sm">{t.register}</Link>
            <Link to="/admin/login" className="text-gray-600 hover:text-blue-600 text-sm">{t.admin}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
