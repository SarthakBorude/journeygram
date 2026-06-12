package com.srtk.journeygram.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CanvasDestinationRequest {
    @NotBlank(message = "Destination name is required")
    private String name;
}
