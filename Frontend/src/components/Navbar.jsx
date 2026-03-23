import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBars, FaTimes, FaGlobe, FaChevronDown } from 'react-icons/fa';
import logo from '../assets/nds.jpg'; 
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  english: {
    home: 'Home',
    services: 'Services',
    courses: 'Courses',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    admin: 'Admin',
    adminDashboard: 'Admin Dashboard',
    changeLanguage: 'Change Language',
    tagline: 'Opportunity Hub Partnership'
  },
  amharic: {
    home: 'መነሻ',
    services: 'አገልግሎቶች',
    courses: 'ኮርሶች',
    contact: 'አግኙን',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    admin: 'አስተዳዳሪ',
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    changeLanguage: 'ቋንቋ ቀይር',
    tagline: 'NDS የንግድ እድል ማዕከል ትብብር'
  },
  somali: {
    home: 'Bogga Hore',
    services: 'Adeegyada',
    courses: 'Koorsooyin',
    contact: 'Nala Soo Xiriir',
    login: 'Gal',
    register: 'Isdiiwaangeli',
    logout: 'Ka Bax',
    admin: 'Maamule',
    adminDashboard: 'Dashboard-ka Maamulka',
    changeLanguage: 'Beddel Luuqadda',
    tagline: 'Iskaashiga Opportunity Hub'
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.english;
  const languageLabel = {
    english: 'English',
    amharic: 'Amharic',
    somali: 'Somali'
  };
  const languageFlag = {
    english: '🇬🇧',
    amharic: '🇪🇹',
    somali: '🇸🇴'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="w-full px-0 py-3"> {/* Removed container, set px-0 */}
        <div className="flex justify-between items-center">
          {/* Logo with image */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="NDS Trading Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">NDS Trading</h1>
              <p className="text-sm text-blue-600">{t.tagline}</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600  px-4 py-3 rounded-lg">{t.home}</Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600  px-4 py-3 rounded-lg">{t.services}</Link>
            <Link to="/courses" className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-lg">{t.courses}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-lg ">{t.contact}</Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageMenu((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                title={t.changeLanguage}
              >
                <FaGlobe className="text-sm" />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">{t.changeLanguage}</div>
                  {Object.keys(languageLabel).map((langKey) => (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => {
                        setLanguage(langKey);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        language === langKey ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      <span>{languageFlag[langKey]} {languageLabel[langKey]}</span>
                      {language === langKey && <FaChevronDown className="text-xs" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {user?.isAdmin && (
                  <Link to="/admin/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    {t.admin}
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary">
                  {t.logout}
                </button>
                <FaUser className="text-blue-600" />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">{t.login}</Link>
                <Link to="/register" className="btn-primary">{t.register}</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" onClick={() => setIsOpen(false)}>{t.home}</Link>
              <Link to="/services" onClick={() => setIsOpen(false)}>{t.services}</Link>
              <Link to="/courses" onClick={() => setIsOpen(false)}>{t.courses}</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)}>{t.contact}</Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguageMenu((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                  title={t.changeLanguage}
                >
                  <FaGlobe className="text-sm" />
                </button>
                {showLanguageMenu && (
                  <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">{t.changeLanguage}</div>
                    {Object.keys(languageLabel).map((langKey) => (
                      <button
                        key={langKey}
                        type="button"
                        onClick={() => {
                          setLanguage(langKey);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          language === langKey ? 'text-blue-700 bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        {languageFlag[langKey]} {languageLabel[langKey]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isLoggedIn ? (
                <>
                  {user?.isAdmin && <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>{t.adminDashboard}</Link>}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }}>{t.logout}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>{t.login}</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>{t.register}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
