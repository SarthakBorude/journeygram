package com.srtk.journeygram.controller;

import com.srtk.journeygram.dto.TripRequest;
import com.srtk.journeygram.model.Trip;
import com.srtk.journeygram.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    // Generate a new trip using Gemini AI
    @PostMapping("/generate")
    public ResponseEntity<Trip> generateTrip(@RequestBody TripRequest request) {
        Trip trip = tripService.generateTrip(request);
        return ResponseEntity.ok(trip);
    }

    // Get all trips for logged in user
    @GetMapping("/my")
    public ResponseEntity<List<Trip>> getMyTrips() {
        return ResponseEntity.ok(tripService.getMyTrips());
    }

    // Get a single trip by ID (must belong to logged in user)
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    // Get explore feed — all public trips
    @GetMapping("/explore")
    public ResponseEntity<List<Trip>> explore() {
        return ResponseEntity.ok(tripService.getExploreFeed());
    }

    // Toggle a trip between public and private
    @PatchMapping("/{id}/visibility")
    public ResponseEntity<Trip> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.toggleVisibility(id));
    }

    // Get a trip by its public share token — no login needed
    @GetMapping("/share/{token}")
    public ResponseEntity<Trip> getTripByToken(@PathVariable String token) {
        return ResponseEntity.ok(tripService.getTripByShareToken(token));
    }

    // Delete a trip
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok("Trip deleted successfully");
    }
}