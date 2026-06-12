package com.srtk.journeygram.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    private String avatarUrl;

    @Size(max = 300, message = "Bio must be under 300 characters")
    private String bio;

    // BACKPACKER, LUXURY, ADVENTURE, CULTURAL, FOODIE
    private String travellerType;
}
