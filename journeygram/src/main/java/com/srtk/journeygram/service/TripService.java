package com.srtk.journeygram.service;

import com.srtk.journeygram.dto.TripRequest;
import com.srtk.journeygram.model.Trip;
import com.srtk.journeygram.model.User;
import com.srtk.journeygram.repository.TripRepository;
import com.srtk.journeygram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // ── Get currently logged in user ──────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Generate itinerary using Gemini ───────────────────────
    public Trip generateTrip(TripRequest request) {
        User user = getCurrentUser();

        // Build a rich, detailed prompt
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are an expert travel planner. ");
        promptBuilder.append(String.format(
                "Create a detailed %d-day travel itinerary for %s with a budget of %.0f INR",
                request.getDurationDays(), request.getDestination(), request.getBudget()));

        if (request.getTravelers() != null && request.getTravelers() > 0) {
            promptBuilder.append(String.format(" for %d traveler(s)", request.getTravelers()));
        }
        promptBuilder.append(". ");

        if (request.getTravelStyle() != null && !request.getTravelStyle().isEmpty()) {
            promptBuilder.append(String.format("Travel style: %s. ", request.getTravelStyle()));
        }

        if (request.getInterests() != null && !request.getInterests().isEmpty()) {
            promptBuilder.append(String.format("Interests: %s. ", String.join(", ", request.getInterests())));
        }

        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            promptBuilder.append(String.format("Special requirements: %s. ", request.getNotes()));
        }

        promptBuilder.append(
                "Respond ONLY in valid JSON with this exact structure: " +
                "{\"destination\": \"<name>\", \"duration_days\": <n>, \"budget_inr\": <n>, " +
                "\"days\": [{\"day\": 1, " +
                "\"morning\": {\"activity\": \"<description>\", \"cost\": <number>, \"location\": \"<place>\"}, " +
                "\"afternoon\": {\"activity\": \"<description>\", \"cost\": <number>, \"location\": \"<place>\"}, " +
                "\"evening\": {\"activity\": \"<description>\", \"cost\": <number>, \"location\": \"<place>\"}, " +
                "\"tip\": \"<useful tip for this day>\"}]}. " +
                String.format("Fill in all %d days with realistic activities and costs that fit the budget. ", request.getDurationDays()) +
                "Include local food recommendations, must-visit spots, and transportation tips. " +
                "No extra text, only valid JSON."
        );

        String prompt = promptBuilder.toString();

        // Call Gemini API
        String itinerary = callGemini(prompt);

        // Build and save the trip
        Trip trip = new Trip();
        trip.setUser(user);
        trip.setDestination(request.getDestination());
        trip.setDurationDays(request.getDurationDays());
        trip.setBudget(request.getBudget());
        trip.setItinerary(itinerary);
        trip.setPublicTrip(request.isPublic());
        
        if (request.isPublic()) {
            trip.setShareToken(UUID.randomUUID().toString());
        }
        
        trip.setLikesCount(0);
        trip.setClonesCount(0);

        return tripRepository.save(trip);
    }

    // ── Get all trips for logged in user ──────────────────────
    public List<Trip> getMyTrips() {
        User user = getCurrentUser();
        return tripRepository.findByUser(user);
    }

    // ── Get a single trip by ID (with ownership check) ───────
    public Trip getTripById(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't own this trip");
        }

        return trip;
    }

    // ── Get explore feed (all public trips) ───────────────────
    public List<Trip> getExploreFeed() {
        return tripRepository.findByPublicTripTrueOrderByLikesCountDesc();
    }

    // ── Toggle visibility ─────────────────────────────────────
    public Trip toggleVisibility(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't own this trip");
        }

        trip.setPublicTrip(!trip.isPublicTrip());

        // Generate share token when making public
        if (trip.isPublicTrip() && trip.getShareToken() == null) {
            trip.setShareToken(UUID.randomUUID().toString());
        }

        return tripRepository.save(trip);
    }

    // ── Get trip by share token (public) ──────────────────────
    public Trip getTripByShareToken(String token) {
        return tripRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    // ── Delete a trip ─────────────────────────────────────────
    public void deleteTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = getCurrentUser();
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't own this trip");
        }

        tripRepository.delete(trip);
    }

    // ── Gemini API call ───────────────────────────────────────
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                "gemini-flash-latest:generateContent?key=" + geminiApiKey;

        // Build request body
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<?, ?> responseBody = response.getBody();

            if (responseBody == null || !responseBody.containsKey("candidates")) {
                throw new RuntimeException("Empty or invalid response from Gemini API");
            }

            List<?> candidates = (List<?>) responseBody.get("candidates");
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> contentMap = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) contentMap.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            String raw = (String) firstPart.get("text");

            // Clean up markdown if Gemini adds it
            raw = raw.replace("```json", "").replace("```", "").trim();
            return raw;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage());
        }
    }
}
