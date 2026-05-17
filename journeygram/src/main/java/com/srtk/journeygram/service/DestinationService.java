package com.srtk.journeygram.service;

import com.srtk.journeygram.model.Destination;
import com.srtk.journeygram.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api.key}")
    private String groqApiKey;

    public Destination getDestinationInfo(String name) {
        Optional<Destination> existing = destinationRepository.findByNameIgnoreCase(name);
        
        if (existing.isPresent()) {
            Destination dest = existing.get();
            dest.setSearchCount(dest.getSearchCount() + 1);
            return destinationRepository.save(dest);
        }

        // If not found, fetch from Groq
        String jsonInfo = callGroqForInfo(name);
        
        Destination destination = new Destination();
        destination.setName(name);
        destination.setDataJson(jsonInfo);
        destination.setSearchCount(1);
        destination.setLastUpdated(LocalDateTime.now());
        
        // Simple description extraction from JSON for the card view
        destination.setDescription("Explore attractions, food, and culture in " + name);
        
        return destinationRepository.save(destination);
    }

    public List<Destination> getTrending() {
        return destinationRepository.findTop10ByOrderBySearchCountDesc();
    }

    private String callGroqForInfo(String cityName) {
        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = String.format(
            "Act as a professional travel guide. Provide a comprehensive, detailed guide for %s. " +
            "Respond ONLY in valid JSON with this structure: " +
            "{\"name\": \"%s\", \"summary\": \"<rich 2-3 paragraph overview>\", " +
            "\"bestTimeToVisit\": \"<detailed season info>\", " +
            "\"see\": [{\"name\": \"<place>\", \"content\": \"<detailed why-to-visit description>\", \"address\": \"<location>\"}], " +
            "\"do\": [{\"name\": \"<activity>\", \"content\": \"<detailed description>\"}], " +
            "\"eat\": [{\"name\": \"<dish or restaurant>\", \"content\": \"<detailed description>\", \"price\": \"<est cost>\"}], " +
            "\"culturalTips\": \"<essential local etiquette>\"}. " +
            "Provide at least 5 items for see, do, and eat. Ensure all descriptions are thorough and professional.",
            cityName, cityName
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        body.put("response_format", Map.of("type", "json_object"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            return (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
        } catch (Exception e) {
            System.err.println("Groq Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch info from Groq: " + e.getMessage());
        }
    }
}
