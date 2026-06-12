package com.srtk.journeygram.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "canvas_items")
@Getter
@Setter
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CanvasItem that = (CanvasItem) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
