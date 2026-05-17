package com.srtk.journeygram.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "canvas_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"canvas_id", "user_id"}))
@Data
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
}
