package com.srtk.journeygram.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "canvas_likes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "canvas_id"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CanvasLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "canvas_id", nullable = false)
    private TripCanvas canvas;
}
