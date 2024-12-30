package com.busanit.myplannerbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Required;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom createChatRoom(List<String> participantIds, String type) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setParticipants(participantIds.stream()
            .map(userId -> {
                ChatRoom.Participant participant = new ChatRoom.Participant();
                participant.setUserId(userId);
                participant.setStatus("ACTIVE");
                return participant;
            })
            .collect(Collectors.toList()));
        
        chatRoom.setChatRoomType(type);
        chatRoom.setCreatedAt(LocalDateTime.now());
        chatRoom.setChatRoomTitle(type.equals("INDIVIDUAL") ? "1:1 채팅" : "그룹 채팅");
        
        return chatRoomRepository.save(chatRoom);
    }

    public void leaveChat(String chatRoomId, String userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
            
        chatRoom.getParticipants().stream()
            .filter(p -> p.getUserId().equals(userId))
            .findFirst()
            .ifPresent(participant -> participant.setStatus("LEFT"));
            
        chatRoomRepository.save(chatRoom);
    }

    public void joinChat(String chatRoomId, String userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
            
        Optional<ChatRoom.Participant> existingParticipant = chatRoom.getParticipants().stream()
            .filter(p -> p.getUserId().equals(userId))
            .findFirst();
            
        if (existingParticipant.isPresent()) {
            existingParticipant.get().setStatus("ACTIVE");
        } else {
            ChatRoom.Participant newParticipant = new ChatRoom.Participant();
            newParticipant.setUserId(userId);
            newParticipant.setStatus("ACTIVE");
            chatRoom.getParticipants().add(newParticipant);
        }
        
        chatRoomRepository.save(chatRoom);
    }
} 