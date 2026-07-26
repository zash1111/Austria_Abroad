import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export default function useTripData() {
  const [trips, setTrips] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [t, e] = await Promise.all([
      base44.entities.Trip.list(),
      base44.entities.TripEvent.list('-date', 500),
    ]);
    setTrips(t);
    setEvents(e);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const unsub1 = base44.entities.Trip.subscribe(() => fetchAll());
    const unsub2 = base44.entities.TripEvent.subscribe(() => fetchAll());
    return () => { unsub1(); unsub2(); };
  }, [fetchAll]);

  const getEventsForTrip = useCallback((tripId) => {
    return events.filter(e => e.trip_id === tripId);
  }, [events]);

  const getTripTotal = useCallback((tripId) => {
    return events
      .filter(e => e.trip_id === tripId)
      .reduce((sum, e) => sum + (e.converted_cost || e.cost || 0), 0);
  }, [events]);

  const getEventsForDate = useCallback((dateStr) => {
    return events.filter(e => e.date === dateStr);
  }, [events]);

  return { trips, events, loading, fetchAll, getEventsForTrip, getTripTotal, getEventsForDate };
}