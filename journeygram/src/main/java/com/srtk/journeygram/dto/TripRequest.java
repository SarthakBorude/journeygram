package com.srtk.journeygram.dto;

import lombok.Data;

import java.util.List;

@Data
public class TripRequest {
    private String destination;
    private Integer durationDays;
    private double budget;
    private boolean isPublic;
    private String travelStyle;       // Backpacker, Budget, Moderate, Luxury
    private List<String> interests;   // Culture, Food, Adventure, Nature, etc.
    private Integer travelers;        // Number of travelers
    private String notes;             // Special notes from user
}
