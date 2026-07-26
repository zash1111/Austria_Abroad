import React, { useState } from 'react';
import { Navigation, MapPin, X, Route as RouteIcon, Search, Loader2, Plus, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  TRANSPORT_METHODS,
  geocodeAddress,
  haversineDistance,
  formatDuration,
  formatDistance,
} from '@/lib/routing';

export default function TransitPanel({ events, trips, route, setRoute, routeData, fetchingRoute }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchTarget, setSearchTarget] = useState('start');
  const [saveTripId, setSaveTripId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [geocodingStart, setGeocodingStart] = useState(false);
  const [geocodingDest, setGeocodingDest] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  // Events usable for routing — have coordinates OR an address/location to geocode
  const mappableEvents = events.filter(e =>
    (e.latitude != null && e.longitude != null) || e.address || e.location
  );
  const tripMap = {};
  trips.forEach(t => { tripMap[t.id] = t; });

  const transport = TRANSPORT_METHODS.find(t => t.value === route?.transport);

  const geocodeIfNeeded = async (ev, setGeocoding, setKey) => {
    const query = ev.address || ev.location;
    if (!query) return;
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await geocodeAddress(query);
      if (result) {
        const point = { ...ev, latitude: result.latitude, longitude: result.longitude };
        setRoute(prev => ({ ...prev, [setKey]: point }));
        // Save coordinates back to the event so it shows on the map (non-blocking)
        base44.entities.TripEvent.update(ev.id, {
          latitude: result.latitude,
          longitude: result.longitude,
        }).catch(() => {});
      } else {
        setGeocodeError(`Couldn't find "${query}" on the map.`);
      }
    } catch {
      setGeocodeError('Location lookup failed. Try again.');
    }
    setGeocoding(false);
  };

  const handleSelectStart = (id) => {
    const ev = mappableEvents.find(e => e.id === id);
    if (!ev) return;
    // Set immediately so the user sees their selection right away
    setRoute(prev => ({ ...prev, start: ev }));
    // Geocode in the background if coordinates are missing
    if (ev.latitude == null || ev.longitude == null) {
      geocodeIfNeeded(ev, setGeocodingStart, 'start');
    }
  };

  const handleSelectDest = (id) => {
    const ev = mappableEvents.find(e => e.id === id);
    if (!ev) return;
    setRoute(prev => ({ ...prev, destination: ev }));
    if (ev.latitude == null || ev.longitude == null) {
      geocodeIfNeeded(ev, setGeocodingDest, 'destination');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        const location = {
          id: `search_${Date.now()}`,
          title: result.display_name.split(',').slice(0, 2).join(',').trim(),
          latitude: result.latitude,
          longitude: result.longitude,
          location: result.display_name,
          currency: 'USD',
        };
        if (searchTarget === 'start') {
          setRoute(prev => ({ ...prev, start: location }));
        } else {
          setRoute(prev => ({ ...prev, destination: location }));
        }
      } else {
        setSearchError('Location not found. Try a different search.');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    }
    setSearching(false);
  };

  const clearRoute = () => {
    setRoute({ start: null, destination: null, transport: route.transport });
    setSearchError(null);
    setSaved(false);
  };

  const handleSaveTransport = async () => {
    if (!route.start || !route.destination || !saveTripId) return;
    setSaving(true);
    setSaved(false);
    const distanceKm = routeData
      ? routeData.distance / 1000
      : haversineDistance(route.start.latitude, route.start.longitude, route.destination.latitude, route.destination.longitude);
    const cost = distanceKm * (transport?.costPerKm || 0);
    const trip = trips.find(t => t.id === saveTripId);

    await base44.entities.TripEvent.create({
      title: `${transport?.icon} ${transport?.label}: ${route.start.title} → ${route.destination.title}`,
      trip_id: saveTripId,
      date: new Date().toISOString().split('T')[0],
      cost: Number(cost.toFixed(2)),
      currency: trip?.default_currency || 'USD',
      converted_cost: Number(cost.toFixed(2)),
      category: 'transport',
      location: route.start.title,
      latitude: route.start.latitude,
      longitude: route.start.longitude,
    });
    setSaving(false);
    setSaved(true);
  };

  // Distance: use OSRM if available, otherwise Haversine fallback
  const distanceMeters = routeData?.distance ?? (route?.start && route?.destination
    ? haversineDistance(route.start.latitude, route.start.longitude, route.destination.latitude, route.destination.longitude) * 1000
    : null);

  const duration = routeData?.duration ?? null;
  const estimatedCost = distanceMeters != null
    ? (distanceMeters / 1000 * (transport?.costPerKm || 0)).toFixed(2)
    : null;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" /> Transit Route
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Plan routes between events or any location</p>
      </div>

      {mappableEvents.length < 2 && (
        <div className="p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground text-center">
          Add an address or location to events on the Calendar tab, or search below to plan a route.
        </div>
      )}

      {geocodeError && (
        <p className="text-xs text-destructive text-center px-2">{geocodeError}</p>
      )}

      {/* Location search */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Search className="w-3 h-3" /> Search Location
        </label>
        <div className="flex gap-1">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter address or place..."
            className="rounded-xl text-sm h-9"
          />
          <Button size="sm" className="rounded-xl shrink-0 px-3" onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSearchTarget('start')}
            className={`flex-1 text-[10px] py-1 rounded-lg font-medium transition-all ${searchTarget === 'start' ? 'bg-green-500 text-white' : 'bg-muted/50 text-muted-foreground'}`}
          >
            → Set as Start
          </button>
          <button
            onClick={() => setSearchTarget('destination')}
            className={`flex-1 text-[10px] py-1 rounded-lg font-medium transition-all ${searchTarget === 'destination' ? 'bg-red-500 text-white' : 'bg-muted/50 text-muted-foreground'}`}
          >
            → Set as Destination
          </button>
        </div>
        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
      </div>

      {/* Start point */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 text-green-500" /> Start Point
        </label>
        {route?.start ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-green-500/10 border border-green-500/20">
            {geocodingStart
              ? <Loader2 className="w-3.5 h-3.5 text-green-500 shrink-0 animate-spin" />
              : <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />}
            <span className="text-xs font-medium truncate flex-1">{route.start.title}</span>
            <button onClick={() => setRoute(prev => ({ ...prev, start: null }))} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Select value={route?.start?.id || ''} onValueChange={handleSelectStart} disabled={mappableEvents.length === 0}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select from events" /></SelectTrigger>
            <SelectContent>
              {mappableEvents.map(ev => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.latitude != null ? '📍' : '🗺️'} {ev.title} {tripMap[ev.trip_id] && `· ${tripMap[ev.trip_id].name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-center -my-1">
        <ArrowDown className="w-3.5 h-3.5 text-muted-foreground/50" />
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> Destination
        </label>
        {route?.destination ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            {geocodingDest
              ? <Loader2 className="w-3.5 h-3.5 text-red-500 shrink-0 animate-spin" />
              : <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            <span className="text-xs font-medium truncate flex-1">{route.destination.title}</span>
            <button onClick={() => setRoute(prev => ({ ...prev, destination: null }))} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Select value={route?.destination?.id || ''} onValueChange={handleSelectDest} disabled={mappableEvents.length === 0}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select from events" /></SelectTrigger>
            <SelectContent>
              {mappableEvents.map(ev => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.latitude != null ? '📍' : '🗺️'} {ev.title} {tripMap[ev.trip_id] && `· ${tripMap[ev.trip_id].name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Transport method */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Transport Method</label>
        <div className="grid grid-cols-4 gap-1">
          {TRANSPORT_METHODS.map(t => {
            const active = route?.transport === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setRoute(prev => ({ ...prev, transport: t.value }))}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all
                  ${active ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-muted/50 hover:bg-muted text-muted-foreground'}`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Route summary */}
      {distanceMeters != null && (
        <div className="p-3 rounded-xl bg-muted/50 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <RouteIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">Route Summary</span>
            {fetchingRoute && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-mono font-medium">{formatDistance(distanceMeters)}</span>
          </div>
          {duration != null && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Travel Time</span>
              <span className="font-mono font-medium">{formatDuration(duration)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Transport</span>
            <span className="font-medium">{transport?.icon} {transport?.label}</span>
          </div>
          {estimatedCost && Number(estimatedCost) > 0 && (
            <div className="flex justify-between text-xs pt-1 border-t border-border/40 mt-1">
              <span className="text-muted-foreground">Est. Cost</span>
              <span className="font-mono font-semibold text-primary">~{estimatedCost} {route?.start?.currency || 'USD'}</span>
            </div>
          )}
        </div>
      )}

      {/* Save as transport expense */}
      {route?.start && route?.destination && distanceMeters != null && trips.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add to Trip Budget
          </label>
          <Select value={saveTripId} onValueChange={(v) => { setSaveTripId(v); setSaved(false); }}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select trip" /></SelectTrigger>
            <SelectContent>
              {trips.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="w-full rounded-full"
            onClick={handleSaveTransport}
            disabled={!saveTripId || saving || saved}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✓ Added to Budget' : 'Add to Budget'}
          </Button>
        </div>
      )}

      {/* Clear button */}
      {(route?.start || route?.destination) && (
        <Button variant="outline" size="sm" className="w-full rounded-full" onClick={clearRoute}>
          <X className="w-3.5 h-3.5 mr-1" /> Clear Route
        </Button>
      )}
    </div>
  );
}