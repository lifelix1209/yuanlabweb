import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { strings } from './strings';
import { pick, detectLang } from './pick';
import { safeStorage } from '../lib/storage';

const STORAGE_KEY = 'yuanlab.lang';
const LanguageContext = createContext(null);

function initialLang() {
  const nav = typeof navigator !== 'undefined' ? navigator.language : undefined;
  return detectLang(safeStorage.get('local', STORAGE_KEY), nav);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    safeStorage.set('local', STORAGE_KEY, lang);
  }, [lang]);

  // 切换时对页面做一次 150ms 的快速淡入，掩盖文字重排
  const toggle = useCallback(() => {
    const root = document.getElementById('root');
    root?.classList.remove('lang-fade');
    void root?.offsetWidth;
    root?.classList.add('lang-fade');
    setLang((l) => (l === 'zh' ? 'en' : 'zh'));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggle,
      t: strings[lang],
      pick: (item, field) => pick(item, field, lang),
    }),
    [lang, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
