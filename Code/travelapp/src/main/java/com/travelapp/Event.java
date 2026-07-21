package com.travelapp;
import java.time;
public class Event {
  private static int uID = 0;
  private int ID;
  private String tag;
  private String locationName;
  private String address;
  private LocalDate startDate;
  private LocalDate endTime;
  private LocalTime startTime;
  private LocalTime endTime;
  private String currency;
  private double cost = 0.0;

  public Event(String tag, String locationName, String address, LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime, String currency) {
    this.tag = tag;
    this.locationName = locationName;
    this.address = address;
    this.startDate = startDate;
    this.endDate = endDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.currency = currency;
    this.cost = 0.0;
    ++uID;
    this.ID = uID;
  }

  public Event() {
  }

  public double getCost() {
    return cost;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public LocalTime getStartTime() {
    return startTime;
  }

  public LocalTime getEndTime() {
    return endTime;
  }

  public String getAddress() {
    return address;
  }

  public String getLocationName() {
    return locationName;
  }

  public String getTag() {
    return tag;
  }

  public String getID() {
    return ID;
  }

  public String getCurrency() {
    return currency;
  }

  public void setLocationName(String locationName) {
    this.locationName = locationName;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public void setStartTime(LocalTime startTime) {
    this.startTime = startTime;
  }

  public void setEndTime(LocalTime endTime) {
    this.endTime = endTime;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public void setID(String ID) {
    this.ID = ID;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

}
