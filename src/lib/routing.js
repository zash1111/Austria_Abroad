// Transport methods with OSRM routing profiles and cost estimates per km
export const TRANSPORT_METHODS = [
  { value: 'driving', label: 'Taxi', icon: '🚕', profile: 'driving', costPerKm: 2.0 },
  { value: 'bus', label: 'Bus', icon: '🚌', profile: 'driving', costPerKm: 1.5 },
  { value: 'tram', label: 'Tram', icon: '🚊', profile: 'driving', costPerKm: 1.5 },
  { value: 'train', label: 'Train', icon: '🚆', profile: 'driving', costPerKm: 2.5 },
  { value: 'walking', label: 'Walk', icon: '🚶', profile: 'foot', costPerKm: 0 },
  { value: 'cycling', label: 'Bike', icon: '🚲', profile: 'bike', costPerKm: 0.5 },
  { value: 'ferry', label: 'Ferry', icon: '⛴️', profile: 'driving', costPerKm: 3.0 },
];

export const DEFAULT_TRANSPORT = 'driving';

// Fetch an actual road route from OSRM (free, no API key)
export async function fetchRoute(start, dest, transportValue) {
  const transport = TRANSPORT_METHODS.find(t => t.value === transportValue) || TRANSPORT_METHODS[0];
  const profile = transport.profile;

  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${dest.longitude},${dest.latitude}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Route request failed');
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    coordinates,
    distance: route.distance, // meters
    duration: route.duration,   // seconds
  };
}

// Geocode an address to lat/lng using Nominatim (free, no API key)
export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (data.length === 0) return null;
  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  };
}

// Haversine distance in km (fallback when OSRM is unavailable)
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}