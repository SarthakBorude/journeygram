package com.srtk.journeygram.controller;

import com.srtk.journeygram.dto.CanvasDestinationRequest;
import com.srtk.journeygram.dto.CanvasItemRequest;
import com.srtk.journeygram.dto.CanvasRequest;
import com.srtk.journeygram.model.*;
import com.srtk.journeygram.service.CanvasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/canvas")
@RequiredArgsConstructor
public class CanvasController {

    private final CanvasService canvasService;

    // ── Canvas CRUD ───────────────────────────────────────────

    @PostMapping
    public ResponseEntity<TripCanvas> createCanvas(@Valid @RequestBody CanvasRequest request) {
        return ResponseEntity.ok(canvasService.createCanvas(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TripCanvas>> getMyCanvases(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(canvasService.getMyCanvases(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripCanvas> getCanvasById(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.getCanvasById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripCanvas> updateCanvas(
            @PathVariable Long id,
            @Valid @RequestBody CanvasRequest request) {
        return ResponseEntity.ok(canvasService.updateCanvas(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCanvas(@PathVariable Long id) {
        canvasService.deleteCanvas(id);
        return ResponseEntity.ok(Map.of("message", "Canvas deleted successfully"));
    }

    // ── Invite / Join ─────────────────────────────────────────

    @PostMapping("/join/{token}")
    public ResponseEntity<TripCanvas> joinCanvas(@PathVariable String token) {
        return ResponseEntity.ok(canvasService.joinCanvas(token));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<CanvasMember>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.getMembers(id));
    }

    // ── Destinations ──────────────────────────────────────────

    @PostMapping("/{id}/destinations")
    public ResponseEntity<CanvasDestination> addDestination(
            @PathVariable Long id,
            @Valid @RequestBody CanvasDestinationRequest request) {
        return ResponseEntity.ok(canvasService.addDestination(id, request));
    }

    @DeleteMapping("/destinations/{destId}")
    public ResponseEntity<Map<String, String>> removeDestination(@PathVariable Long destId) {
        canvasService.removeDestination(destId);
        return ResponseEntity.ok(Map.of("message", "Destination removed"));
    }

    @PutMapping("/{id}/destinations/reorder")
    public ResponseEntity<List<CanvasDestination>> reorderDestinations(
            @PathVariable Long id,
            @RequestBody List<Long> orderedIds) {
        return ResponseEntity.ok(canvasService.reorderDestinations(id, orderedIds));
    }

    // ── Items ─────────────────────────────────────────────────

    @PostMapping("/destinations/{destId}/items")
    public ResponseEntity<CanvasItem> addItem(
            @PathVariable Long destId,
            @Valid @RequestBody CanvasItemRequest request) {
        return ResponseEntity.ok(canvasService.addItem(destId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CanvasItem> updateItem(
            @PathVariable Long itemId,
            @RequestBody CanvasItemRequest request) {
        return ResponseEntity.ok(canvasService.updateItem(itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Map<String, String>> removeItem(@PathVariable Long itemId) {
        canvasService.removeItem(itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed"));
    }

    @PutMapping("/destinations/{destId}/items/reorder")
    public ResponseEntity<List<CanvasItem>> reorderItems(
            @PathVariable Long destId,
            @RequestBody List<Long> orderedIds) {
        return ResponseEntity.ok(canvasService.reorderItems(destId, orderedIds));
    }

    // ── AI Suggestions ────────────────────────────────────────

    @PostMapping("/destinations/{destId}/ai-suggest")
    public ResponseEntity<List<Map<String, Object>>> getAiSuggestions(@PathVariable Long destId) {
        return ResponseEntity.ok(canvasService.getAiSuggestions(destId));
    }

    // ── Item Voting ───────────────────────────────────────────

    @PostMapping("/items/{itemId}/vote")
    public ResponseEntity<CanvasItem> toggleItemVote(@PathVariable Long itemId) {
        return ResponseEntity.ok(canvasService.toggleItemVote(itemId));
    }

    // ── Public Invite Info (no auth required) ─────────────────

    @GetMapping("/invite-info/{token}")
    public ResponseEntity<Map<String, Object>> getInviteInfo(@PathVariable String token) {
        return ResponseEntity.ok(canvasService.getCanvasInfoByToken(token));
    }

    // ── Social Features ───────────────────────────────────────

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<TripCanvas> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.toggleVisibility(id));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<TripCanvas> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.toggleCanvasLike(id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CanvasComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.getCanvasComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CanvasComment> postComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(canvasService.postCanvasComment(id, body.get("content")));
    }

    @GetMapping("/explore")
    public ResponseEntity<List<TripCanvas>> getExplore() {
        return ResponseEntity.ok(canvasService.getExploreFeed());
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<TripCanvas> cloneCanvas(@PathVariable Long id) {
        return ResponseEntity.ok(canvasService.cloneCanvas(id));
    }

    @GetMapping("/share/{token}")
    public ResponseEntity<TripCanvas> getByShareToken(@PathVariable String token) {
        return ResponseEntity.ok(canvasService.getCanvasByShareToken(token));
    }
}
