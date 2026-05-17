package com.srtk.journeygram.service;

import com.srtk.journeygram.model.LocationCache;
import com.srtk.journeygram.repository.LocationCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeocodingService {

    private final LocationCacheRepository locationCacheRepository;
    private final RestTemplate restTemplate;

    private static long lastRequestTime = 0;
    private static final long MIN_DELAY_MS = 1100; // Slightly more than 1s to be safe

    public Optional<LocationCache> getCoordinates(String locationName, String destination) {
        if (locationName == null || locationName.isEmpty() || locationName.equalsIgnoreCase("N/A")) {
            return Optional.empty();
        }

        // 1. Check Cache
        Optional<LocationCache> cached = locationCacheRepository.findByLocationNameAndDestination(locationName, destination);
        if (cached.isPresent()) {
            log.info("Cache hit for location: {}, {}", locationName, destination);
            return cached;
        }

        // 2. Fetch from Nominatim (with rate limiting)
        return fetchFromNominatim(locationName, destination);
    }

    private synchronized Optional<LocationCache> fetchFromNominatim(String locationName, String destination) {
        // Enforce rate limit
        long currentTime = System.currentTimeMillis();
        long timeSinceLastRequest = currentTime - lastRequestTime;
        if (timeSinceLastRequest < MIN_DELAY_MS) {
            try {
                Thread.sleep(MIN_DELAY_MS - timeSinceLastRequest);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        try {
            String query = locationName + ", " + destination;
            String url = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", query)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .toUriString();

            log.info("Calling Nominatim for: {}", query);
            
            // Nominatim requires a User-Agent header
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Journeygram/1.0 (contact@journeygram.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<Map<String, Object>> response = responseEntity.getBody();
            
            lastRequestTime = System.currentTimeMillis();

            if (response != null && !response.isEmpty()) {
                Map<String, Object> firstResult = response.get(0);
                Double lat = Double.parseDouble(firstResult.get("lat").toString());
                Double lon = Double.parseDouble(firstResult.get("lon").toString());

                LocationCache newEntry = new LocationCache();
                newEntry.setLocationName(locationName);
                newEntry.setDestination(destination);
                newEntry.setLatitude(lat);
                newEntry.setLongitude(lon);

                return Optional.of(locationCacheRepository.save(newEntry));
            }
        } catch (Exception e) {
            log.error("Geocoding failed for {}: {}", locationName, e.getMessage());
        }

        return Optional.empty();
    }

    public List<Map<String, Object>> searchDestinations(String query) {
        if (query == null || query.length() < 2) {
            return List.of();
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", query)
                    .queryParam("format", "json")
                    .queryParam("addressdetails", 1)
                    .queryParam("limit", 5)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Journeygram/1.0 (contact@journeygram.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            return (List<Map<String, Object>>) responseEntity.getBody();
        } catch (Exception e) {
            log.error("Destination search failed for {}: {}", query, e.getMessage());
            return List.of();
        }
    }
}
