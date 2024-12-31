package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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