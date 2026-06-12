package com.srtk.journeygram.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "canvas_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"canvas_id", "user_id"}))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CanvasMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "canvas_id", nullable = false)
    @JsonIgnore
    private TripCanvas canvas;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // OWNER or MEMBER
    @Column(nullable = false)
    private String role;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CanvasMember that = (CanvasMember) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
