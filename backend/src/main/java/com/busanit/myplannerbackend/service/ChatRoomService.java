package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom findById(String roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(()-> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    public List<ChatRoom> findByParticipantEmail(String email) {
        return chatRoomRepository.findByParticipantsEmailContaining(email);
    }

    public ChatRoom createChatRoom(List<Participant> participants, String title) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setParticipants(participants);
        chatRoom.setChatroomTitle(title);
        chatRoom.setCreatedAt(LocalDateTime.now());
        chatRoom.setChatRoomType(participants.size() == 2 ? "1:1" : "GROUP");

        return chatRoomRepository.save(chatRoom);
    }
}
