package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasLike;
import com.srtk.journeygram.model.TripCanvas;
import com.srtk.journeygram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CanvasLikeRepository extends JpaRepository<CanvasLike, Long> {
    Optional<CanvasLike> findByUserAndCanvas(User user, TripCanvas canvas);
    boolean existsByUserAndCanvas(User user, TripCanvas canvas);
    long countByCanvas(TripCanvas canvas);
}
