import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// jsdom 未实现 matchMedia；默认「无 reduced-motion 偏好」
export function mockMatchMedia(matcher = () => false) {
  window.matchMedia = (query) => ({
    matches: matcher(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

mockMatchMedia();
