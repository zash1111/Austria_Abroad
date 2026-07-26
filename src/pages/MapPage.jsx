import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useTripData from '@/hooks/useTripData';
import MapView from '@/components/map/MapView';
import TransitPanel from '@/components/map/TransitPanel';
import { fetchRoute, DEFAULT_TRANSPORT } from '@/lib/routing';

export default function MapPage() {
  const { trips, events, loading } = useTripData();
  const [route, setRoute] = useState({ start: null, destination: null, transport: DEFAULT_TRANSPORT });
  const [routeData, setRouteData] = useState(null);
  const [fetchingRoute, setFetchingRoute] = useState(false);

  useEffect(() => {
    const hasCoords = route.start && route.destination &&
      route.start.latitude != null && route.destination.latitude != null;

    if (!hasCoords) {
      setRouteData(null);
      return;
    }

    let cancelled = false;
    setFetchingRoute(true);

    fetchRoute(route.start, route.destination, route.transport)
      .then(data => {
        if (!cancelled) {
          setRouteData(data);
          setFetchingRoute(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteData(null);
          setFetchingRoute(false);
        }
      });

    return () => { cancelled = true; };
  }, [route.start, route.destination, route.transport]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full p-3 md:p-6">
      <div className="h-full max-w-7xl mx-auto bg-card rounded-3xl shadow-soft-lg border border-border/60 overflow-hidden flex flex-col lg:flex-row">
        {/* Transit Panel — sidebar on desktop, top section on mobile */}
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-border/40 shrink-0 overflow-y-auto max-h-[55vh] lg:max-h-none">
          <TransitPanel
            events={events}
            trips={trips}
            route={route}
            setRoute={setRoute}
            routeData={routeData}
            fetchingRoute={fetchingRoute}
          />
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
          <MapView events={events} trips={trips} route={route} routeData={routeData} />
        </div>
      </div>
    </div>
  );
}