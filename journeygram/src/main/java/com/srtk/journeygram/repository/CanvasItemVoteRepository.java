package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.CanvasItem;
import com.srtk.journeygram.model.CanvasItemVote;
import com.srtk.journeygram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CanvasItemVoteRepository extends JpaRepository<CanvasItemVote, Long> {

    Optional<CanvasItemVote> findByItemAndUser(CanvasItem item, User user);

    boolean existsByItemAndUser(CanvasItem item, User user);

    int countByItem(CanvasItem item);

    List<CanvasItemVote> findByItem(CanvasItem item);

    List<CanvasItemVote> findByItemIn(List<CanvasItem> items);
}
