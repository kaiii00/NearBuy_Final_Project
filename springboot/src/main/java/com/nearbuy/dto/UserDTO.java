package com.nearbuy.dto;

import com.nearbuy.model.User;
import lombok.*;

public class UserDTO {

    @Data
    public static class UpdateRequest {
        private String email;
        private String address;
        private String contact;
        private String currentPassword;
        private String newPassword;
        private String displayName;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private String username;
        private String displayName;
        private String email;
        private String role;
        private String address;
        private String contact;
        private String profilePhoto;

        public static ProfileResponse from(User user) {
            return ProfileResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .displayName(user.getDisplayName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .address(user.getAddress())
                    .contact(user.getContact())
                    .profilePhoto(user.getProfilePhoto())
                    .build();
        }
    }
}