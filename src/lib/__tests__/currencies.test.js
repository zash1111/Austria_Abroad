import { describe, it, expect } from 'vitest';
import {
  CURRENCIES,
  CATEGORIES,
  TRIP_COLORS,
  getCurrencySymbol,
  formatMoney,
} from '../currencies';

describe('CURRENCIES', () => {
  it('includes common currencies', () => {
    const codes = CURRENCIES.map(c => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('JPY');
  });

  it('every currency has code, symbol, and name', () => {
    CURRENCIES.forEach(c => {
      expect(c.code).toBeTypeOf('string');
      expect(c.code.length).toBe(3);
      expect(c.symbol).toBeTypeOf('string');
      expect(c.name).toBeTypeOf('string');
    });
  });

  it('has no duplicate currency codes', () => {
    const codes = CURRENCIES.map(c => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('CATEGORIES', () => {
  it('has 6 categories', () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it('every category has value, label, and icon', () => {
    CATEGORIES.forEach(c => {
      expect(c.value).toBeTypeOf('string');
      expect(c.label).toBeTypeOf('string');
      expect(c.icon).toBeTypeOf('string');
    });
  });

  it('has the expected categories', () => {
    const values = CATEGORIES.map(c => c.value);
    expect(values).toEqual(
      expect.arrayContaining(['food', 'transport', 'accommodation', 'activity', 'shopping', 'other'])
    );
  });
});

describe('TRIP_COLORS', () => {
  it('has at least 10 color options', () => {
    expect(TRIP_COLORS.length).toBeGreaterThanOrEqual(10);
  });

  it('all colors are valid hex codes', () => {
    TRIP_COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('has no duplicate colors', () => {
    expect(new Set(TRIP_COLORS).size).toBe(TRIP_COLORS.length);
  });
});

describe('getCurrencySymbol', () => {
  it('returns the correct symbol for a known currency', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('JPY')).toBe('¥');
  });

  it('returns the code itself for an unknown currency', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ');
  });
});

describe('formatMoney', () => {
  it('formats a positive amount with the correct symbol', () => {
    expect(formatMoney(100, 'USD')).toBe('$100.00');
    expect(formatMoney(50, 'EUR')).toBe('€50.00');
    expect(formatMoney(9.99, 'GBP')).toBe('£9.99');
  });

  it('formats zero correctly', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00');
  });

  it('defaults to USD when no currency provided', () => {
    expect(formatMoney(25)).toBe('$25.00');
  });

  it('handles null and undefined amounts', () => {
    expect(formatMoney(null, 'USD')).toBe('$0.00');
    expect(formatMoney(undefined, 'USD')).toBe('$0.00');
  });

  it('handles string numeric amounts', () => {
    expect(formatMoney('42.5', 'USD')).toBe('$42.50');
  });

  it('rounds to two decimal places', () => {
    expect(formatMoney(10.999, 'USD')).toBe('$11.00');
    expect(formatMoney(10.005, 'USD')).toBe('$10.01');
  });

  it('handles negative amounts', () => {
    expect(formatMoney(-15.5, 'USD')).toBe('$-15.50');
  });
});
