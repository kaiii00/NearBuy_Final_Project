package com.nearbuy.dto;

import lombok.*;
import java.time.LocalDateTime;

public class ChatDTO {

    @Data
    public static class SendMessage {
        private Long receiverId;
        private String message;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MessageResponse {
        private Long id;
        private Long senderId;
        private String senderUsername;
        private Long receiverId;
        private String message;
        private LocalDateTime createdAt;
    }
}