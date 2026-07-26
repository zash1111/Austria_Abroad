import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useTripData from '@/hooks/useTripData';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import TripSidebar from '@/components/calendar/TripSidebar';
import EventFormDialog from '@/components/calendar/EventFormDialog';

export default function CalendarPage() {
  const { trips, events, loading, getTripTotal, getEventsForTrip } = useTripData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);

  React.useEffect(() => {
    if (trips.length > 0 && selectedTrips.length === 0) {
      setSelectedTrips(trips.map(t => t.id));
    }
  }, [trips]);

  const toggleTrip = (id) => {
    setSelectedTrips(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDayClick = (dateStr) => {
    setClickedDate(dateStr);
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (ev) => {
    setEditEvent(ev);
    setClickedDate(null);
    setShowEventForm(true);
  };

  const handleToday = () => setCurrentDate(new Date());

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sidebar = (
    <TripSidebar
      trips={trips}
      getTripTotal={getTripTotal}
      selectedTrips={selectedTrips}
      onToggleTrip={toggleTrip}
      getEventsForTrip={getEventsForTrip}
    />
  );

  return (
    <div className="h-full p-3 md:p-6">
      <div className="h-full max-w-7xl mx-auto bg-card rounded-3xl shadow-soft-lg border border-border/60 overflow-hidden flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-64 border-r border-border/40 flex-col shrink-0">
          {sidebar}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 gap-2">
            <div className="flex items-center gap-2">
              {/* Mobile sidebar trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-full">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  {sidebar}
                </SheetContent>
              </Sheet>

              <Button variant="outline" size="sm" className="rounded-full" onClick={handleToday}>Today</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <h1 className="font-heading font-bold text-lg">
                {format(currentDate, 'MMMM yyyy')}
              </h1>
            </div>

            <Button size="sm" className="rounded-full" onClick={() => { setEditEvent(null); setClickedDate(format(new Date(), 'yyyy-MM-dd')); setShowEventForm(true); }} disabled={trips.length === 0}>
              <Plus className="w-4 h-4 mr-1" /> Event
            </Button>
          </div>

          {/* Calendar */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            <CalendarGrid
              currentDate={currentDate}
              events={events}
              trips={trips}
              selectedTrips={selectedTrips}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </div>

      <EventFormDialog
        open={showEventForm}
        onOpenChange={setShowEventForm}
        event={editEvent}
        trips={trips}
        defaultDate={clickedDate}
        defaultTripId={selectedTrips[0]}
      />
    </div>
  );
}