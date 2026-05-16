package com.nearbuy.controller;

import com.nearbuy.dto.ChatDTO;
import com.nearbuy.model.ChatMessage;
import com.nearbuy.model.User;
import com.nearbuy.repository.ChatMessageRepository;
import com.nearbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatDTO.SendMessage payload, Principal principal) {
        User sender = userRepository.findByUsername(principal.getName()).orElseThrow();
        User receiver = userRepository.findById(payload.getReceiverId()).orElseThrow();

        ChatMessage msg = ChatMessage.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(payload.getMessage() != null ? payload.getMessage() : "")
                .mediaUrl(payload.getMediaUrl())
                .mediaType(payload.getMediaType())
                .build();

        chatMessageRepository.save(msg);
        ChatDTO.MessageResponse response = toResponse(msg, sender.getUsername());

        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", response);
    }

    // REST POST — send text message
    @PostMapping("/api/chat")
    public ChatDTO.MessageResponse sendMessageRest(
            @RequestBody ChatDTO.SendMessage payload,
            Authentication auth) {

        Long myId = Long.parseLong((String) auth.getPrincipal());
        User sender = userRepository.findById(myId).orElseThrow();
        User receiver = userRepository.findById(payload.getReceiverId()).orElseThrow();

        ChatMessage msg = ChatMessage.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(payload.getMessage() != null ? payload.getMessage() : "")
                .mediaUrl(payload.getMediaUrl())
                .mediaType(payload.getMediaType())
                .build();

        chatMessageRepository.save(msg);
        ChatDTO.MessageResponse response = toResponse(msg, sender.getUsername());

        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", response);

        return response;
    }

    // Upload image/video
    @PostMapping("/api/chat/upload")
    public ResponseEntity<java.util.Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains("."))
                ext = original.substring(original.lastIndexOf("."));

            String filename = UUID.randomUUID() + ext;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String mediaType = file.getContentType() != null && file.getContentType().startsWith("video") ? "video" : "image";
            String url = "/api/chat/uploads/" + filename;

            return ResponseEntity.ok(java.util.Map.of("url", url, "mediaType", mediaType));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Serve uploaded files
    @GetMapping("/api/chat/uploads/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/chat/{otherId}")
    public List<ChatDTO.MessageResponse> getConversation(
            @PathVariable Long otherId,
            Authentication auth) {

        Long myId = Long.parseLong((String) auth.getPrincipal());
        User me = userRepository.findById(myId).orElseThrow();
        List<ChatMessage> messages = chatMessageRepository.findConversation(me.getId(), otherId);

        return messages.stream().map(m -> {
            String senderUsername = userRepository.findById(m.getSenderId())
                    .map(User::getUsername).orElse("unknown");
            return toResponse(m, senderUsername);
        }).collect(Collectors.toList());
    }

    @GetMapping("/api/chat")
    public List<ChatDTO.MessageResponse> getInbox(Authentication auth) {

        Long myId = Long.parseLong((String) auth.getPrincipal());
        User me = userRepository.findById(myId).orElseThrow();
        List<ChatMessage> messages = chatMessageRepository.findAllByUser(me.getId());

        return messages.stream().map(m -> {
            String senderUsername = userRepository.findById(m.getSenderId())
                    .map(User::getUsername).orElse("unknown");
            return toResponse(m, senderUsername);
        }).collect(Collectors.toList());
    }

    private ChatDTO.MessageResponse toResponse(ChatMessage m, String senderUsername) {
        return ChatDTO.MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSenderId())
                .senderUsername(senderUsername)
                .receiverId(m.getReceiverId())
                .message(m.getMessage())
                .mediaUrl(m.getMediaUrl())
                .mediaType(m.getMediaType())
                .createdAt(m.getCreatedAt())
                .build();
    }
}