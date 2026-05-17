package com.srtk.journeygram.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "location_cache", indexes = {
    @Index(name = "idx_location_dest", columnList = "locationName, destination")
})
@Data
public class LocationCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String locationName;
    private String destination; // The city/country context
    private Double latitude;
    private Double longitude;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
