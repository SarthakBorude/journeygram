package com.srtk.journeygram.dto;

import lombok.Data;

@Data
public class CanvasItemRequest {
    private String title;
    private String type;         // PLACE, FOOD, HOTEL, TRANSPORT, NOTE, BOOKING
    private String description;  // optional
    private String url;          // optional
    private Double costEstimate; // optional
}
