// 读取数据字段的当前语言版本：英文缺失时回退到中文原字段
export function pick(item, field, lang) {
  if (!item) return undefined;
  if (lang === 'en') {
    const en = item[`${field}En`];
    const hasEn = Array.isArray(en) ? en.length > 0 : typeof en === 'string' ? en.trim() !== '' : en != null;
    if (hasEn) return en;
  }
  return item[field];
}

export function detectLang(stored, navigatorLang) {
  if (stored === 'zh' || stored === 'en') return stored;
  return typeof navigatorLang === 'string' && navigatorLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
