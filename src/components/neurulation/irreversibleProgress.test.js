import { describe, it, expect } from 'vitest';
import { advance, shouldReset } from './irreversibleProgress';

describe('advance', () => {
  it('only moves forward', () => {
    expect(advance(0, 0.4)).toBe(0.4);
    expect(advance(0.4, 0.2)).toBe(0.4);
    expect(advance(0.4, 0.7)).toBe(0.7);
  });

  it('clamps incoming progress to [0, 1]', () => {
    expect(advance(0, 1.5)).toBe(1);
    expect(advance(0, -1)).toBe(0);
  });
});

describe('shouldReset', () => {
  it('resets only near the top of the page', () => {
    expect(shouldReset(0)).toBe(true);
    expect(shouldReset(1.5)).toBe(true);
    expect(shouldReset(40)).toBe(false);
    expect(shouldReset(40, 50)).toBe(true);
  });
});
