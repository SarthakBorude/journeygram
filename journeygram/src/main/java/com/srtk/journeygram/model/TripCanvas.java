package com.srtk.journeygram.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "trip_canvases")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TripCanvas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    private LocalDate startDate;

    private LocalDate endDate;

    private String startingLocation;

    @Column(unique = true, nullable = false)
    private String inviteToken;

    @OneToMany(mappedBy = "canvas", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<CanvasDestination> destinations = new ArrayList<>();

    @OneToMany(mappedBy = "canvas", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CanvasMember> members = new ArrayList<>();

    @Column(name = "is_public", nullable = false)
    private boolean publicCanvas = false;

    @Column(unique = true)
    private String shareToken;

    @Lob
    @Column(name = "cover_image", columnDefinition = "LONGTEXT")
    private String coverImage;

    @Column(nullable = false)
    private Integer likesCount = 0;

    @Column(nullable = false)
    private Integer clonesCount = 0;

    @Transient
    private boolean likedByMe = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TripCanvas that = (TripCanvas) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
