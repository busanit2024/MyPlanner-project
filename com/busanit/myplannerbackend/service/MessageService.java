package com.busanit.myplannerbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
    
    public List<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);
    }
} 