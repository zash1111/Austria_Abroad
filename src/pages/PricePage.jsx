import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useTripData from '@/hooks/useTripData';
import EventFormDialog from '@/components/calendar/EventFormDialog';
import { formatMoney, CATEGORIES } from '@/lib/currencies';
import { format } from 'date-fns';

const catMap = {};
CATEGORIES.forEach(c => { catMap[c.value] = c; });

export default function PricePage() {
  const { trips, events, loading, getTripTotal, getEventsForTrip } = useTripData();
  const [expanded, setExpanded] = useState({});
  const [editEvent, setEditEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (ev) => {
    await base44.entities.TripEvent.delete(ev.id);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grandTotal = trips.reduce((sum, t) => sum + getTripTotal(t.id), 0);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl">Price Breakdown</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All your trips and expenses at a glance</p>
          </div>
          <div className="text-right bg-card rounded-2xl px-4 py-2 shadow-soft border border-border/60">
            <p className="text-xs text-muted-foreground">Grand Total</p>
            <p className="font-heading font-bold text-2xl text-primary">${grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {trips.length === 0 && (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-3xl border border-border/60 shadow-soft">
            <p className="text-lg font-medium">No trips yet</p>
            <p className="text-sm mt-1">Create a trip on the Calendar tab to get started.</p>
          </div>
        )}

        {/* Trip list */}
        {trips.map(trip => {
          const tripEvents = getEventsForTrip(trip.id).sort((a, b) => a.date.localeCompare(b.date));
          const total = getTripTotal(trip.id);
          const isExpanded = expanded[trip.id];

          return (
            <div key={trip.id} className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-soft transition-shadow hover:shadow-soft-lg">
              {/* Trip header */}
              <button
                onClick={() => toggle(trip.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
              >
                {isExpanded
                  ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                }
                <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: trip.color }} />
                <span className="flex-1 font-medium">{trip.name}</span>
                <span className="text-xs text-muted-foreground mr-2">{tripEvents.length} event{tripEvents.length !== 1 ? 's' : ''}</span>
                <span className="font-mono font-semibold text-sm">
                  {formatMoney(total, trip.default_currency || 'USD')}
                </span>
              </button>

              {/* Events list */}
              {isExpanded && (
                <div className="border-t border-border/40 divide-y divide-border/40">
                  {tripEvents.length === 0 && (
                    <p className="px-4 py-6 text-sm text-muted-foreground text-center">No events in this trip yet.</p>
                  )}
                  {tripEvents.map(ev => {
                    const cat = catMap[ev.category] || catMap['other'];
                    return (
                      <div key={ev.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ev.date + 'T00:00:00'), 'MMM d, yyyy')}
                            {ev.location && ` · ${ev.location}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-medium">
                            {formatMoney(ev.cost, ev.currency)}
                          </p>
                          {ev.currency !== (trip.default_currency || 'USD') && ev.converted_cost > 0 && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              ≈ {formatMoney(ev.converted_cost, trip.default_currency || 'USD')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => { setEditEvent(ev); setShowForm(true); }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ev)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EventFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        event={editEvent}
        trips={trips}
      />
    </div>
  );
}