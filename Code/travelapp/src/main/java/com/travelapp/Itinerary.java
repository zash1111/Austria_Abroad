package com.travelapp;
import java.util.*;
public class Itinerary extends Event {
  private ArrayList<Event> events;
  private double cost = 0.0;

  public Itinerary() { //FIX THIS SAME PROBLEM AS TRANSITROUTE.JAVA
    this.events = new ArrayList<Event>();
    for (Event e : events) {
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
