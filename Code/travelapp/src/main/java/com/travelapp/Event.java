package com.travelapp;
public class Event {
  private String locationName;
  private String address;
  private int[] date = new int[3];
  private int[] time = new int[2];
  private double cost = 0.0;

  public Event(String locationName, String address, int[] date, int[] time) {
    this.locationName = locationName;
    this.address = address;
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

  public String getAddress() {
    return address;
  }

  public String getLocationName() {
    return locationName;
  }

  public void setLocationName(String locationName) {
    this.locationName = locationName; // fixed locationName variable typo(was this.location(<-location variable dosnt exist to i am assuming it was typo) = locationName)
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public void setDate(int[] date) {
    this.date = date;
  }

  public void setTime(int[] time) {
    this.time = time;
  }

}
