import { describe, it, expect, vi, afterEach } from 'vitest';
import { setLenis, onScroll } from './motion';

function fakeLenis() {
  const handlers = new Set();
  return {
    on: (event, cb) => {
      handlers.add(cb);
      return () => handlers.delete(cb);
    },
    emit: (scroll, velocity) => handlers.forEach((cb) => cb({ scroll, velocity })),
    count: () => handlers.size,
  };
}

afterEach(() => setLenis(null));

describe('onScroll', () => {
  it('forwards Lenis scroll and velocity, even when subscribed before Lenis exists', () => {
    const cb = vi.fn();
    const off = onScroll(cb);
    const lenis = fakeLenis();
    setLenis(lenis);
    lenis.emit(120, 8);
    expect(cb).toHaveBeenCalledWith({ scroll: 120, velocity: 8 });
    off();
    lenis.emit(10, 1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('detaches from a Lenis instance once it is replaced', () => {
    const lenis = fakeLenis();
    setLenis(lenis);
    expect(lenis.count()).toBe(1);
    setLenis(null);
    expect(lenis.count()).toBe(0);
  });

  it('falls back to native scroll without Lenis', () => {
    const cb = vi.fn();
    const off = onScroll(cb);
    window.dispatchEvent(new Event('scroll'));
    expect(cb).toHaveBeenCalledWith({ scroll: window.scrollY, velocity: 0 });
    off();
  });
});
