package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.TripCanvas;
import com.srtk.journeygram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripCanvasRepository extends JpaRepository<TripCanvas, Long> {

    Optional<TripCanvas> findByInviteToken(String inviteToken);

    // Find all canvases where the user is owner or member
    @Query("SELECT DISTINCT c FROM TripCanvas c JOIN c.members m WHERE m.user = :user ORDER BY c.updatedAt DESC")
    List<TripCanvas> findCanvasesByUser(@Param("user") User user);

    List<TripCanvas> findByPublicCanvasTrueOrderByLikesCountDesc();

    Optional<TripCanvas> findByShareToken(String shareToken);
}
