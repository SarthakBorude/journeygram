package com.srtk.journeygram.dto;

import lombok.Data;

@Data
public class CanvasRequest {
    private String name;
    private String startDate;   // yyyy-MM-dd
    private String endDate;     // yyyy-MM-dd
    private String startingLocation;
    private String coverImage;
}
