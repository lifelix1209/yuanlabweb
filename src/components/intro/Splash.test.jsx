import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { Splash } from './Splash';
import { toPathD } from './splashPath';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { mockMatchMedia } from '../../test/setup';

const renderSplash = (props) => render(<LanguageProvider><Splash {...props} /></LanguageProvider>);

describe('toPathD', () => {
  it('builds an SVG path from points', () => {
    expect(toPathD([[0, 0], [10.04, 5.06]])).toBe('M0.0,0.0 L10.0,5.1');
  });
});

describe('Splash', () => {
  it('completes immediately under prefers-reduced-motion', () => {
    mockMatchMedia((q) => q.includes('reduce'));
    const onRelease = vi.fn();
    const onDone = vi.fn();
    renderSplash({ onRelease, onDone });
    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    mockMatchMedia();
  });

  it('can be skipped with a click', async () => {
    mockMatchMedia();
    SVGElement.prototype.getTotalLength = () => 100;
    const onRelease = vi.fn();
    const onDone = vi.fn();
    renderSplash({ onRelease, onDone });
    await act(() => new Promise((r) => requestAnimationFrame(() => r())));
    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(onRelease).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});
