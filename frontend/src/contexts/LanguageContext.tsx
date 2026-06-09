'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'hi';

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (hi: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  toggleLang: () => {},
  t: (_hi, en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('sc_lang') as Lang | null;
    if (saved === 'hi' || saved === 'en') setLang(saved);
  }, []);

  const toggleLang = () => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('sc_lang', next);
      return next;
    });
  };

  const t = (hi: string, en: string) => lang === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
