package com.travelapp;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;


public class EventDataOps {
 
    private static final String INSERT_SQL =
        "INSERT INTO EVENT (EVENT_NAME, START_TIME, START_DATE, END_TIME, END_DATE, " +
        "LOCATION, CURRENCY, AMOUNT, EVENT_TAG) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
 
    private static final String SELECT_BY_ID_SQL =
        "SELECT EVENT_ID, EVENT_NAME, START_TIME, START_DATE, END_TIME, END_DATE, " +
        "LOCATION, CURRENCY, AMOUNT, EVENT_TAG FROM EVENT WHERE EVENT_ID = ?";
 
    private static final String SELECT_ALL_SQL =
        "SELECT EVENT_ID, EVENT_NAME, START_TIME, START_DATE, END_TIME, END_DATE, " +
        "LOCATION, CURRENCY, AMOUNT, EVENT_TAG FROM EVENT ORDER BY EVENT_ID";
 
    private static final String UPDATE_SQL =
        "UPDATE EVENT SET EVENT_NAME = ?, START_TIME = ?, START_DATE = ?, END_TIME = ?, " +
        "END_DATE = ?, LOCATION = ?, CURRENCY = ?, AMOUNT = ?, EVENT_TAG = ? WHERE EVENT_ID = ?";
 
    private static final String DELETE_SQL =
        "DELETE FROM EVENT WHERE EVENT_ID = ?";
 
    /** Inserts a new event and returns the generated EVENT_ID. */
    public int insertEvent(Connection conn, Event event) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {
            bindEventFields(ps, event);
            ps.executeUpdate();
 
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    int newId = keys.getInt(1);
                    event.setEventId(newId);
                    return newId;
                }
                throw new SQLException("Insert succeeded but no generated key was returned.");
            }
        }
    }
 
    /** Fetches a single event by id, or null if none exists. */
    public Event getEventById(Connection conn, int eventId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(SELECT_BY_ID_SQL)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }
 
    /** Fetches every event, ordered by id. */
    public List<Event> getAllEvents(Connection conn) throws SQLException {
        List<Event> events = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(SELECT_ALL_SQL);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                events.add(mapRow(rs));
            }
        }
        return events;
    }
 
    /** Updates every column for the given event's id. Returns true if a row was changed. */
    public boolean updateEvent(Connection conn, Event event) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(UPDATE_SQL)) {
            int nextIndex = bindEventFields(ps, event);
            ps.setInt(nextIndex, event.getEventId());
            return ps.executeUpdate() > 0;
        }
    }
 
    /** Deletes an event by id. Returns true if a row was removed. */
    public boolean deleteEvent(Connection conn, int eventId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(DELETE_SQL)) {
            ps.setInt(1, eventId);
            return ps.executeUpdate() > 0;
        }
    }
 
    /**
     * Binds the 9 non-id columns (shared by INSERT and UPDATE) starting at
     * parameter index 1, and returns the next free index (10) so UPDATE can
     * bind the WHERE clause's id right after.
     */
    private int bindEventFields(PreparedStatement ps, Event event) throws SQLException {
        ps.setString(1, event.getEventName());
        ps.setTime(2, Time.valueOf(event.getStartTime()));
        ps.setDate(3, Date.valueOf(event.getStartDate()));
        ps.setTime(4, Time.valueOf(event.getEndTime()));
        ps.setDate(5, Date.valueOf(event.getEndDate()));
        ps.setObject(6, event.getLocation());   // H2 OTHER column: serialized Java object
        ps.setString(7, event.getCurrency());
        ps.setBigDecimal(8, event.getAmount());
        ps.setObject(9, event.getEventTag()); //need to change this if we switch to string storage for event tag
        return 10;
    }
 
    /**
     * Used as helper to translate SQL result to event object
     * @param rs SQL query result
     * @return an event class Object 
     * @throws SQLException
     */
    private Event mapRow(ResultSet rs) throws SQLException {
        Event event = new Event();
        event.setEventId(rs.getInt("EVENT_ID"));
        event.setEventName(rs.getString("EVENT_NAME"));
        event.setStartTime(rs.getTime("START_TIME").toLocalTime());
        event.setStartDate(rs.getDate("START_DATE").toLocalDate());
        event.setEndTime(rs.getTime("END_TIME").toLocalTime());
        event.setEndDate(rs.getDate("END_DATE").toLocalDate());
        event.setLocation((Event.Location) rs.getObject("LOCATION"));
        event.setCurrency(rs.getString("CURRENCY"));
        event.setAmount(rs.getBigDecimal("AMOUNT"));
        event.setEventTag((String) rs.getObject("EVENT_TAG"));
        return event;
    }
}
