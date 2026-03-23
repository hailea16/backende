import React, { createContext, useContext, useMemo, useState } from 'react';

const LANGUAGE_ORDER = ['english', 'amharic', 'somali'];
const DEFAULT_LANGUAGE = 'english';
const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language');
    return LANGUAGE_ORDER.includes(saved) ? saved : DEFAULT_LANGUAGE;
  });

  const setLanguage = (nextLanguage) => {
    if (!LANGUAGE_ORDER.includes(nextLanguage)) return;
    setLanguageState(nextLanguage);
    localStorage.setItem('language', nextLanguage);
  };

  const cycleLanguage = () => {
    const currentIndex = LANGUAGE_ORDER.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGE_ORDER.length;
    setLanguage(LANGUAGE_ORDER[nextIndex]);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    cycleLanguage,
    languageOrder: LANGUAGE_ORDER
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      cycleLanguage: () => {},
      languageOrder: LANGUAGE_ORDER
    };
  }
  return context;
};

