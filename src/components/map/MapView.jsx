import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [48.2082, 16.3738];

function createTripIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background-color:${color};width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}

function createStartIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="background-color:#10B981;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createDestIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="background-color:#EF4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Auto-fit map bounds to show all markers or the active route
function FitBounds({ mappableEvents, routeData, route }) {
  const map = useMap();

  useEffect(() => {
    if (routeData && routeData.coordinates.length > 0) {
      const bounds = L.latLngBounds(routeData.coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (route?.start && route?.destination) {
      const bounds = L.latLngBounds([
        [route.start.latitude, route.start.longitude],
        [route.destination.latitude, route.destination.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (route?.start) {
      map.flyTo([route.start.latitude, route.start.longitude], 14, { duration: 0.8 });
    } else if (mappableEvents.length > 0) {
      const points = mappableEvents.map(e => [e.latitude, e.longitude]);
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mappableEvents, routeData, route, map]);

  return null;
}

// Fix map not filling container on initial render / layout changes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapView({ events, trips, route, routeData }) {
  const tripMap = {};
  trips.forEach(t => { tripMap[t.id] = t; });

  const mappableEvents = events.filter(e => e.latitude != null && e.longitude != null);

  // Events that aren't the current start/destination (avoid duplicate markers)
  const otherEvents = mappableEvents.filter(ev =>
    !(route?.start?.id === ev.id || route?.destination?.id === ev.id)
  );

  const routeLine = routeData?.coordinates || null;

  // Straight-line fallback when OSRM hasn't returned yet or failed
  const fallbackLine = !routeData && route?.start && route?.destination
    ? [[route.start.latitude, route.start.longitude], [route.destination.latitude, route.destination.longitude]]
    : null;

  return (
    <div style={{ position: 'relative', zIndex: 0 }} className="w-full h-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '300px', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {otherEvents.map(ev => {
          const trip = tripMap[ev.trip_id];
          const icon = createTripIcon(trip?.color || '#6D9F98');
          return (
            <Marker key={ev.id} position={[ev.latitude, ev.longitude]} icon={icon}>
              <Popup>
                <div className="space-y-0.5">
                  <strong>{ev.title}</strong>
                  {ev.location && <div className="text-gray-600">{ev.location}</div>}
                  {ev.address && <div className="text-gray-500 text-xs">{ev.address}</div>}
                  <div className="text-xs text-gray-500">{ev.date}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#6D9F98', weight: 4, opacity: 0.85 }}
          />
        )}

        {fallbackLine && (
          <Polyline
            positions={fallbackLine}
            pathOptions={{ color: '#6D9F98', weight: 3, dashArray: '8 8' }}
          />
        )}

        {route?.start && (
          <Marker position={[route.start.latitude, route.start.longitude]} icon={createStartIcon()}>
            <Popup>
              <div className="space-y-0.5">
                <strong>Start: {route.start.title}</strong>
                {route.start.location && <div className="text-xs text-gray-500">{route.start.location}</div>}
              </div>
            </Popup>
          </Marker>
        )}
        {route?.destination && (
          <Marker position={[route.destination.latitude, route.destination.longitude]} icon={createDestIcon()}>
            <Popup>
              <div className="space-y-0.5">
                <strong>Destination: {route.destination.title}</strong>
                {route.destination.location && <div className="text-xs text-gray-500">{route.destination.location}</div>}
              </div>
            </Popup>
          </Marker>
        )}

        <FitBounds mappableEvents={mappableEvents} routeData={routeData} route={route} />
        <MapResizer />
      </MapContainer>
    </div>
  );
}