import java.util.*;
public class Itinerary extends Event {
  /*
  Event objects should each have a destination (String), date (month, day, year [Integer array]), time (hours, 
  minutes [Integer array]), cost (double), and other fields...
  */
  private ArrayList<Event> events;
  private double cost = 0.0;

  public Itinerary() {
    this.events = new ArrayList<Event>();
    for (Event e : events) {
      // NOTE: getCost() method in the Event class must return the cost of the event!!
      this.cost += e.getCost();
    }
  }

  public Event getLatestEvent() {
    return events.get(-1);
  }
  
  public ArrayList<Event> getEvents() {
    return events;
  }

  public double getTotalCost() {
    return cost;
  }

  public void addEvent(Event event) {
    events.add(event);
    cost += event.getCost();
  }

  public void removeEvent(Event event) {
    events.remove(event);
    cost -= event.getCost();
  }

  public void removeLatestEvent() {
    cost -= this.getLatestEvent().getCost();
    events.remove(-1);
  }

  public void clearEvents() {
    events = events.clear();
    cost = 0.0;
  }

  
    
}
