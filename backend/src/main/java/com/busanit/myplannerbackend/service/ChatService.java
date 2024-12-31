package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.repository.ChatRepository;
import com.busanit.myplannerbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.busanit.myplannerbackend.entity.Message;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    // ChatRoom 관련 메서드
    public ChatRoom createChatRoom(ChatRoomRequest request) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setParticipants(request.getParticipants());
        chatRoom.setChatroomTitle(request.getChatroomTitle());
        chatRoom.setChatRoomType("INDIVIDUAL");
        chatRoom.setCreatedAt(LocalDateTime.now());

        return chatRepository.save(chatRoom);
    }

    public List<ChatRoom> getUserChatRooms(String email) {
        return chatRepository.findByParticipantsEmailOrderByCreatedAtDesc(email);
    }

    public ChatRoom getChatRoom(String chatRoomId) {
        return chatRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    public void updateLastMessage(String chatRoomId, String message) {
        ChatRoom chatRoom = getChatRoom(chatRoomId);
        chatRoom.setLastMessage(message);
        chatRepository.save(chatRoom);
    }

    // Message 관련 메서드
    public List<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);
    }

    public Message saveMessage(Message message) {
        Message savedMessage = messageRepository.save(message);
        // 메세지 저장 후 채팅방의 마지막 메세지 업데이트
        updateLastMessage(message.getChatRoomId(), message.getContents());
        return savedMessage;
    }
    
}
