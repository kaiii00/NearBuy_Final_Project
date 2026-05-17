package com.nearbuy.security;

import com.nearbuy.model.User;
import com.nearbuy.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        boolean isNewUser = false;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            isNewUser = true;
            user = User.builder()
                    .username(email.split("@")[0] + "_" + System.currentTimeMillis())
                    .email(email)
                    .password("")
                    .displayName(name)
                    .role(User.Role.buyer)
                    .build();
            userRepository.save(user);
        }
        String token = jwtUtils.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token
                + "&userId=" + user.getId()
                + "&username=" + user.getUsername()
                + "&role=" + user.getRole().name()
                + "&email=" + user.getEmail()
                + "&isNewUser=" + isNewUser);
    }
}