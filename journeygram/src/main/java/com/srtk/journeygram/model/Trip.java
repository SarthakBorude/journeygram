package com.srtk.journeygram.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
@Entity
@Table(name = "trips")
@Data
@AllArgsConstructor
@NoArgsConstructor


public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Integer durationDays; // Duration in days
    
    private double budget;

    @Column(columnDefinition = "JSON")
    private String itinerary; // Store itinerary as JSON string

    @Column(name = "is_public", nullable = false)
    private boolean publicTrip = false;

    @Column(unique = true)
    private String shareToken;

    @Column(nullable = false)
    private Integer likesCount = 0;
    
    @Column(nullable = false)
    private Integer clonesCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
