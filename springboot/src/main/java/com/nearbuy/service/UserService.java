package com.nearbuy.service;

import com.nearbuy.dto.UserDTO;
import com.nearbuy.exception.BadRequestException;
import com.nearbuy.exception.ResourceNotFoundException;
import com.nearbuy.model.User;
import com.nearbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO.ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return UserDTO.ProfileResponse.from(user);
    }

    public UserDTO.ProfileResponse updateProfile(Long userId, UserDTO.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(userId)) {
                    throw new BadRequestException("Email is already in use");
                }
            });
            user.setEmail(request.getEmail());
        }

        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getContact() != null) user.setContact(request.getContact());
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("Current password is required to change password");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
            }
            if (request.getNewPassword().length() < 8) {
                throw new BadRequestException("New password must be at least 8 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return UserDTO.ProfileResponse.from(userRepository.save(user));
    }

    public void updateProfilePhoto(Long userId, String photoUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setProfilePhoto(photoUrl);
        userRepository.save(user);
    }
}