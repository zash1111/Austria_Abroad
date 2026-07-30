import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TRANSPORT_METHODS,
  DEFAULT_TRANSPORT,
  fetchRoute,
  geocodeAddress,
  haversineDistance,
  formatDuration,
  formatDistance,
} from '../routing';

describe('TRANSPORT_METHODS', () => {
  it('has 7 transport options', () => {
    expect(TRANSPORT_METHODS).toHaveLength(7);
  });

  it('includes driving, walking, and cycling', () => {
    const values = TRANSPORT_METHODS.map(t => t.value);
    expect(values).toEqual(
      expect.arrayContaining(['driving', 'walking', 'cycling', 'bus', 'tram', 'train', 'ferry'])
    );
  });

  it('every method has value, label, icon, profile, and costPerKm', () => {
    TRANSPORT_METHODS.forEach(t => {
      expect(t.value).toBeTypeOf('string');
      expect(t.label).toBeTypeOf('string');
      expect(t.icon).toBeTypeOf('string');
      expect(t.profile).toBeTypeOf('string');
      expect(t.costPerKm).toBeTypeOf('number');
    });
  });

  it('walking has zero cost per km', () => {
    const walk = TRANSPORT_METHODS.find(t => t.value === 'walking');
    expect(walk.costPerKm).toBe(0);
  });

  it('all costs are non-negative', () => {
    TRANSPORT_METHODS.forEach(t => {
      expect(t.costPerKm).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('DEFAULT_TRANSPORT', () => {
  it('defaults to driving', () => {
    expect(DEFAULT_TRANSPORT).toBe('driving');
  });
});

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(48.2082, 16.3738, 48.2082, 16.3738)).toBeCloseTo(0, 5);
  });

  it('calculates distance between Vienna and Paris correctly (~1000 km)', () => {
    // Vienna: 48.2082, 16.3738 | Paris: 48.8566, 2.3522
    const dist = haversineDistance(48.2082, 16.3738, 48.8566, 2.3522);
    expect(dist).toBeGreaterThan(1000);
    expect(dist).toBeLessThan(1100);
  });

  it('is symmetric (distance A→B equals B→A)', () => {
    const d1 = haversineDistance(40.7128, -74.0060, 51.5074, -0.1278); // NYC → London
    const d2 = haversineDistance(51.5074, -0.1278, 40.7128, -74.0060); // London → NYC
    expect(d1).toBeCloseTo(d2, 5);
  });

  it('returns a positive number for different points', () => {
    const dist = haversineDistance(0, 0, 0, 1);
    expect(dist).toBeGreaterThan(0);
  });

  it('handles negative coordinates (southern/western hemisphere)', () => {
    const dist = haversineDistance(-33.8688, 151.2093, -34.6037, -58.3816); // Sydney → Buenos Aires
    expect(dist).toBeGreaterThan(11000);
    expect(dist).toBeLessThan(12000);
  });
});

describe('formatDuration', () => {
  it('formats seconds under 60 as minutes', () => {
    expect(formatDuration(1500)).toBe('25 min');
  });

  it('formats exactly 60 minutes as 1h 0m', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });

  it('formats hours and remaining minutes', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(9000)).toBe('2h 30m');
  });

  it('rounds seconds to nearest minute', () => {
    expect(formatDuration(100)).toBe('2 min'); // 1.67 min → 2 min
  });

  it('handles 0 seconds', () => {
    expect(formatDuration(0)).toBe('0 min');
  });
});

describe('formatDistance', () => {
  it('formats meters under 1000 as meters', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('formats 1000 meters as 1.0 km', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
  });

  it('formats large distances in km with one decimal', () => {
    expect(formatDistance(15000)).toBe('15.0 km');
    expect(formatDistance(52500)).toBe('52.5 km');
  });

  it('rounds meters to nearest integer', () => {
    expect(formatDistance(549)).toBe('549 m');
  });
});

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns latitude, longitude, and display_name on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: '48.858844', lon: '2.294351', display_name: 'Eiffel Tower, Paris, France' },
      ],
    });

    const result = await geocodeAddress('Eiffel Tower, Paris');
    expect(result).toEqual({
      latitude: 48.858844,
      longitude: 2.294351,
      display_name: 'Eiffel Tower, Paris, France',
    });
  });

  it('returns null when no results found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const result = await geocodeAddress('nonexistentplace12345');
    expect(result).toBeNull();
  });

  it('throws when the request fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(geocodeAddress('Paris')).rejects.toThrow('Geocoding failed');
  });

  it('encodes the address in the URL', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: '1', lon: '1', display_name: 'Test' }],
    });

    await geocodeAddress('New York, NY & Co.');
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain(encodeURIComponent('New York, NY & Co.'));
  });
});

describe('fetchRoute', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns coordinates, distance, and duration on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            distance: 5000,
            duration: 600,
            geometry: {
              coordinates: [
                [16.3738, 48.2082],
                [16.4000, 48.2200],
              ],
            },
          },
        ],
      }),
    });

    const result = await fetchRoute(
      { latitude: 48.2082, longitude: 16.3738 },
      { latitude: 48.2200, longitude: 16.4000 },
      'driving'
    );

    expect(result.distance).toBe(5000);
    expect(result.duration).toBe(600);
    expect(result.coordinates).toEqual([
      [48.2082, 16.3738],
      [48.2200, 16.4000],
    ]);
  });

  it('converts GeoJSON [lng, lat] to Leaflet [lat, lng]', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            distance: 100,
            duration: 10,
            geometry: { coordinates: [[10, 20], [30, 40]] },
          },
        ],
      }),
    });

    const result = await fetchRoute(
      { latitude: 20, longitude: 10 },
      { latitude: 40, longitude: 30 },
      'driving'
    );
    expect(result.coordinates[0]).toEqual([20, 10]); // [lat, lng]
  });

  it('throws when route is not found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    });

    await expect(
      fetchRoute(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0 },
        'driving'
      )
    ).rejects.toThrow('No route found');
  });

  it('throws when the HTTP request fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(
      fetchRoute(
        { latitude: 0, longitude: 0 },
        { latitude: 1, longitude: 1 },
        'driving'
      )
    ).rejects.toThrow('Route request failed');
  });

  it('uses the correct profile based on transport method', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{ distance: 0, duration: 0, geometry: { coordinates: [] } }],
      }),
    });

    await fetchRoute(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 1 },
      'walking'
    );

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('/foot/');
  });
});
