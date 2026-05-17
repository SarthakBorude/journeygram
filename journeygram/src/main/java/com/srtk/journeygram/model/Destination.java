package com.srtk.journeygram.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "destinations")
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String dataJson; // Full structured data as JSON string

    private int searchCount = 0;
    
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
