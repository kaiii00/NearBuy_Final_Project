package com.nearbuy.controller;

import com.nearbuy.dto.ChatDTO;
import com.nearbuy.model.ChatMessage;
import com.nearbuy.model.User;
import com.nearbuy.repository.ChatMessageRepository;
import com.nearbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatDTO.SendMessage payload, Principal principal) {
        User sender = userRepository.findByUsername(principal.getName()).orElseThrow();
        User receiver = userRepository.findById(payload.getReceiverId()).orElseThrow();

        ChatMessage msg = ChatMessage.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(payload.getMessage())
                .build();

        chatMessageRepository.save(msg);
        ChatDTO.MessageResponse response = toResponse(msg, sender.getUsername());

        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", response);
    }

    // REST POST endpoint for sending messages
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
                .message(payload.getMessage())
                .build();

        chatMessageRepository.save(msg);
        ChatDTO.MessageResponse response = toResponse(msg, sender.getUsername());

        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", response);

        return response;
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
                .createdAt(m.getCreatedAt())
                .build();
    }
}