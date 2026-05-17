package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasItem;
import com.srtk.journeygram.model.CanvasDestination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CanvasItemRepository extends JpaRepository<CanvasItem, Long> {

    List<CanvasItem> findByDestinationOrderBySortOrderAsc(CanvasDestination destination);

    int countByDestination(CanvasDestination destination);
}
