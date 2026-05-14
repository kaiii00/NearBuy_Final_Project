package com.nearbuy.repository;

import com.nearbuy.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Get full conversation between two users
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE (m.senderId = :userId AND m.receiverId = :otherId)
           OR (m.senderId = :otherId AND m.receiverId = :userId)
        ORDER BY m.createdAt ASC
    """)
    List<ChatMessage> findConversation(
            @Param("userId") Long userId,
            @Param("otherId") Long otherId
    );

    // Get all unique contacts the user has chatted with
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.senderId = :userId OR m.receiverId = :userId
        ORDER BY m.createdAt DESC
    """)
    List<ChatMessage> findAllByUser(@Param("userId") Long userId);
}