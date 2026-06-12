package com.srtk.journeygram.controller;

import com.srtk.journeygram.model.Destination;
import com.srtk.journeygram.service.DestinationService;
import com.srtk.journeygram.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;
    private final GeocodingService geocodingService;

    @GetMapping("/info")
    public ResponseEntity<Destination> getInfo(@RequestParam String name) {
        return ResponseEntity.ok(destinationService.getDestinationInfo(name));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Destination>> getTrending() {
        return ResponseEntity.ok(destinationService.getTrending());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(@RequestParam String query) {
        return ResponseEntity.ok(geocodingService.searchDestinations(query));
    }
}
