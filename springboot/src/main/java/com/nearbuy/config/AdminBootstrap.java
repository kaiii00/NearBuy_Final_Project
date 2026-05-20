package com.nearbuy.config;

import com.nearbuy.model.User;
import com.nearbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${nearbuy.bootstrap-admin.enabled:true}")
    private boolean enabled;

    @Value("${nearbuy.bootstrap-admin.username:admin}")
    private String username;

    @Value("${nearbuy.bootstrap-admin.email:admin@nearbuy.com}")
    private String email;

    @Value("${nearbuy.bootstrap-admin.password:Admin12345}")
    private String password;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        if (userRepository.existsByUsername(username)) {
            return;
        }
        userRepository.save(User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(User.Role.admin)
                .address("NearBuy HQ")
                .contact("0000000000")
                .build());
        log.info("Default admin account created (username: {})", username);
    }
}
