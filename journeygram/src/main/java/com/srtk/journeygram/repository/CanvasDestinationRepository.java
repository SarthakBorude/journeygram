package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasDestination;
import com.srtk.journeygram.model.TripCanvas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CanvasDestinationRepository extends JpaRepository<CanvasDestination, Long> {

    List<CanvasDestination> findByCanvasOrderBySortOrderAsc(TripCanvas canvas);

    int countByCanvas(TripCanvas canvas);
}
