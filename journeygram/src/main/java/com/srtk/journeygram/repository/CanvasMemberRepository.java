package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasMember;
import com.srtk.journeygram.model.TripCanvas;
import com.srtk.journeygram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CanvasMemberRepository extends JpaRepository<CanvasMember, Long> {

    Optional<CanvasMember> findByCanvasAndUser(TripCanvas canvas, User user);

    boolean existsByCanvasAndUser(TripCanvas canvas, User user);

    List<CanvasMember> findByCanvas(TripCanvas canvas);
}
