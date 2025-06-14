package com.example.demo.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Obj is a simple data transfer object (DTO) used to send and receive messages
 * between the client and server via WebSockets.
 */
@Data // Generates getters, setters, toString, equals, and hashCode methods
@AllArgsConstructor // Generates a constructor with all fields
@NoArgsConstructor  // Generates a no-argument constructor
public class Obj {

    /**
     * Type of the message (e.g., "url", "slider", "p" for play/pause)
     */
    private String type;

    /**
     * Value associated with the message (e.g., video URL or slider value)
     */
    private String value;
}
