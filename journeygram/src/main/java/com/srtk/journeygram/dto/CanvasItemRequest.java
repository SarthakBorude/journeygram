package com.srtk.journeygram.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CanvasItemRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Type is required")
    private String type;         // PLACE, FOOD, HOTEL, TRANSPORT, NOTE, BOOKING

    private String description;  // optional
    private String url;          // optional
    private Double costEstimate; // optional
}
