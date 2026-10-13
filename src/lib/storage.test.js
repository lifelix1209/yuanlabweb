import { describe, it, expect, vi } from 'vitest';
import { safeStorage } from './storage';

describe('safeStorage', () => {
  it('reads and writes local and session storage', () => {
    expect(safeStorage.set('local', 'k', 'v')).toBe(true);
    expect(safeStorage.get('local', 'k')).toBe('v');
    expect(safeStorage.set('session', 'k', 's')).toBe(true);
    expect(safeStorage.get('session', 'k')).toBe('s');
  });

  it('returns null for missing keys', () => {
    expect(safeStorage.get('local', 'missing')).toBeNull();
  });

  it('degrades gracefully when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(safeStorage.get('local', 'k')).toBeNull();
    expect(safeStorage.set('session', 'k', 'v')).toBe(false);
  });
});
