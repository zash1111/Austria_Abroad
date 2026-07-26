import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/currencies';
import TripFormDialog from '@/components/calendar/TripFormDialog';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TripSidebar({ trips, getTripTotal, selectedTrips, onToggleTrip, getEventsForTrip }) {
  const [showForm, setShowForm] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [deleteTrip, setDeleteTrip] = useState(null);

  const handleDelete = async () => {
    if (!deleteTrip) return;
    const tripEvents = getEventsForTrip(deleteTrip.id);
    for (const ev of tripEvents) {
      await base44.entities.TripEvent.delete(ev.id);
    }
    await base44.entities.Trip.delete(deleteTrip.id);
    setDeleteTrip(null);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="font-heading font-semibold text-sm">My Trips</h2>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => { setEditTrip(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {trips.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No trips yet. Create one to get started.</p>
          )}
          {trips.map(trip => {
            const total = getTripTotal(trip.id);
            const isSelected = selectedTrips.includes(trip.id);
            return (
              <div key={trip.id} className="rounded-xl border border-border/40 overflow-hidden">
                <div
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => onToggleTrip(trip.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 border-2 transition-all"
                    style={{
                      backgroundColor: isSelected ? trip.color : 'transparent',
                      borderColor: trip.color
                    }}
                  />
                  <span className="flex-1 text-sm font-medium truncate">{trip.name}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {formatMoney(total, trip.default_currency || 'USD')}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditTrip(trip); setShowForm(true); }}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTrip(trip); }}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TripFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        trip={editTrip}
      />

      <AlertDialog open={!!deleteTrip} onOpenChange={(o) => !o && setDeleteTrip(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTrip?.name}" and all its events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}