public class Event {
  private String location;
  private int[] date = new int[3];
  private int[] time = new int[2];
  private double cost = 0.0;

  public Event(String location, int[] date, int[] time) {
    this.location = location;
    this.date = date;
    this.time = time;
    this.cost = 0.0;
  }

  public double getCost() {
    return cost;
  }

  public int[] getDate() {
    return date;
  }

  public int[] getTime() {
    return time;
  }

  public String location() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public void setDate(int[] date) {
    this.date = date;
  }

  public void setTime(int[] time) {
    this.time = time;
  }

}
