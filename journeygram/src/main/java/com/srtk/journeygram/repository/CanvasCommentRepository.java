package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasComment;
import com.srtk.journeygram.model.TripCanvas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CanvasCommentRepository extends JpaRepository<CanvasComment, Long> {
    List<CanvasComment> findByCanvasOrderByCreatedAtDesc(TripCanvas canvas);
}
