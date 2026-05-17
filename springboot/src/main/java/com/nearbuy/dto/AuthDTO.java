package com.nearbuy.dto;

import com.nearbuy.model.User;
import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        private User.Role role = User.Role.buyer;
        private String address;
        private String contact;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

   @Data
    public static class CompleteProfileRequest {
        private Long userId;
        private String username;
        private String role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private Long userId;
        private String username;
        private String email;
        private String role;
    }
}