import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ currentDate, events, trips, selectedTrips, onDayClick, onEventClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const tripMap = {};
  trips.forEach(t => { tripMap[t.id] = t; });

  const filteredEvents = events.filter(e => selectedTrips.includes(e.trip_id));

  const rows = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = day;
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayEvents = filteredEvents.filter(e => e.date === dateStr);
      const inMonth = isSameMonth(d, currentDate);
      const today = isToday(d);

      week.push(
        <td
          key={dateStr}
          className={`border border-border/40 p-1 align-top cursor-pointer transition-colors hover:bg-accent/30 h-24 md:h-28
            ${!inMonth ? 'bg-muted/10' : ''}`}
          onClick={() => onDayClick(dateStr)}
        >
          <div className={`text-xs font-medium mb-0.5 w-6 h-6 flex items-center justify-center rounded-full
            ${today ? 'bg-primary text-primary-foreground' : inMonth ? 'text-foreground' : 'text-muted-foreground/40'}`}>
            {format(d, 'd')}
          </div>
          <div className="space-y-0.5 overflow-hidden">
            {dayEvents.slice(0, 3).map(ev => {
              const trip = tripMap[ev.trip_id];
              return (
                <div
                  key={ev.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  className="text-[10px] md:text-xs truncate rounded-md px-1.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity text-white font-medium"
                  style={{ backgroundColor: trip?.color || '#6D9F98' }}
                >
                  {!ev.all_day && ev.start_time && (
                    <span className="opacity-80 mr-0.5">{ev.start_time}</span>
                  )}
                  {ev.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-muted-foreground font-medium pl-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </td>
      );
      day = addDays(day, 1);
    }
    rows.push(<tr key={format(week[0].key, 'yyyy-MM-dd')}>{week}</tr>);
  }

  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr>
          {DAYS.map(d => (
            <th key={d} className="text-xs font-medium text-muted-foreground py-2 border-b border-border/40">{d}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}