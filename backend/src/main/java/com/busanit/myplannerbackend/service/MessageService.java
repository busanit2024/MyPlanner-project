package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRoomService chatRoomService;

    @Transactional
    public Message saveMessage(Message message) {
        // 메시지 저장
        Message savedMessage = messageRepository.save(message);

        // 채팅방의 마지막 메시지 정보 업데이트
        ChatRoom chatRoom = chatRoomService.findById(message.getChatRoomId());
        chatRoom.setLastMessage(message.getContents());
        chatRoom.setLastMessageAt(message.getSendTime());
        chatRoomService.save(chatRoom);

        return savedMessage;
    }

    public List<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);
    }
}