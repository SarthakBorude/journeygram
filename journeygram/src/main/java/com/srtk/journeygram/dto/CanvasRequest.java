package com.srtk.journeygram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CanvasRequest {
    @NotBlank(message = "Trip name is required")
    @Size(min = 1, max = 100, message = "Trip name must be between 1 and 100 characters")
    private String name;

    private String startDate;   // yyyy-MM-dd
    private String endDate;     // yyyy-MM-dd
    private String startingLocation;
    private String coverImage;
}
