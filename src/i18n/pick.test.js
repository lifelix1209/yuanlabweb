import { describe, it, expect } from 'vitest';
import { pick, detectLang } from './pick';

describe('pick', () => {
  const item = { name: '兰欣', nameEn: 'Xin Lan', bio: '中文简介', bioEn: '  ', tags: ['中'], tagsEn: [] };

  it('returns the Chinese field in zh mode', () => {
    expect(pick(item, 'name', 'zh')).toBe('兰欣');
  });

  it('returns the English field in en mode when present', () => {
    expect(pick(item, 'name', 'en')).toBe('Xin Lan');
  });

  it('falls back to Chinese when English is blank or an empty array', () => {
    expect(pick(item, 'bio', 'en')).toBe('中文简介');
    expect(pick(item, 'tags', 'en')).toEqual(['中']);
  });

  it('falls back to Chinese when the English field is missing', () => {
    expect(pick({ role: '博士研究生' }, 'role', 'en')).toBe('博士研究生');
  });

  it('handles a missing item', () => {
    expect(pick(undefined, 'name', 'en')).toBeUndefined();
  });
});

describe('detectLang', () => {
  it('prefers a valid stored value', () => {
    expect(detectLang('en', 'zh-CN')).toBe('en');
    expect(detectLang('zh', 'en-GB')).toBe('zh');
  });

  it('uses the browser language when nothing valid is stored', () => {
    expect(detectLang(null, 'zh-CN')).toBe('zh');
    expect(detectLang('fr', 'en-GB')).toBe('en');
    expect(detectLang(null, undefined)).toBe('en');
  });
});
