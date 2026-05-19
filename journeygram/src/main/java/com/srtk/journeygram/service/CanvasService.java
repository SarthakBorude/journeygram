package com.srtk.journeygram.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srtk.journeygram.dto.CanvasDestinationRequest;
import com.srtk.journeygram.dto.CanvasItemRequest;
import com.srtk.journeygram.dto.CanvasRequest;
import com.srtk.journeygram.model.*;
import com.srtk.journeygram.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CanvasService {

    private final TripCanvasRepository canvasRepository;
    private final CanvasDestinationRepository destinationRepository;
    private final CanvasItemRepository itemRepository;
    private final CanvasMemberRepository memberRepository;
    private final CanvasItemVoteRepository voteRepository;
    private final CanvasLikeRepository canvasLikeRepository;
    private final CanvasCommentRepository canvasCommentRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

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

    // ── Verify user is a member of the canvas ─────────────────
    private void verifyMembership(TripCanvas canvas, User user) {
        if (!memberRepository.existsByCanvasAndUser(canvas, user)) {
            throw new RuntimeException("You are not a member of this canvas");
        }
    }

    // ── Verify user is the owner of the canvas ────────────────
    private void verifyOwnership(TripCanvas canvas, User user) {
        if (!canvas.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Only the canvas owner can perform this action");
        }
    }

    // ── Create a new canvas ───────────────────────────────────
    public TripCanvas createCanvas(CanvasRequest request) {
        User user = getCurrentUser();

        TripCanvas canvas = new TripCanvas();
        canvas.setName(request.getName());
        canvas.setOwner(user);
        canvas.setStartingLocation(request.getStartingLocation());
        canvas.setInviteToken(UUID.randomUUID().toString());
        canvas.setCoverImage(request.getCoverImage());

        if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
            canvas.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
            canvas.setEndDate(LocalDate.parse(request.getEndDate()));
        }

        canvas = canvasRepository.save(canvas);

        // Add creator as OWNER member
        CanvasMember ownerMember = new CanvasMember();
        ownerMember.setCanvas(canvas);
        ownerMember.setUser(user);
        ownerMember.setRole("OWNER");
        memberRepository.save(ownerMember);

        return canvasRepository.findById(canvas.getId()).orElseThrow();
    }

    // ── Get all canvases for current user ─────────────────────
    public List<TripCanvas> getMyCanvases() {
        User user = getCurrentUser();
        return canvasRepository.findCanvasesByUser(user);
    }

    // ── Get a single canvas by ID (with membership check) ────
    public TripCanvas getCanvasById(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyMembership(canvas, user);

        // Enrich with vote data for items
        enrichCanvasWithVotes(canvas, user);
        
        // Enrich with social data
        enrichCanvasSocial(canvas, user);

        return canvas;
    }

    // ── Get canvas info by invite token (Public preview) ──────
    public Map<String, Object> getCanvasInfoByToken(String inviteToken) {
        TripCanvas canvas = canvasRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new RuntimeException("Invalid invite link"));

        Map<String, Object> info = new HashMap<>();
        info.put("name", canvas.getName());
        info.put("startDate", canvas.getStartDate());
        info.put("endDate", canvas.getEndDate());
        info.put("startingLocation", canvas.getStartingLocation());
        info.put("memberCount", canvas.getMembers() != null ? canvas.getMembers().size() : 0);
        info.put("destinationCount", canvas.getDestinations() != null ? canvas.getDestinations().size() : 0);
        return info;
    }

    // ── Get canvas by share token (Public view) ───────────────
    public TripCanvas getCanvasByShareToken(String token) {
        TripCanvas canvas = canvasRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        // Enrich with social data (use null for user if not logged in)
        User user = null;
        try { user = getCurrentUser(); } catch (Exception e) {}
        enrichCanvasSocial(canvas, user);

        return canvas;
    }

    // ── Toggle visibility ─────────────────────────────────────
    public TripCanvas toggleVisibility(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyOwnership(canvas, user);

        canvas.setPublicCanvas(!canvas.isPublicCanvas());

        if (canvas.isPublicCanvas() && canvas.getShareToken() == null) {
            canvas.setShareToken(UUID.randomUUID().toString());
        }

        return canvasRepository.save(canvas);
    }

    // ── Toggle like on canvas ─────────────────────────────────
    public TripCanvas toggleCanvasLike(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        // Can only like public canvases or ones you are a member of
        if (!canvas.isPublicCanvas()) {
            verifyMembership(canvas, user);
        }

        Optional<CanvasLike> existingLike = canvasLikeRepository.findByUserAndCanvas(user, canvas);
        if (existingLike.isPresent()) {
            canvasLikeRepository.delete(existingLike.get());
            canvas.setLikesCount(Math.max(0, canvas.getLikesCount() - 1));
        } else {
            CanvasLike like = new CanvasLike();
            like.setUser(user);
            like.setCanvas(canvas);
            canvasLikeRepository.save(like);
            canvas.setLikesCount(canvas.getLikesCount() + 1);
        }

        TripCanvas saved = canvasRepository.save(canvas);
        enrichCanvasSocial(saved, user);
        return saved;
    }

    // ── Comments ──────────────────────────────────────────────
    public CanvasComment postCanvasComment(Long canvasId, String content) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        if (!canvas.isPublicCanvas()) {
            verifyMembership(canvas, user);
        }

        CanvasComment comment = new CanvasComment();
        comment.setUser(user);
        comment.setCanvas(canvas);
        comment.setContent(content);

        return canvasCommentRepository.save(comment);
    }

    public List<CanvasComment> getCanvasComments(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));
        return canvasCommentRepository.findByCanvasOrderByCreatedAtDesc(canvas);
    }

    // ── Explore feed ──────────────────────────────────────────
    public List<TripCanvas> getExploreFeed() {
        User user = null;
        try { user = getCurrentUser(); } catch (Exception e) {}
        
        List<TripCanvas> canvases = canvasRepository.findByPublicCanvasTrueOrderByLikesCountDesc();
        
        final User finalUser = user;
        canvases.forEach(c -> enrichCanvasSocial(c, finalUser));
        
        return canvases;
    }

    // ── Clone canvas ──────────────────────────────────────────
    public TripCanvas cloneCanvas(Long canvasId) {
        TripCanvas original = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        if (!original.isPublicCanvas()) {
            verifyMembership(original, user);
        }

        TripCanvas clone = new TripCanvas();
        clone.setName("Clone of " + original.getName());
        clone.setOwner(user);
        clone.setStartingLocation(original.getStartingLocation());
        clone.setStartDate(original.getStartDate());
        clone.setEndDate(original.getEndDate());
        clone.setInviteToken(UUID.randomUUID().toString());
        clone.setPublicCanvas(false); // Clones are private by default
        clone.setCoverImage(original.getCoverImage());

        clone = canvasRepository.save(clone);

        // Copy destinations and items
        for (CanvasDestination dest : original.getDestinations()) {
            CanvasDestination newDest = new CanvasDestination();
            newDest.setCanvas(clone);
            newDest.setName(dest.getName());
            newDest.setSortOrder(dest.getSortOrder());
            newDest = destinationRepository.save(newDest);

            for (CanvasItem item : dest.getItems()) {
                CanvasItem newItem = new CanvasItem();
                newItem.setDestination(newDest);
                newItem.setTitle(item.getTitle());
                newItem.setType(item.getType());
                newItem.setDescription(item.getDescription());
                newItem.setUrl(item.getUrl());
                newItem.setCostEstimate(item.getCostEstimate());
                newItem.setAddedBy(user);
                newItem.setAiSuggestion(item.isAiSuggestion());
                newItem.setSortOrder(item.getSortOrder());
                itemRepository.save(newItem);
            }
        }

        // Add creator as member
        CanvasMember member = new CanvasMember();
        member.setCanvas(clone);
        member.setUser(user);
        member.setRole("OWNER");
        memberRepository.save(member);

        // Increment original clone count
        original.setClonesCount(original.getClonesCount() + 1);
        canvasRepository.save(original);

        return clone;
    }

    private void enrichCanvasSocial(TripCanvas canvas, User user) {
        if (user != null) {
            canvas.setLikedByMe(canvasLikeRepository.existsByUserAndCanvas(user, canvas));
        }
    }

    // ── Enrich all items in a canvas with vote data ────────────
    private void enrichCanvasWithVotes(TripCanvas canvas, User currentUser) {
        // Collect all items across all destinations
        List<CanvasItem> allItems = canvas.getDestinations().stream()
                .flatMap(d -> d.getItems().stream())
                .collect(Collectors.toList());

        if (allItems.isEmpty()) return;

        // Batch-load all votes for these items
        List<CanvasItemVote> allVotes = voteRepository.findByItemIn(allItems);

        // Group votes by item ID
        Map<Long, List<CanvasItemVote>> votesByItem = allVotes.stream()
                .collect(Collectors.groupingBy(v -> v.getItem().getId()));

        // Enrich each item
        for (CanvasItem item : allItems) {
            List<CanvasItemVote> itemVotes = votesByItem.getOrDefault(item.getId(), Collections.emptyList());
            item.setVoteCount(itemVotes.size());
            item.setVotedByMe(itemVotes.stream().anyMatch(v -> v.getUser().getId().equals(currentUser.getId())));
            item.setVoterNames(itemVotes.stream()
                    .map(v -> v.getUser().getName() != null ? v.getUser().getName() : v.getUser().getEmail())
                    .collect(Collectors.toList()));
        }
    }

    // ── Join canvas via invite token ──────────────────────────
    public TripCanvas joinCanvas(String inviteToken) {
        TripCanvas canvas = canvasRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new RuntimeException("Invalid invite link"));

        User user = getCurrentUser();

        // Already a member? Just return the canvas
        if (memberRepository.existsByCanvasAndUser(canvas, user)) {
            return canvas;
        }

        CanvasMember member = new CanvasMember();
        member.setCanvas(canvas);
        member.setUser(user);
        member.setRole("MEMBER");
        memberRepository.save(member);

        return canvas;
    }

    // ── Get canvas members ────────────────────────────────────
    public List<CanvasMember> getMembers(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyMembership(canvas, user);

        return memberRepository.findByCanvas(canvas);
    }

    // ── Delete canvas (owner only) ────────────────────────────
    public void deleteCanvas(Long canvasId) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyOwnership(canvas, user);

        canvasRepository.delete(canvas);
    }

    // ── Add destination to canvas ─────────────────────────────
    public CanvasDestination addDestination(Long canvasId, CanvasDestinationRequest request) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyMembership(canvas, user);

        int nextOrder = destinationRepository.countByCanvas(canvas);

        CanvasDestination destination = new CanvasDestination();
        destination.setCanvas(canvas);
        destination.setName(request.getName());
        destination.setSortOrder(nextOrder);

        return destinationRepository.save(destination);
    }

    // ── Remove destination ────────────────────────────────────
    public void removeDestination(Long destinationId) {
        CanvasDestination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        User user = getCurrentUser();
        verifyMembership(destination.getCanvas(), user);

        destinationRepository.delete(destination);
    }

    // ── Add item to destination ───────────────────────────────
    public CanvasItem addItem(Long destinationId, CanvasItemRequest request) {
        CanvasDestination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        User user = getCurrentUser();
        verifyMembership(destination.getCanvas(), user);

        int nextOrder = itemRepository.countByDestination(destination);

        CanvasItem item = new CanvasItem();
        item.setDestination(destination);
        item.setTitle(request.getTitle());
        item.setType(request.getType());
        item.setDescription(request.getDescription());
        item.setUrl(request.getUrl());
        item.setCostEstimate(request.getCostEstimate());
        item.setAddedBy(user);
        item.setAiSuggestion(false);
        item.setSortOrder(nextOrder);

        return itemRepository.save(item);
    }

    // ── Update item ───────────────────────────────────────────
    public CanvasItem updateItem(Long itemId, CanvasItemRequest request) {
        CanvasItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User user = getCurrentUser();
        verifyMembership(item.getDestination().getCanvas(), user);

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getType() != null) item.setType(request.getType());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getUrl() != null) item.setUrl(request.getUrl());
        if (request.getCostEstimate() != null) item.setCostEstimate(request.getCostEstimate());

        return itemRepository.save(item);
    }

    // ── Remove item ───────────────────────────────────────────
    public void removeItem(Long itemId) {
        CanvasItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User user = getCurrentUser();
        verifyMembership(item.getDestination().getCanvas(), user);

        itemRepository.delete(item);
    }

    // ── Reorder destinations ──────────────────────────────────
    public List<CanvasDestination> reorderDestinations(Long canvasId, List<Long> orderedIds) {
        TripCanvas canvas = canvasRepository.findById(canvasId)
                .orElseThrow(() -> new RuntimeException("Canvas not found"));

        User user = getCurrentUser();
        verifyMembership(canvas, user);

        for (int i = 0; i < orderedIds.size(); i++) {
            CanvasDestination dest = destinationRepository.findById(orderedIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            dest.setSortOrder(i);
            destinationRepository.save(dest);
        }

        return destinationRepository.findByCanvasOrderBySortOrderAsc(canvas);
    }

    // ── Reorder items within a destination ────────────────────
    public List<CanvasItem> reorderItems(Long destinationId, List<Long> orderedIds) {
        CanvasDestination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        User user = getCurrentUser();
        verifyMembership(destination.getCanvas(), user);

        for (int i = 0; i < orderedIds.size(); i++) {
            CanvasItem item = itemRepository.findById(orderedIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Item not found"));
            item.setSortOrder(i);
            itemRepository.save(item);
        }

        return itemRepository.findByDestinationOrderBySortOrderAsc(destination);
    }

    // ── Get AI suggestions for a destination ──────────────────
    public List<Map<String, Object>> getAiSuggestions(Long destinationId) {
        CanvasDestination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        User user = getCurrentUser();
        verifyMembership(destination.getCanvas(), user);

        TripCanvas canvas = destination.getCanvas();

        String prompt = String.format(
            "You are an expert travel planner. " +
            "I'm planning a trip and need suggestions for things to do in %s. " +
            "The trip starts from %s. " +
            "Please suggest exactly 5 items for this destination across these categories: " +
            "places to visit, food spots, hotels/stays, and transport options. " +
            "Respond ONLY in valid JSON as an array of objects with this structure: " +
            "[{\"title\": \"<name>\", \"type\": \"<PLACE|FOOD|HOTEL|TRANSPORT>\", " +
            "\"description\": \"<brief description>\", \"costEstimate\": <number in INR or null>}]. " +
            "Make suggestions practical and specific to %s. No extra text, only valid JSON array.",
            destination.getName(),
            canvas.getStartingLocation() != null ? canvas.getStartingLocation() : "India",
            destination.getName()
        );

        String response = callGemini(prompt);

        try {
            List<Map<String, Object>> suggestions = objectMapper.readValue(
                response, new TypeReference<List<Map<String, Object>>>() {}
            );
            return suggestions;
        } catch (Exception e) {
            log.error("Failed to parse AI suggestions: {}", e.getMessage());
            throw new RuntimeException("Failed to generate AI suggestions. Please try again.");
        }
    }

    // ── Toggle vote on an item ────────────────────────────────
    public CanvasItem toggleItemVote(Long itemId) {
        CanvasItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User user = getCurrentUser();
        verifyMembership(item.getDestination().getCanvas(), user);

        Optional<CanvasItemVote> existingVote = voteRepository.findByItemAndUser(item, user);

        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
        } else {
            CanvasItemVote vote = new CanvasItemVote();
            vote.setItem(item);
            vote.setUser(user);
            voteRepository.save(vote);
        }

        // Re-fetch and enrich the item with updated vote data
        List<CanvasItemVote> votes = voteRepository.findByItem(item);
        item.setVoteCount(votes.size());
        item.setVotedByMe(votes.stream().anyMatch(v -> v.getUser().getId().equals(user.getId())));
        item.setVoterNames(votes.stream()
                .map(v -> v.getUser().getName() != null ? v.getUser().getName() : v.getUser().getEmail())
                .collect(Collectors.toList()));

        return item;
    }

    // ── Gemini API call (reused pattern from TripService) ─────
    private String callGemini(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                "gemini-flash-latest:generateContent?key=" + geminiApiKey;

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
