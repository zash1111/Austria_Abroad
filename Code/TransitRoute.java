import java.util.*;
public class TransitRoute extends Event {
  private final ArrayList<String> transportMethods = new ArrayList<String>("Taxi", "Bus", "Tram", "Train", "Ferry");
  /// on the line above you have to have a sequence of statments
  /// list.add("whatever") to properly add items to an arraylist
  /// PROPERLLY IMPLEMNT LIST.ADD("SOMETHING") REPEATEDLY FOR EACH ITEM
  private String transport;
  private Event startPoint;
  private Event destination;

  public TransitRoute(String transport, Event startPoint, Event destination) { //Fix this here
    /// you have not specifically referenced the EVent class constructor which  
    /// this current is extending from so this cunstroctor is defaulting to 
    /// Event.java cunstroctor without passing anything that was needed
    /// PROPERLY IMPLEMENT SUPPER(PARAM1, PARAM2, ...)
    if (transportMethods.contains(transport)) {
      this.transport = transport;
    }
    else {
      throw new IllegalArgumentException("Invalid transport type!");
    }
    this.startPoint = startPoint;
    this.destination = destination;
  }

  public String getTransport() {
    return transport;
  }

  public Event getStartPoint() {
    return startPoint;
  }

  public Event getDestination() {
    return destination;
  }

  public void setTransport(String transport) {
    if (transportMethods.contains(transport)) {
      this.transport = transport;
    }
    else {
      throw new IllegalArgumentException("Invalid transport type!");
    }
  }

  public void setStartPoint(Event startPoint) {
    this.startPoint = startPoint;
  }

  public void setDestination(Event destination) {
    this.destination = destination;
  }

  public double findBestRoute() {
    /*
    Finds and returns the best route between the startPoint and destination using the preferred transport type;
    If no such route with the transport type exists, return -1;
    */
    return -1;
  }

}
