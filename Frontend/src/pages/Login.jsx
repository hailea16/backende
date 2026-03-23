import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeSlash } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  english: {
    welcomeBack: 'Welcome Back',
    subtitle: 'Login to your NDS Trading Hub account',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loggingIn: 'Logging in...',
    loginToAccount: 'Login to Account',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    terms: 'By logging in, you agree to our Terms of Service and Privacy Policy',
    demoAccounts: 'Demo Accounts',
    demoUsername: 'Username:',
    demoPassword: 'Password:',
    demoNote: 'Use these credentials for testing purposes',
    errorFillAll: 'Please fill in all fields',
    errorInvalid: 'Invalid username or password',
    errorGeneric: 'An error occurred. Please try again.',
    language: 'Language',
    changeLanguage: 'Change Language'
  },
  amharic: {
    welcomeBack: 'እንኳን ደህና መጡ',
    subtitle: 'ወደ NDS Trading Hub መለያዎ ይግቡ',
    username: 'የተጠቃሚ ስም',
    usernamePlaceholder: 'የተጠቃሚ ስምዎን ያስገቡ',
    password: 'የይለፍ ቃል',
    passwordPlaceholder: 'የይለፍ ቃልዎን ያስገቡ',
    rememberMe: 'አስታውሰኝ',
    forgotPassword: 'የይለፍ ቃል ረስተዋል?',
    loggingIn: 'በመግባት ላይ...',
    loginToAccount: 'ወደ መለያ ይግቡ',
    noAccount: 'መለያ የለዎትም?',
    registerHere: 'እዚህ ይመዝገቡ',
    terms: 'በመግባት የአገልግሎት ውሎቻችንን እና የግላዊነት ፖሊሲን ይስማማሉ',
    demoAccounts: 'የሙከራ መለያዎች',
    demoUsername: 'የተጠቃሚ ስም:',
    demoPassword: 'የይለፍ ቃል:',
    demoNote: 'እነዚህን መረጃዎች ለሙከራ ይጠቀሙ',
    errorFillAll: 'እባክዎ ሁሉንም መስኮች ይሙሉ',
    errorInvalid: 'የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም',
    errorGeneric: 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    language: 'ቋንቋ',
    changeLanguage: 'ቋንቋ ቀይር'
  },
  somali: {
    welcomeBack: 'Ku Soo Noqo',
    subtitle: 'Gal akoonkaaga NDS Trading Hub',
    username: 'Magaca isticmaalaha',
    usernamePlaceholder: 'Geli magaca isticmaalaha',
    password: 'Furaha sirta',
    passwordPlaceholder: 'Geli furaha sirta',
    rememberMe: 'I xasuuso',
    forgotPassword: 'Ma ilowday furaha sirta?',
    loggingIn: 'Waa la galayaa...',
    loginToAccount: 'Gal Akoonka',
    noAccount: 'Akoon ma lihid?',
    registerHere: 'Halkan iska diiwaangeli',
    terms: 'Markaad gasho, waxaad ogolaatay Shuruudaha Adeegga iyo Siyaasadda Asturnaanta',
    demoAccounts: 'Akoonada Tijaabada',
    demoUsername: 'Magaca isticmaalaha:',
    demoPassword: 'Furaha sirta:',
    demoNote: 'U isticmaal xogtan ujeeddooyin tijaabo ah',
    errorFillAll: 'Fadlan buuxi dhammaan meelaha',
    errorInvalid: 'Magaca isticmaalaha ama furaha sirta waa khalad',
    errorGeneric: 'Cilad ayaa dhacday. Fadlan mar kale isku day.',
    language: 'Luuqad',
    changeLanguage: 'Beddel Luuqadda'
  }
};

const languageMeta = {
  english: { label: 'English', flag: '🇬🇧' },
  amharic: { label: 'Amharic (አማርኛ)', flag: '🇪🇹' },
  somali: { label: 'Somali', flag: '🇸🇴' }
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { language, cycleLanguage } = useLanguage();
  const t = translations[language];
  const activeLanguage = languageMeta[language];

  const handleLanguageChange = () => {
    cycleLanguage();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError(t.errorFillAll);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        const loggedInUser = result.user || JSON.parse(localStorage.getItem('user') || 'null');
        if (loggedInUser?.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/courses');
        }
      } else {
        setError(t.errorInvalid);
      }
    } catch (error) {
      setError(t.errorGeneric);
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center relative">
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-2">
          <button
            type="button"
            onClick={handleLanguageChange}
            className="text-sm bg-blue-600 text-white border border-blue-600 rounded-md px-3 py-1 inline-flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <span>{activeLanguage.flag}</span>
            <span>{t.changeLanguage}: {activeLanguage.label}</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.welcomeBack}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 flex items-center">
                <User className="mr-2 text-gray-400" />
                {t.username}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder={t.usernamePlaceholder}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 flex items-center">
                <Lock className="mr-2 text-gray-400" />
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlash /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-nds-blue focus:ring-nds-blue" />
                <span className="ml-2 text-gray-600">{t.rememberMe}</span>
              </label>
              <Link to="/contact" className="text-nds-blue hover:text-blue-800 text-sm">
                {t.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.loggingIn}
                </span>
              ) : (
                t.loginToAccount
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                {t.noAccount}{' '}
                <Link to="/register" className="text-nds-blue hover:text-blue-800 font-semibold">
                  {t.registerHere}
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              {t.terms}
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 card bg-blue-50">
          <h4 className="font-semibold text-nds-blue mb-3">{t.demoAccounts}</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">{t.demoUsername}</span> student1</p>
            <p><span className="font-medium">{t.demoPassword}</span> password123</p>
            <p className="text-gray-600 text-xs mt-2">{t.demoNote}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
