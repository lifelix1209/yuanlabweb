import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLang } from './LanguageContext';

function Probe() {
  const { lang, t, pick, toggle } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="nav">{t.nav.research}</span>
      <span data-testid="name">{pick({ name: '兰欣', nameEn: 'Xin Lan' }, 'name')}</span>
      <button type="button" onClick={toggle}>toggle</button>
    </div>
  );
}

const setNavigatorLang = (value) => vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(value);

describe('LanguageProvider', () => {
  it('defaults to Chinese for zh browsers', () => {
    setNavigatorLang('zh-CN');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang')).toHaveTextContent('zh');
    expect(screen.getByTestId('nav')).toHaveTextContent('研究方向');
    expect(document.documentElement.lang).toBe('zh-CN');
  });

  it('toggles language, updates strings and data, and persists the choice', () => {
    setNavigatorLang('zh-CN');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('nav')).toHaveTextContent('Research');
    expect(screen.getByTestId('name')).toHaveTextContent('Xin Lan');
    expect(window.localStorage.getItem('yuanlab.lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('restores a stored preference over the browser language', () => {
    setNavigatorLang('zh-CN');
    window.localStorage.setItem('yuanlab.lang', 'en');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('still works when storage is unavailable', () => {
    setNavigatorLang('en-GB');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('lang')).toHaveTextContent('zh');
  });

  it('throws a helpful error outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useLang must be used within LanguageProvider');
  });
});
