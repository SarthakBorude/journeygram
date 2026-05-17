package com.srtk.journeygram.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "canvas_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CanvasItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "destination_id", nullable = false)
    @JsonIgnore
    private CanvasDestination destination;

    @Column(nullable = false)
    private String title;

    // PLACE, FOOD, HOTEL, TRANSPORT, NOTE, BOOKING
    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String url;

    private Double costEstimate;

    @ManyToOne
    @JoinColumn(name = "added_by_id", nullable = false)
    private User addedBy;

    @Column(nullable = false)
    private boolean aiSuggestion = false;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // ── Transient vote fields (computed, not persisted) ───────
    @Transient
    private int voteCount;

    @Transient
    private boolean votedByMe;

    @Transient
    private List<String> voterNames = new ArrayList<>();
}
