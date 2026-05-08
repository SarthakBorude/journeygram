package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.Trip;
import com.srtk.journeygram.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface TripRepository extends JpaRepository<Trip, Long> {

     // Get all trips belonging to a specific user
    List<Trip> findByUser(User user);

    // Get all public trips sorted by likes (for explore feed)
    List<Trip> findByPublicTripTrueOrderByLikesCountDesc();

    // Find a trip by its share token (for public link)
    Optional<Trip> findByShareToken(String shareToken);


    
}
